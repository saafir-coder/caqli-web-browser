import * as ChildProcess from "node:child_process";
import * as FS from "node:fs";
import * as Path from "node:path";
import * as Util from "node:util";

import type {
  CaqliDesktopAgentRequest,
  CaqliDesktopAgentResponse,
  CaqliDesktopCreditStatus,
  CaqliDesktopModelId,
  CaqliDesktopToolEvent,
} from "@t3tools/contracts";

import { resolveWorkspacePath } from "./caqliWorkspace";

const execAsync = Util.promisify(ChildProcess.exec);
const CAQLI_API_BASE = process.env.CAQLI_API_BASE?.trim() || "https://caqli.ai";
const MAX_TOOL_OUTPUT_CHARS = 12_000;

type ChatRole = "system" | "user" | "assistant" | "tool";

interface ChatMessage {
  role: ChatRole;
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: ReadonlyArray<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface ModelHarness {
  apiModel: string;
  label: string;
  maxSteps: number;
  supportsRunCommand: boolean;
  requiresPaidCredits: boolean;
  systemPrompt: string;
}

const HARNESSES: Record<CaqliDesktopModelId, ModelHarness> = {
  "llama-3.3-70b": {
    apiModel: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B",
    maxSteps: 10,
    supportsRunCommand: false,
    requiresPaidCredits: false,
    systemPrompt: [
      "You are Caqli AI Desktop, a coding agent for Somali developers.",
      "Work step by step.",
      "You can inspect and edit files inside the selected workspace.",
      "For file creation, use edit_file with the full content you want written.",
      "Prefer list_files and view_file before editing.",
      "Keep responses concise and practical.",
    ].join(" "),
  },
  "hermes-3": {
    apiModel: "nousresearch/hermes-3-llama-3.1-405b:free",
    label: "Hermes 3",
    maxSteps: 15,
    supportsRunCommand: true,
    requiresPaidCredits: false,
    systemPrompt: [
      "You are Caqli AI Desktop, a coding agent for Somali developers.",
      "You may inspect files, edit files, and run safe workspace commands when useful.",
      "Use tools deliberately and explain the result briefly at the end.",
      "For file creation, use edit_file with the full content you want written.",
    ].join(" "),
  },
  "claude-sonnet": {
    apiModel: "anthropic/claude-sonnet-4-6",
    label: "Claude Sonnet",
    maxSteps: 20,
    supportsRunCommand: true,
    requiresPaidCredits: true,
    systemPrompt: [
      "You are Caqli AI Desktop, a coding agent for Somali developers.",
      "You may inspect files, edit files, and run workspace commands.",
      "Prefer the smallest effective change.",
      "For file creation, use edit_file with the full content you want written.",
      "Summarize the work clearly when finished.",
    ].join(" "),
  },
};

function buildTools(model: ModelHarness) {
  const tools: Array<Record<string, unknown>> = [
    {
      type: "function",
      function: {
        name: "list_files",
        description: "List files or directories inside the selected workspace.",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path inside the workspace. Use . for the root.",
            },
            recursive: {
              type: "boolean",
              description: "When true, walk child directories recursively.",
            },
          },
          required: ["path"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "view_file",
        description: "Read the contents of one file inside the selected workspace.",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative file path inside the workspace.",
            },
          },
          required: ["path"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "edit_file",
        description:
          "Create or replace a file inside the selected workspace using the exact content you provide.",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative file path inside the workspace.",
            },
            content: {
              type: "string",
              description: "The complete content to write to the file.",
            },
          },
          required: ["path", "content"],
        },
      },
    },
  ];

  if (model.supportsRunCommand) {
    tools.push({
      type: "function",
      function: {
        name: "run_command",
        description:
          "Run one shell command inside the workspace when file inspection alone is not enough.",
        parameters: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "Shell command to execute inside the workspace directory.",
            },
          },
          required: ["command"],
        },
      },
    });
  }

  return tools;
}

function truncateToolOutput(value: string): string {
  if (value.length <= MAX_TOOL_OUTPUT_CHARS) {
    return value;
  }
  return `${value.slice(0, MAX_TOOL_OUTPUT_CHARS)}\n\n[Truncated tool output]`;
}

function summarizeToolResult(tool: CaqliDesktopToolEvent["tool"], output: string): string {
  const firstLine = output.split("\n").find((line) => line.trim().length > 0) ?? "";
  const summary = firstLine.trim();
  if (summary.length > 0) {
    return `${tool}: ${summary.slice(0, 120)}`;
  }
  return `${tool}: completed`;
}

async function fetchCredits(apiKey: string): Promise<CaqliDesktopCreditStatus | null> {
  const response = await fetch(`${CAQLI_API_BASE}/api/credits`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Credit check failed (${response.status}).`);
  }
  return (await response.json()) as CaqliDesktopCreditStatus;
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveToolCallPath(workspaceDir: string, rawPath: unknown): string {
  return resolveWorkspacePath(workspaceDir, asTrimmedString(rawPath) || ".");
}

function listFilesAtPath(workspaceDir: string, rawPath: unknown, recursive: boolean): string {
  const absolutePath = resolveToolCallPath(workspaceDir, rawPath);
  const stat = FS.statSync(absolutePath);
  if (!stat.isDirectory()) {
    throw new Error("list_files requires a directory path.");
  }

  const lines: string[] = [];
  const visit = (directoryPath: string, depth: number) => {
    const entries = FS.readdirSync(directoryPath, { withFileTypes: true })
      .filter((entry) => ![".git", "node_modules", ".next", ".turbo", "dist", "build"].includes(entry.name))
      .sort((left, right) => {
        if (left.isDirectory() !== right.isDirectory()) {
          return left.isDirectory() ? -1 : 1;
        }
        return left.name.localeCompare(right.name);
      })
      .slice(0, 200);

    for (const entry of entries) {
      const nextPath = Path.join(directoryPath, entry.name);
      const relativePath = Path.relative(workspaceDir, nextPath) || ".";
      lines.push(`${"  ".repeat(depth)}${entry.isDirectory() ? "[dir]" : "[file]"} ${relativePath}`);
      if (recursive && entry.isDirectory()) {
        visit(nextPath, depth + 1);
      }
    }
  };

  visit(absolutePath, 0);
  return lines.length > 0 ? lines.join("\n") : "Directory is empty.";
}

function viewFileAtPath(workspaceDir: string, rawPath: unknown): string {
  const absolutePath = resolveToolCallPath(workspaceDir, rawPath);
  const stat = FS.statSync(absolutePath);
  if (!stat.isFile()) {
    throw new Error("view_file requires a file path.");
  }
  return truncateToolOutput(FS.readFileSync(absolutePath, "utf8"));
}

function editFileAtPath(workspaceDir: string, rawPath: unknown, rawContent: unknown): string {
  const absolutePath = resolveToolCallPath(workspaceDir, rawPath);
  const content = typeof rawContent === "string" ? rawContent : "";
  FS.mkdirSync(Path.dirname(absolutePath), { recursive: true });
  FS.writeFileSync(absolutePath, content, "utf8");
  return `Wrote ${Path.relative(workspaceDir, absolutePath) || Path.basename(absolutePath)} (${content.length} chars).`;
}

async function runCommandInWorkspace(workspaceDir: string, rawCommand: unknown): Promise<string> {
  const command = asTrimmedString(rawCommand);
  if (command.length === 0) {
    throw new Error("Command is required.");
  }
  const result = await execAsync(command, {
    cwd: workspaceDir,
    shell: "/bin/zsh",
    maxBuffer: 512 * 1024,
    timeout: 15_000,
  });
  const stdout = result.stdout.trim();
  const stderr = result.stderr.trim();
  return truncateToolOutput(
    [`$ ${command}`, stdout.length > 0 ? stdout : null, stderr.length > 0 ? stderr : null]
      .filter((value): value is string => value !== null)
      .join("\n"),
  );
}

async function executeToolCall(input: {
  workspaceDir: string;
  toolName: string;
  args: Record<string, unknown>;
  model: ModelHarness;
}): Promise<string> {
  switch (input.toolName) {
    case "list_files":
      return listFilesAtPath(
        input.workspaceDir,
        input.args.path,
        input.args.recursive === true,
      );
    case "view_file":
      return viewFileAtPath(input.workspaceDir, input.args.path);
    case "edit_file":
      return editFileAtPath(input.workspaceDir, input.args.path, input.args.content);
    case "run_command":
      if (!input.model.supportsRunCommand) {
        throw new Error("This model harness does not allow shell commands.");
      }
      return await runCommandInWorkspace(input.workspaceDir, input.args.command);
    default:
      throw new Error(`Unsupported tool call: ${input.toolName}`);
  }
}

function normalizeAssistantMessage(rawMessage: Record<string, unknown>): ChatMessage {
  const toolCalls = Array.isArray(rawMessage.tool_calls)
    ? rawMessage.tool_calls
        .map((toolCall) => {
          if (!toolCall || typeof toolCall !== "object") {
            return null;
          }
          const candidate = toolCall as {
            id?: unknown;
            type?: unknown;
            function?: { name?: unknown; arguments?: unknown };
          };
          if (
            typeof candidate.id !== "string" ||
            candidate.type !== "function" ||
            typeof candidate.function?.name !== "string" ||
            typeof candidate.function?.arguments !== "string"
          ) {
            return null;
          }
          return {
            id: candidate.id,
            type: "function" as const,
            function: {
              name: candidate.function.name,
              arguments: candidate.function.arguments,
            },
          };
        })
        .filter((toolCall): toolCall is NonNullable<typeof toolCall> => toolCall !== null)
    : [];

  return {
    role: "assistant",
    content: typeof rawMessage.content === "string" ? rawMessage.content : null,
    ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
  };
}

async function requestModelCompletion(input: {
  apiKey: string;
  messages: readonly ChatMessage[];
  model: ModelHarness;
}) {
  const response = await fetch(`${CAQLI_API_BASE}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model.apiModel,
      messages: input.messages,
      tools: buildTools(input.model),
      tool_choice: "auto",
      stream: false,
      temperature: 0.2,
    }),
  });

  if (response.status === 401) {
    throw new Error("Invalid API key.");
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Caqli model request failed (${response.status}): ${detail}`);
  }
  return (await response.json()) as {
    choices?: Array<{
      message?: Record<string, unknown>;
    }>;
  };
}

export async function getCaqliCredits(apiKey: string): Promise<CaqliDesktopCreditStatus | null> {
  return await fetchCredits(apiKey);
}

export async function runCaqliAgent(input: {
  apiKey: string | null;
  request: CaqliDesktopAgentRequest;
}): Promise<CaqliDesktopAgentResponse> {
  if (!input.apiKey) {
    return {
      message: "Add your Caqli API key first.",
      toolEvents: [],
      credits: null,
      blockedReason: "missing_api_key",
    };
  }

  const model = HARNESSES[input.request.model];
  const workspaceDir = input.request.workspaceDir.trim();
  if (workspaceDir.length === 0) {
    throw new Error("Workspace folder is required.");
  }

  let credits: CaqliDesktopCreditStatus | null = null;
  if (model.requiresPaidCredits) {
    credits = await fetchCredits(input.apiKey);
    if (!credits) {
      return {
        message: "Your saved Caqli API key is invalid. Save it again and retry.",
        toolEvents: [],
        credits: null,
        blockedReason: "invalid_api_key",
      };
    }
    if (credits.paidCredits <= 0) {
      return {
        message: "You need credits to use Claude. Buy on Telegram: t.me/abdillahiAI",
        toolEvents: [],
        credits,
        blockedReason: "insufficient_credits",
      };
    }
  } else {
    credits = await fetchCredits(input.apiKey).catch(() => null);
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: model.systemPrompt,
    },
    {
      role: "user",
      content: input.request.prompt,
    },
  ];
  const toolEvents: CaqliDesktopToolEvent[] = [];

  for (let step = 0; step < model.maxSteps; step += 1) {
    const completion = await requestModelCompletion({
      apiKey: input.apiKey,
      messages,
      model,
    });
    const rawAssistantMessage = completion.choices?.[0]?.message;
    if (!rawAssistantMessage || typeof rawAssistantMessage !== "object") {
      throw new Error("Model response did not include an assistant message.");
    }

    const assistantMessage = normalizeAssistantMessage(rawAssistantMessage);
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return {
        message: assistantMessage.content?.trim() || `${model.label} finished without a text reply.`,
        toolEvents,
        credits,
      };
    }

    for (const toolCall of toolCalls) {
      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      } catch {
        parsedArgs = {};
      }

      try {
        const output = await executeToolCall({
          workspaceDir,
          toolName: toolCall.function.name,
          args: parsedArgs,
          model,
        });
        toolEvents.push({
          id: crypto.randomUUID(),
          tool: toolCall.function.name as CaqliDesktopToolEvent["tool"],
          status: "success",
          summary: summarizeToolResult(
            toolCall.function.name as CaqliDesktopToolEvent["tool"],
            output,
          ),
        });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: output,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toolEvents.push({
          id: crypto.randomUUID(),
          tool: toolCall.function.name as CaqliDesktopToolEvent["tool"],
          status: "error",
          summary: `${toolCall.function.name}: ${message}`,
        });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Tool error: ${message}`,
        });
      }
    }
  }

  return {
    message:
      "I reached the maximum number of tool steps for this task. Try a smaller request or continue from the latest file state.",
    toolEvents,
    credits,
  };
}

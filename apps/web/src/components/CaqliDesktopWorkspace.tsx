import type {
  CaqliDesktopAgentRequest,
  CaqliDesktopAuthState,
  CaqliDesktopCreditStatus,
  CaqliDesktopModelId,
  CaqliDesktopToolEvent,
  CaqliDesktopWorkspaceEntry,
} from "@t3tools/contracts";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  SendHorizonalIcon,
  TerminalSquareIcon,
  Trash2Icon,
  WandSparklesIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";

import { isElectron } from "../env";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { cn } from "~/lib/utils";

const MODEL_OPTIONS: ReadonlyArray<{
  id: CaqliDesktopModelId;
  label: string;
  tier: "Free" | "Paid";
  description: string;
}> = [
  {
    id: "llama-3.3-70b",
    label: "Llama 3.3 70B",
    tier: "Free",
    description: "Simple coding tasks with file read/write tools.",
  },
  {
    id: "hermes-3",
    label: "Hermes 3",
    tier: "Free",
    description: "Smarter free model with shell command support.",
  },
  {
    id: "claude-sonnet",
    label: "Claude Sonnet",
    tier: "Paid",
    description: "Best coding model. Requires credits.",
  },
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolEvents?: readonly CaqliDesktopToolEvent[];
};

function readStoredWorkspaceDir(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem("caqli.desktop.workspaceDir") ?? "";
}

function writeStoredWorkspaceDir(workspaceDir: string): void {
  if (typeof window === "undefined") {
    return;
  }
  if (workspaceDir.trim().length === 0) {
    window.localStorage.removeItem("caqli.desktop.workspaceDir");
    return;
  }
  window.localStorage.setItem("caqli.desktop.workspaceDir", workspaceDir);
}

function readStoredModel(): CaqliDesktopModelId {
  if (typeof window === "undefined") {
    return "hermes-3";
  }
  const rawValue = window.localStorage.getItem("caqli.desktop.model");
  return MODEL_OPTIONS.some((option) => option.id === rawValue)
    ? (rawValue as CaqliDesktopModelId)
    : "hermes-3";
}

function writeStoredModel(model: CaqliDesktopModelId): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("caqli.desktop.model", model);
}

function TreeNode(props: {
  entry: CaqliDesktopWorkspaceEntry;
  selectedPath: string | null;
  onOpenFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(props.entry.kind === "directory");

  if (props.entry.kind === "file") {
    return (
      <button
        type="button"
        onClick={() => props.onOpenFile(props.entry.path)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/6",
          props.selectedPath === props.entry.path ? "bg-white/8 text-white" : "text-zinc-300",
        )}
      >
        <span className="text-[11px] text-zinc-500">{"{}"}</span>
        <span className="truncate">{props.entry.name}</span>
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/6"
      >
        <ChevronRightIcon className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        {expanded ? (
          <FolderOpenIcon className="size-4 text-amber-300" />
        ) : (
          <FolderIcon className="size-4 text-amber-300" />
        )}
        <span className="truncate">{props.entry.name}</span>
      </button>
      {expanded && props.entry.children?.length ? (
        <div className="ml-4 space-y-1 border-zinc-800/80 pl-1">
          {props.entry.children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              selectedPath={props.selectedPath}
              onOpenFile={props.onOpenFile}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CreditsSummary({ credits }: { credits: CaqliDesktopCreditStatus | null }) {
  if (!credits) {
    return <span className="text-xs text-zinc-500">No credit data yet</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
      <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1">
        Free: {Math.max(credits.freeDailyLimit - credits.freeUsedToday, 0)} / {credits.freeDailyLimit}
      </span>
      <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1">
        Paid credits: {credits.paidCredits}
      </span>
    </div>
  );
}

export function CaqliDesktopWorkspace() {
  const [authState, setAuthState] = useState<CaqliDesktopAuthState>({
    connected: false,
    maskedKey: null,
  });
  const [credits, setCredits] = useState<CaqliDesktopCreditStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [workspaceDir, setWorkspaceDir] = useState(readStoredWorkspaceDir);
  const [workspaceEntries, setWorkspaceEntries] = useState<readonly CaqliDesktopWorkspaceEntry[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [model, setModel] = useState<CaqliDesktopModelId>(readStoredModel);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.id === model) ?? MODEL_OPTIONS[1]!,
    [model],
  );

  async function refreshCredits() {
    if (!window.desktopBridge) {
      return;
    }
    try {
      setCredits(await window.desktopBridge.getCaqliCredits());
    } catch {
      setCredits(null);
    }
  }

  async function refreshAuthState() {
    if (!window.desktopBridge) {
      return;
    }
    setAuthState(await window.desktopBridge.getCaqliAuthState());
  }

  async function loadWorkspaceTree(nextWorkspaceDir: string) {
    if (!window.desktopBridge || nextWorkspaceDir.trim().length === 0) {
      setWorkspaceEntries([]);
      return;
    }
    const snapshot = await window.desktopBridge.readCaqliWorkspaceTree(nextWorkspaceDir);
    setWorkspaceDir(snapshot.rootPath);
    setWorkspaceEntries(snapshot.entries);
    writeStoredWorkspaceDir(snapshot.rootPath);
  }

  useEffect(() => {
    if (!isElectron || !window.desktopBridge) {
      return;
    }

    void Promise.all([refreshAuthState(), refreshCredits()]);
    if (workspaceDir.trim().length > 0) {
      void loadWorkspaceTree(workspaceDir).catch(() => {
        setWorkspaceEntries([]);
      });
    }
  }, []);

  async function handleSaveApiKey() {
    if (!window.desktopBridge || apiKeyInput.trim().length === 0) {
      return;
    }
    setErrorMessage(null);
    try {
      const nextState = await window.desktopBridge.setCaqliApiKey(apiKeyInput.trim());
      setAuthState(nextState);
      setApiKeyInput("");
      await refreshCredits();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save API key.");
    }
  }

  async function handleClearApiKey() {
    if (!window.desktopBridge) {
      return;
    }
    setErrorMessage(null);
    const nextState = await window.desktopBridge.clearCaqliApiKey();
    setAuthState(nextState);
    setCredits(null);
  }

  async function handlePickWorkspace() {
    if (!window.desktopBridge) {
      return;
    }
    const pickedDirectory = await window.desktopBridge.pickFolder(
      workspaceDir ? { initialPath: workspaceDir } : undefined,
    );
    if (!pickedDirectory) {
      return;
    }

    setErrorMessage(null);
    setSelectedFilePath(null);
    setSelectedFileContent("");
    await loadWorkspaceTree(pickedDirectory);
  }

  async function handleOpenFile(filePath: string) {
    if (!window.desktopBridge || workspaceDir.trim().length === 0) {
      return;
    }
    setSelectedFilePath(filePath);
    setSelectedFileContent(await window.desktopBridge.readCaqliFile(workspaceDir, filePath));
  }

  async function handleSendPrompt() {
    if (!window.desktopBridge || prompt.trim().length === 0 || loading) {
      return;
    }

    const request: CaqliDesktopAgentRequest = {
      prompt: prompt.trim(),
      model,
      workspaceDir,
    };

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: request.prompt,
    };
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await window.desktopBridge.sendCaqliAgentMessage(request);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: result.message,
          toolEvents: result.toolEvents,
        },
      ]);
      setCredits(result.credits);
      if (workspaceDir.trim().length > 0) {
        await loadWorkspaceTree(workspaceDir);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The agent request failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!isElectron || !window.desktopBridge) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <aside className="flex w-[320px] min-w-[320px] flex-col border-r border-border/70 bg-zinc-950/70">
        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                Caqli Desktop
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Standalone agent workspace</h2>
            </div>
            <WandSparklesIcon className="size-5 text-violet-300" />
          </div>

          <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-zinc-200">
                <KeyRoundIcon className="size-4 text-violet-300" />
                <span>{authState.connected ? authState.maskedKey : "No API key saved"}</span>
              </div>
              {authState.connected ? (
                <Button variant="ghost" size="sm" onClick={handleClearApiKey}>
                  <Trash2Icon className="size-4" />
                </Button>
              ) : null}
            </div>

            {!authState.connected ? (
              <Fragment>
                <Input
                  type="password"
                  value={apiKeyInput}
                  onChange={(event) => setApiKeyInput(event.target.value)}
                  placeholder="Paste your caqli_* API key"
                />
                <Button className="w-full" onClick={handleSaveApiKey}>
                  Save API key
                </Button>
              </Fragment>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2Icon className="size-3.5" />
                Connected
              </div>
            )}
            <CreditsSummary credits={credits} />
          </div>

          <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Workspace folder</p>
                <p className="text-xs text-zinc-500">
                  {workspaceDir || "Pick a local project folder"}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={handlePickWorkspace}>
                Pick folder
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-1">
            {workspaceEntries.length > 0 ? (
              workspaceEntries.map((entry) => (
                <TreeNode
                  key={entry.path}
                  entry={entry}
                  selectedPath={selectedFilePath}
                  onOpenFile={handleOpenFile}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-4 text-sm text-zinc-500">
                Pick a folder to load the file tree.
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="min-h-[180px] space-y-2 px-4 py-3">
          <p className="text-xs font-medium tracking-[0.14em] text-zinc-500 uppercase">
            File preview
          </p>
          {selectedFilePath ? (
            <Fragment>
              <p className="truncate text-sm text-zinc-300">{selectedFilePath}</p>
              <div className="max-h-[180px] overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 p-3 font-mono text-xs text-zinc-300">
                <pre className="whitespace-pre-wrap">{selectedFileContent}</pre>
              </div>
            </Fragment>
          ) : (
            <p className="text-sm text-zinc-500">Select a file to preview it here.</p>
          )}
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-white">{selectedModel.label}</p>
            <p className="text-xs text-zinc-500">{selectedModel.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {MODEL_OPTIONS.map((option) => (
              <Button
                key={option.id}
                variant={model === option.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setModel(option.id);
                  writeStoredModel(option.id);
                }}
              >
                {option.label}
                <span className="ml-1 text-[10px] uppercase opacity-75">{option.tier}</span>
              </Button>
            ))}
          </div>
        </header>

        <ScrollArea className="flex-1 px-5 py-5">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-border/70 bg-card/30 px-6 py-7">
                <p className="text-lg font-semibold text-white">Ready to work on local code</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Pick a folder, save your `caqli_*` key, choose a model, then ask for concrete
                  coding changes like “list all ts files”, “create hello.txt”, or “refactor this
                  component”.
                </p>
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-3xl rounded-2xl px-4 py-3 text-sm shadow-sm",
                  message.role === "user"
                    ? "self-end bg-violet-600 text-white"
                    : "self-start border border-border/70 bg-card/40 text-zinc-100",
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.toolEvents?.length ? (
                  <div className="mt-3 space-y-2 rounded-xl border border-white/8 bg-black/18 p-3 text-xs text-zinc-300">
                    {message.toolEvents.map((toolEvent) => (
                      <div key={toolEvent.id} className="flex items-start gap-2">
                        <TerminalSquareIcon className="mt-0.5 size-3.5 shrink-0 text-zinc-500" />
                        <span>
                          <span
                            className={cn(
                              "mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase",
                              toolEvent.status === "success"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-red-500/15 text-red-300",
                            )}
                          >
                            {toolEvent.status}
                          </span>
                          {toolEvent.summary}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className="self-start rounded-2xl border border-border/70 bg-card/40 px-4 py-3 text-sm text-zinc-300">
                <span className="inline-flex items-center gap-2">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Running agent loop...
                </span>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <div className="border-t border-border/70 px-5 py-4">
          <div className="mx-auto flex w-full max-w-4xl gap-3">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendPrompt();
                }
              }}
              rows={3}
              placeholder="Ask the agent to inspect or modify the selected workspace..."
              className="min-h-[88px] bg-zinc-900"
            />
            <Button
              className="h-auto min-w-[120px]"
              onClick={() => void handleSendPrompt()}
              disabled={loading || prompt.trim().length === 0}
            >
              <span className="flex items-center gap-2">
                <SendHorizonalIcon className="size-4" />
                Run
              </span>
            </Button>
          </div>
          <div className="mx-auto mt-2 flex w-full max-w-4xl items-center justify-between text-xs text-zinc-500">
            <span>Enter to send. Shift+Enter for a new line.</span>
            <a
              href="https://t.me/abdillahiAI"
              target="_blank"
              rel="noreferrer"
              className="text-violet-300 transition-colors hover:text-violet-200"
            >
              Buy credits on Telegram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

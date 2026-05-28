export enum ProviderKind {
  Codex = "codex",
  Cursor = "cursor",
  Claude = "claude",
}

export type AgentProvider = {
  kind: ProviderKind;
  label: string;
  description: string;
  /** When true, the UI must not collect credentials for this provider. */
  comingSoon: boolean;
};

export const AGENT_PROVIDERS: readonly AgentProvider[] = [
  {
    kind: ProviderKind.Codex,
    label: "Codex",
    description: "OpenAI Codex app-server. Usage bills to your OpenAI account.",
    comingSoon: false,
  },
  {
    kind: ProviderKind.Cursor,
    label: "Cursor",
    description: "Cursor agent runtime. Coming soon.",
    comingSoon: true,
  },
  {
    kind: ProviderKind.Claude,
    label: "Claude Code",
    description: "Anthropic Claude Code. Coming soon.",
    comingSoon: true,
  },
] as const;

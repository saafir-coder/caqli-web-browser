export const HOSTED_PENDING_STARTER_PROMPT_KEY = "caqli.hostedPendingStarterPrompt";

/** Stitch “AI Agent Workspace Flow” starter prompts (mobile canonical). */
export const HOSTED_STARTER_CHIPS = [
  {
    id: "landing",
    label: "Build a landing page",
    prompt: "Build a landing page for this project.",
  },
  { id: "bug", label: "Fix a bug", prompt: "Help me fix a bug in this project." },
  { id: "explain", label: "Explain my code", prompt: "Explain how this project is structured." },
] as const;

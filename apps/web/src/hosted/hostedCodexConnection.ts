const CODEX_CONNECTED_KEY = "caqli.hostedCodexConnected";

/** Client-side stub until vault API ships; replace with server-backed status. */
export function readHostedCodexConnected(): boolean {
  try {
    return globalThis.localStorage?.getItem(CODEX_CONNECTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeHostedCodexConnected(): void {
  try {
    globalThis.localStorage?.setItem(CODEX_CONNECTED_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Persist Codex credentials server-side (envelope-encrypted). Stub writes localStorage only.
 */
export async function connectCodexProvider(_apiKey: string): Promise<void> {
  // TODO(issue-015): POST /api/hosted/providers/codex with envelope-encrypted secret
  writeHostedCodexConnected();
}

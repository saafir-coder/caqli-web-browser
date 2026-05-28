const ONBOARDING_KEY = "caqli.hostedProfileComplete";

export function readHostedProfileComplete(): boolean {
  try {
    return globalThis.localStorage?.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeHostedProfileComplete(): void {
  try {
    globalThis.localStorage?.setItem(ONBOARDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

import { fetchHostedSession } from "./apiClient";
import { isHostedControlPlaneConfigured } from "./config";

export async function getHostedSignedInEmail(): Promise<string | undefined> {
  if (!isHostedControlPlaneConfigured()) {
    return undefined;
  }
  const session = await fetchHostedSession();
  return session.authenticated ? session.user?.email : undefined;
}

export async function hasHostedControlPlaneSession(): Promise<boolean> {
  if (!isHostedControlPlaneConfigured()) {
    return false;
  }
  const session = await fetchHostedSession();
  return session.authenticated;
}

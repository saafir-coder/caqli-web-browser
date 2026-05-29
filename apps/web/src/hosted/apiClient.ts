/** @deprecated Import from `./hostedClient` instead. */
export {
  type HostedAccessDecision,
  type HostedApiProject,
  type HostedApiUser,
  type HostedSessionResponse,
  checkHostedAccessOnServer,
  completeHostedMagicLinkCallback,
  createHostedProjectOnServer,
  getHostedSession as fetchHostedSession,
  listHostedProjectsOnServer,
  requestHostedMagicLink,
} from "./hostedClient";

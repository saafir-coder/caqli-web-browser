/** Row shape for `public.hosted_projects` (hosted control plane). */
export interface HostedProject {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly workspace_path: string;
  readonly created_at: string;
}

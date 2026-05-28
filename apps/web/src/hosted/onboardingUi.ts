/** Shared field styles — aligned with apps/caqli-onboarding (Stitch) */
export const hostedFieldClassName =
  "w-full rounded border border-[#333333] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-[#9CA3AF] focus:border-white focus:outline-none";

export const hostedFieldClassNameOnBlack =
  "w-full rounded border border-[#333333] bg-black px-3 py-2 text-sm text-white placeholder:text-[#9CA3AF] focus:border-white focus:outline-none";

export const hostedPrimaryButtonClassName =
  "flex w-full items-center justify-center gap-2 rounded border border-[#333333] bg-[#2B2B2B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3D3D3D] disabled:opacity-50";

export const hostedCardClassName = "w-full border border-[#333333] bg-[#1A1A1A] p-6";

export const HOSTED_PENDING_EMAIL_KEY = "caqli.hostedPendingEmail";

/** Set on /welcome when the server returns `devMagicLink` (local dogfood). */
export const HOSTED_DEV_MAGIC_LINK_KEY = "caqli_dev_magic_link";

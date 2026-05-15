// Shared store for pending signups (password stored temporarily until email verified)
const store = globalThis as unknown as {
  __pendingSignups?: Map<string, { password: string; expires: number }>
}

if (!store.__pendingSignups) {
  store.__pendingSignups = new Map()
}

export const pendingSignups = store.__pendingSignups

import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {}

export default withSentryConfig(nextConfig, {
  org: 'caqli-ai',
  project: 'caqli-ai',
  silent: true,
  disableLogger: true,
  // Don't block build if Sentry upload fails (no DSN yet)
  telemetry: false,
})

import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Vercel Web Analytics and Speed Insights
// Automatically enabled in production when deployed to Vercel
// No configuration or environment variables needed!
export function Analytics() {
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  )
}


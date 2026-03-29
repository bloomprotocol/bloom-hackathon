import { metadata } from './page.meta'
export { metadata }
import DashboardClient from './DashboardClient';

// Force dynamic rendering for agent token authentication
// This prevents SSG/ISR caching and ensures ?token= query param is processed
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardClient />;
}

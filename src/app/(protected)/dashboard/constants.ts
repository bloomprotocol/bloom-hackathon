/**
 * Dashboard View Constants
 * Defines the view type for the dashboard
 */

export const DASHBOARD_VIEW = {
  SUPPORTER: 'supporter',
} as const;

export type DashboardViewType = typeof DASHBOARD_VIEW[keyof typeof DASHBOARD_VIEW];
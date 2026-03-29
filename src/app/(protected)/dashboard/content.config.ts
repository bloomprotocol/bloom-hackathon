/**
 * Dashboard Content Configuration / Dashboard 内容配置
 * 
 * This file contains all text content displayed in the dashboard components.
 * Edit this file to update any text without modifying component code.
 * 
 * 这个文件包含了 Dashboard 组件中显示的所有文字内容。
 * 编辑此文件即可更新任何文字，无需修改组件代码。
 * 
 * Last updated: 2025-06-14T16:07:04.029Z
 * Updated via: Bloom Protocol Admin Panel
 */

export const dashboardContent = {
    "overview": {
      "loading": "Loading overview data...",
      "headers": {
        "overview": "Overview",
        "stats": "Stats",
        "recentActivities": "Recent Activities",
        "pointsHistory": "Points History"
      },
      "stats": {
        "completedTasks": "Completed Tasks",
        "drops": "Drops",
        "reviews": "Reviews",
        "referrals": "Referrals"
      },
      "tables": {
        "headers": {
          "type": "Type",
          "description": "Description",
          "status": "Status",
          "source": "Source",
          "amount": "Amount"
        },
        "loading": {
          "activities": "Loading activities...",
          "pointsHistory": "Loading points history..."
        },
        "empty": {
          "activities": "No recent activities",
          "pointsHistory": "No points history available"
        },
        "errors": {
          "pointsHistory": "Error loading points history"
        }
      },
      "activityTypes": {
        "task": "Task",
        "mission": "Mission",
        "review": "Review",
        "bookmark": "Bookmark",
        "helpful": "Helpful"
      },
      "pointSources": {
        "registration": "Registration",
        "taskCompletion": "Task Completion",
        "referralBonus": "Referral Bonus",
        "dailyCheckIn": "Daily Check-in",
        "missionReward": "Mission Reward",
        "adminAdjustment": "Admin Adjustment",
        "drops": "Drops"
      },
      "statuses": {
        "pending": "Pending",
        "inProgress": "In Progress",
        "completed": "Completed",
        "claimed": "Claimed",
        "failed": "Failed"
      }
    },
    "missionInfo": {
      "defaultMission": {
        "title": "Welcome to Bloom Protocol",
        "status": "Completed",
        "description": "Complete all tasks to earn rewards."
      },
      "statusLabels": {
        "live": "Live",
        "completed": "Ready to Claim"
      },
      "timeUnits": {
        "days": "D",
        "hours": "H",
        "minutes": "M",
        "seconds": "S"
      }
    },
    "reward": {
      "header": "Reward",
      "description": "Take on the challenge and earn awesome rewards!",
      "buttons": {
        "claimed": "Claimed",
        "claim": "Claim",
        "completeTasks": "Complete Tasks",
        "noMission": "No Mission"
      }
    },
    "task": {
      "defaultCategory": "Tasks",
      "defaultDescription": "Complete to unlock rewards"
    },
    "mobileSidebar": {
      "captions": {
        "explore": "Explore",
        "verificationComplete": "Verification complete",
        "verifyHuman": "Verify you're human"
      },
      "navigation": {
        "home": "Home",
        "spotlight": "Spotlight",
        "legacy": "Legacy",
        "dashboard": "Dashboard"
      },
      "quickActions": {
        "backToTop": "Back to Top"
      },
      "verification": {
        "notConfigured": "Turnstile not configured",
        "skipDev": "Skip Verification (Dev Mode)",
        "initiating": "Initiating..."
      },
      "welcome": "<strong>Welcome!</strong> Explore your dashboard and manage your missions.",
      "statusBadges": {
        "live": "Live"
      }
    },
    "dashboardRoleContent": {
      "headers": {
        "viewMode": "View Mode",
        "userView": "User View",
        "quickActions": "Quick Actions",
        "mission": "Hub",
        "recentProjects": "Recent Projects"
      },
      "actions": {
        "referralLink": "Referral Link",
        "referralDescription": "Generate project's referral link to share on socials",
        "publishMission": "Publish Mission",
        "publishDescription": "Build with community"
      },
      "toasts": {
        "referralComingSoon": "Referral links coming soon!",
        "missionCreatorComingSoon": "Mission creator coming soon!",
        "projectSaved": "Project saved!",
        "projectRemoved": "Project removed from saved!"
      },
      "empty": {
        "noProjects": "No projects available"
      },
      "statusLabels": {
        "live": "Live",
        "completed": "Ready to Claim"
      }
    },
    "common": {
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "noData": "No data available",
      "urlPrefixes": {
        "projectPage": "bloom.xyz/project/"
      }
    }
  };

// Type definitions for better TypeScript support
export type DashboardContent = typeof dashboardContent;
export type OverviewContent = typeof dashboardContent.overview;

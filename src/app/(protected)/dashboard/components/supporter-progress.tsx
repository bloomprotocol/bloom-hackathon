// progress card - merged with recent activity
"use client";

import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/lib/api/services/profileService";
import { savesService } from "@/lib/api/services/savesService";
import { useUserInfo } from "@/app/(protected)/dashboard/contexts/user-info-context";
import { dashboardContent } from "../content.config";
import { logger } from "@/lib/utils/logger";
import { useState, useMemo } from "react";

// Format status to be more user-friendly
const formatStatus = (status: string): { text: string; className: string } => {
  const normalizedStatus = status.toLowerCase();

  const statusMap: Record<string, { text: string; className: string }> = {
    pending: {
      text: dashboardContent.overview.statuses.pending,
      className: "bg-yellow-100 text-yellow-700",
    },
    in_progress: {
      text: dashboardContent.overview.statuses.inProgress,
      className: "bg-blue-100 text-blue-700",
    },
    completed: {
      text: dashboardContent.overview.statuses.completed,
      className: "bg-green-100 text-green-700",
    },
    claimed: {
      text: dashboardContent.overview.statuses.claimed,
      className: "bg-purple-100 text-purple-700",
    },
    failed: {
      text: dashboardContent.overview.statuses.failed,
      className: "bg-red-100 text-red-700",
    },
  };
  return (
    statusMap[normalizedStatus] || {
      text: status,
      className: "bg-gray-100 text-gray-700",
    }
  );
};

export default function SupporterProgress() {
  const { userInfo } = useUserInfo();
  const [activeTab, setActiveTab] = useState<"all" | "task" | "social">(
    "all"
  );

  // Fetch activity status (tasks, missions, referral clicks)
  const { data: activityStatus, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["activityStatus", 10],
    queryFn: async () => {
      const response = await profileService.getActivityStatus(10);
      logger.debug("Activity status response", { response });
      return response;
    },
    enabled: !!userInfo,
  });

  // Fetch recent activity (comments, favorites, submissions)
  const { data: recentActivity, isLoading: isLoadingRecent } = useQuery({
    queryKey: ["userRecentActivity"],
    queryFn: async () => {
      const response = await savesService.getUserRecentActivity();
      logger.debug("Recent activity response", { response });
      return response;
    },
    enabled: !!userInfo,
  });

  // Merge and normalize data from both sources
  const mergedActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: string;
      name: string;
      status: string;
      timestamp: string;
      points?: number;
    }> = [];

    // Add activity status records
    if (activityStatus?.records) {
      activityStatus.records.forEach((record) => {
        activities.push({
          id: record.recordId,
          type: record.type,
          name: record.name,
          status: record.status,
          timestamp: record.timestamp,
        });
      });
    }

    // Add recent activity records (social activities)
    if (recentActivity?.activities) {
      recentActivity.activities.forEach((activity) => {
        // Skip task type as it's already in activityStatus
        if (activity.type === "task") return;

        activities.push({
          id: activity.id,
          type: activity.type,
          name: activity.projectName || activity.title,
          status: activity.action || "completed",
          timestamp: activity.timestamp,
          points: activity.points ? Number(activity.points) : undefined,
        });
      });
    }

    // Sort by timestamp descending
    return activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activityStatus, recentActivity]);

  // Filter activities based on active tab
  const filteredActivities = mergedActivities.filter((record) => {
    if (activeTab === "all") {
      return true;
    } else if (activeTab === "task") {
      return record.type === "task" || record.type === "mission";
    } else if (activeTab === "social") {
      return (
        record.type === "comment" ||
        record.type === "favorite" ||
        record.type === "helpful" ||
        record.type === "submission"
      );
    }
    // Referral filtering removed temporarily
    // else if (activeTab === "referral") {
    //   return record.type === "referral_clicks" || record.type === "referral";
    // }
    return false;
  });

  const isLoading = isLoadingActivity || isLoadingRecent;

  const getTimeAgo = (date: string | null | undefined) => {
    if (!date) return "";

    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="common-container-style">
      {/* Header with title and type tabs */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Title and tabs container */}
        <div className="flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-4">
          <h2 className="text-[20px] font-bold text-[#393f49] font-serif">Progress</h2>

          {/* Type tabs - responsive positioning */}
          <div className="flex gap-4 desktop:gap-6 overflow-x-auto desktop:overflow-visible pb-1 desktop:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "all"
                  ? "text-[#8478e0]"
                  : "text-[#696f8c] hover:text-[#393f49]"
              }`}
                          >
              All
              {activeTab === "all" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("task")}
              className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "task"
                  ? "text-[#8478e0]"
                  : "text-[#696f8c] hover:text-[#393f49]"
              }`}
            >
              Task
              {activeTab === "task" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "social"
                  ? "text-[#8478e0]"
                  : "text-[#696f8c] hover:text-[#393f49]"
              }`}
            >
              Social
              {activeTab === "social" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
              )}
            </button>
            {/* Referral tab hidden temporarily */}
            {/* <button
              onClick={() => setActiveTab("referral")}
              className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "referral"
                  ? "text-[#8478e0]"
                  : "text-[#696f8c] hover:text-[#393f49]"
              }`}
            >
              Referral
              {activeTab === "referral" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
              )}
            </button> */}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div
        className="space-y-3 mobile:max-h-[300px] mobile:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading ? (
          <div className="py-6 text-center text-gray-500">
            {dashboardContent.overview.tables.loading.activities}
          </div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((record) => {
            const statusInfo = formatStatus(record.status);
            const isTaskOrMission = record.type === "task" || record.type === "mission";
            const isSocial = record.type === "comment" || record.type === "favorite" || record.type === "helpful" || record.type === "submission";
            const isReferral = record.type === "referral_clicks" || record.type === "referral";

            // Get display label for type
            const typeLabel = {
              task: "Task",
              mission: "Mission",
              comment: "Comment",
              favorite: "Follow",
              helpful: "Helpful",
              submission: "Submit",
              referral: "Referral",
              referral_clicks: "Referral",
            }[record.type] || record.type;

            // Get activity description
            const getActivityText = () => {
              switch (record.type) {
                case "comment":
                  return `Commented on "${record.name}"`;
                case "favorite":
                  return `Following "${record.name}"`;
                case "helpful":
                  return `Marked helpful on "${record.name}"`;
                case "submission":
                  return `Submitted "${record.name}"`;
                case "referral":
                  return "Referral code activated";
                default:
                  return `${record.name} is ${statusInfo.text.toLowerCase()}`;
              }
            };

            return (
              <div
                key={record.id}
                className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {/* Type Label */}
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isTaskOrMission
                        ? "bg-[#f759ff1a] text-[#eb7cff]"
                        : isSocial
                        ? "bg-[#E4FFF0] text-[#00C853]"
                        : isReferral
                        ? "bg-[#E8F4FD] text-[#1976D2]"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {typeLabel}
                  </div>

                  {/* Activity Text */}
                  <div className="flex-1">
                    <div className="text-[12px] font-medium text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {getActivityText()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Points badge if available */}
                  {record.points && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-[#e5e5e5] rounded-full">
                      <img
                        src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
                        alt="Points"
                        width={12}
                        height={12}
                      />
                      <span className="text-[10px] font-normal text-[#393f49]">
                        {record.points}
                      </span>
                    </div>
                  )}
                  {/* Timestamp */}
                  <div className="text-[12px] font-light text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {getTimeAgo(record.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-2">No activities yet</p>
            <p className="text-sm text-gray-400">
              Complete missions, share your referral link, or engage with projects to see your progress here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

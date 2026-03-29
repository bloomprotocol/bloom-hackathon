"use client";

import { useUserInfo } from "@/app/(protected)/dashboard/contexts/user-info-context";
import { useQuery } from "@tanstack/react-query";
import { savesService } from "@/lib/api/services/savesService";
import { useMemo } from "react";
import { logger } from "@/lib/utils/logger";
import { dashboardContent } from "../content.config";

// Activity card content based on type
interface ActivityContent {
  title: string;
  description: string;
  points?: number;
}

function getActivityContent(activity: {
  type: string;
  action?: string | null;
  title: string;
  projectName?: string | null;
  description?: string | null;
  points?: string | null;
  metadata: { referralCode?: string };
}): ActivityContent {
  const { type, action, title, projectName, description, metadata } = activity;
  const name = projectName || title;
  const points = activity.points ? Number(activity.points) : undefined;

  switch (type) {
    case "comment":
      return {
        title: `Commented on "${name}"`,
        description: description || "Comment content preview...",
        points,
      };
    case "favorite":
      return {
        title: action === "SAVED" ? `Following "${name}"` : `Unfollow "${name}"`,
        description: action === "SAVED" ? "Added to favorites" : "Removed from favorites",
        points,
      };
    case "project_update":
      return {
        title: name,
        description: description || title,
        // No points for project updates
      };
    case "helpful":
      return {
        title: `Marked helpful on "${name}"`,
        description: "Your review helps the community",
        points,
      };
    case "referral":
      return {
        title: "Activated your referral code",
        description: `Your unique code: ${metadata?.referralCode || "Loading..."}`,
        points,
      };
    case "submission":
      return {
        title: action === "SUBMITTED" ? `Submitted task: "${title}"` :
               action === "APPROVED" ? `Task approved: "${title}"` :
               `Task rejected: "${title}"`,
        description: description || (
          action === "SUBMITTED" ? "Task submitted successfully" :
          action === "APPROVED" ? "Your submission was approved" :
          "Your submission was rejected"
        ),
        points,
      };
    case "mission":
      return {
        title: action === "CLAIMED" ? `Claimed rewards for "${title}"` : `Completed mission "${title}"`,
        description: action === "CLAIMED" ? "Rewards claimed successfully" : "Mission completed",
        points,
      };
    default:
      return {
        title: title,
        description: description || "",
        points,
      };
  }
}

// Reusable Activity Card component
function ActivityCard({ title, description, points }: ActivityContent) {
  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="text-xs font-medium text-[#393f49] font-['Outfit']">
            {title}
          </div>
          <span className="text-xs font-light text-[#696f8c] font-['Outfit']">
            {description}
          </span>
        </div>
        {points !== undefined && (
          <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-white border border-[#e5e5e5] rounded-full">
            <img
              src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
              alt="Points"
              width={16}
              height={16}
            />
            <span className="text-xs font-normal text-[#393f49] font-['Outfit']">
              {points}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupporterRecentActivity() {
  const { userInfo } = useUserInfo();

  const { data: recentActivities, isLoading } = useQuery({
    queryKey: ["userRecentActivity"],
    queryFn: async () => {
      const response = await savesService.getUserRecentActivity();
      logger.debug("User recent activity", { response });
      return response;
    },
    enabled: !!userInfo,
    refetchInterval: 30000,
  });

  const sortedActivities = useMemo(() => {
    if (!recentActivities?.activities) return [];
    return recentActivities.activities.filter((activity) => activity.type !== "task");
  }, [recentActivities]);

  if (!userInfo) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black">
          {dashboardContent.overview.headers.overview}
        </h1>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <p className="text-gray-600">{dashboardContent.overview.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="common-container-style desktop:w-[320px] desktop:h-[571.59px] flex flex-col">
      <h3 className="text-[20px] font-bold text-[#393f49] mb-4 font-serif">
        Recent Activity
      </h3>
      {isLoading ? (
        <div className="text-center text-gray-500">
          {dashboardContent.overview.tables.loading.activities}
        </div>
      ) : sortedActivities.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sortedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={index > 0 ? "border-t border-gray-100" : ""}
            >
              <ActivityCard {...getActivityContent(activity)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          No recent activities yet
        </div>
      )}
    </div>
  );
}

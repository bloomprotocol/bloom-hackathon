'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { ProfileSelectedMission } from '@/lib/api/services/profileService';
import { MissionCard } from './MissionCard';
import { MissionRewardCard } from './MissionRewardCard';
import { MissionTaskCard } from './MissionTaskCard';
import { MissionRewardTiersCard } from './MissionRewardTiersCard';
import { MissionSelectionCriteriaCard } from './MissionSelectionCriteriaCard';
import BreadcrumbNav from './BreadcrumbNav';
import { useTaskActions } from '@/lib/hooks/useTaskActions';
import { logger } from '@/lib/utils/logger';
import profileService from '@/lib/api/services/profileService';
import { generateSlug } from '@/lib/utils/slugUtils';
import { useUserMissionStatus } from '@/hooks/useUserMissionStatus';
import { usePublicMissions } from '@/hooks/usePublicMissions';
import { findTaskById } from '@/lib/utils/mission/task-helpers';

interface MissionDetailPageClientProps {
  missionData: any;
}

export default function MissionDetailPageClient({ missionData }: MissionDetailPageClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [adjacentMissions, setAdjacentMissions] = useState<{
    previous?: { id: string; title: string };
    next?: { id: string; title: string };
  }>({});

  // Extract slug from the mission data
  const missionSlug = missionData.slug;

  // Use React Query hooks
  const { data: missionsList } = usePublicMissions({ status: 'live' });
  // We already have missionData from server, no need to fetch again
  const { data: userStatus, invalidate: invalidateUserStatus } = useUserMissionStatus(missionSlug);

  // Merge mission data with user status
  const mission = useMemo(() => {
    if (!missionData) return null;

    // If no user status (not authenticated or hasn't started mission), return public data as-is
    if (!userStatus) return missionData;

    // Merge user status into tasks (tasks are grouped by category)
    const mergedTasks: Record<string, any[]> = {};

    for (const [category, tasks] of Object.entries(missionData.tasks)) {
      mergedTasks[category] = (tasks as any[]).map((task: any) => {
        const taskStatus = userStatus.taskStatuses?.find((ts: any) => ts.taskId === task.id);
        return {
          ...task,
          completed: taskStatus?.completed || false,
          statusData: taskStatus?.statusData || undefined
        };
      });
    }

    // Merge rewards with canClaim from userStatus
    const mergedRewards = userStatus.rewards || missionData.rewards;

    return {
      ...missionData,
      claimed: userStatus.claimed || false,
      tasks: mergedTasks,
      rewards: mergedRewards,
    };
  }, [missionData, userStatus]);

  // Set adjacent missions for navigation
  useEffect(() => {
    if (missionsList && missionsList.length > 0 && mission) {
      const currentIndex = missionsList.findIndex(m => m.id === mission.id);
      
      if (currentIndex > 0) {
        setAdjacentMissions(prev => ({
          ...prev,
          previous: {
            id: missionsList[currentIndex - 1].id,
            title: missionsList[currentIndex - 1].title
          }
        }));
      }
      
      if (currentIndex < missionsList.length - 1) {
        setAdjacentMissions(prev => ({
          ...prev,
          next: {
            id: missionsList[currentIndex + 1].id,
            title: missionsList[currentIndex + 1].title
          }
        }));
      }
    }
  }, [missionsList, mission]);

  // Task actions hook
  const {
    isProcessing,
    currentTaskId,
    failedTaskId,
    handleTaskAction: baseHandleTaskAction
  } = useTaskActions(async () => {
    // Refresh user status
    await invalidateUserStatus();
  });

  // Handle task action
  const handleTaskAction = useCallback((taskId: string, value?: string | { url: string } | { caption: string; url: string } | { content: string; projectId?: string } | { title: string; content: string } | { selectedOptions: string[] } | { rankedOptions: Array<{ optionId: string; position: number }> }) => {
    if (!mission) return;
    
    const task = findTaskById(mission.tasks, taskId);
    if (!task) return;

    baseHandleTaskAction(taskId, task.task_type, value);
  }, [mission, baseHandleTaskAction]);

  // Claim reward
  const handleClaimReward = useCallback(async () => {
    if (!mission || mission.claimed) return;

    try {
      const response = await profileService.claimReward(mission.id);

      if (response && response.success) {
        // Refresh user status
        await invalidateUserStatus();
      }
    } catch (error) {
      logger.error('Failed to claim reward', { error });
    }
  }, [mission, invalidateUserStatus]);

  // Navigation handlers
  const handleNavigatePrevious = useCallback(() => {
    if (adjacentMissions.previous) {
      const slug = generateSlug(adjacentMissions.previous.title);
      router.push(`/missions/${slug}`);
    }
  }, [adjacentMissions.previous, router]);

  const handleNavigateNext = useCallback(() => {
    if (adjacentMissions.next) {
      const slug = generateSlug(adjacentMissions.next.title);
      router.push(`/missions/${slug}`);
    }
  }, [adjacentMissions.next, router]);


  // Mission data is already validated in the server component

  return (
    <>
      {/* Breadcrumb navigation */}
      <BreadcrumbNav mission={mission} />

      <div className="flex flex-col desktop:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="w-full desktop:w-[calc(100%-344px)] space-y-5">
          <MissionCard mission={mission as ProfileSelectedMission} />
          
          {/* Mobile only - Reward card */}
          <div className="desktop:hidden">
            <MissionRewardCard 
              mission={mission as ProfileSelectedMission}
              onClaimReward={handleClaimReward}
              isProcessing={isProcessing}
            />
          </div>
          
          {/* Mobile only - Reward Tiers card */}
          <div className="desktop:hidden">
            <MissionRewardTiersCard 
              rewardTiers={mission?.rewardTiers}
            />
          </div>
          
          {/* Mobile only - Selection Criteria card */}
          <div className="desktop:hidden">
            <MissionSelectionCriteriaCard 
              criteria={mission?.criteria}
            />
          </div>
          
          <MissionTaskCard
            mission={mission as ProfileSelectedMission}
            onTaskAction={handleTaskAction}
            isProcessing={isProcessing}
            currentTaskId={currentTaskId}
            failedTaskId={failedTaskId}
            isMissionUpcoming={mission?.status?.toLowerCase() === 'upcoming'}
          />
        </div>
        
        {/* Right column - 320px width, hidden on mobile */}
        <div className="hidden desktop:block desktop:w-[320px] desktop:shrink-0 space-y-6">
          <MissionRewardCard 
            mission={mission as ProfileSelectedMission}
            onClaimReward={handleClaimReward}
            isProcessing={isProcessing}
          />
          
          {/* NEW: Reward Tiers Card */}
          <MissionRewardTiersCard 
            rewardTiers={mission?.rewardTiers}
          />
          
          {/* NEW: Selection Criteria Card */}
          <MissionSelectionCriteriaCard 
            criteria={mission?.criteria}
          />
        </div>
      </div>
    </>
  );
}
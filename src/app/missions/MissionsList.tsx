'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/lib/api/services/profileService';
import { apiGet } from '@/lib/api/apiConfig';
import { logger } from '@/lib/utils/logger';
import { generateSlug } from '@/lib/utils/slugUtils';

// Only show Bloom Protocol content
const BLOOM_SLUGS = new Set([
  'proof-of-use',
  'proof-of-insight',
  'proof-of-curiosity',
  '2004566843516977245', // Bloom 2026 XQuest
]);

export default function MissionsList() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Fetch ALL missions via /missions (not /public/missions which only returns live)
  const { data: allMissionsData, isLoading } = useQuery({
    queryKey: ['allMissions'],
    queryFn: async () => {
      try {
        const res = await apiGet<{ data: { missions: any[] } }>('/missions?limit=50');
        return res.data?.missions || [];
      } catch (error) {
        logger.error('Failed to fetch missions', { error });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get user-specific missions data if authenticated
  const { data: userMissionsData } = useQuery({
    queryKey: ['userMissions'],
    queryFn: async () => {
      try {
        return await profileService.getUserMissions();
      } catch (error) {
        logger.error('Failed to fetch user missions', { error });
        return [];
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Only Bloom missions
  const bloomMissions = (allMissionsData || []).filter(m => BLOOM_SLUGS.has(m.slug));
  const userMissionsMap = new Map(userMissionsData?.map((m: any) => [m.id, m]) || []);

  const activeMissions = bloomMissions.filter(m => m.status === 'live');
  const completedMissions = bloomMissions.filter(m => m.status === 'completed');

  // Handle mission click
  const handleMissionClick = (mission: any) => {
    if (mission.missionType === 'social_mission') {
      router.push(`/social-missions/${mission.slug}`);
    } else {
      const slug = mission.slug || generateSlug(mission.title);
      router.push(`/missions/${slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const renderCard = (mission: any, isCompleted = false) => {
    const userMission = userMissionsMap.get(mission.id);
    const claimed = userMission?.claimed || false;
    const isXQuest = mission.missionType === 'social_mission';

    return (
      <div
        key={mission.id}
        className={`relative rounded-[20px] overflow-hidden transition-all ${isXQuest ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(100,80,150,0.12)]'} ${isCompleted ? 'opacity-75' : ''}`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        }}
        onClick={() => !isXQuest && handleMissionClick(mission)}
      >
        <div className="relative z-10 p-6 space-y-3">
          {/* Badges */}
          <div className="flex items-center gap-2">
            {isXQuest && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 font-['Outfit'] text-xs font-medium rounded-full border border-gray-200/60">
                X Quest · Coming Soon
              </span>
            )}
            {isCompleted && (
              <span className="px-2.5 py-0.5 bg-gray-50 text-[#9ca3af] font-['Outfit'] text-xs font-medium rounded-full border border-gray-200/60">
                Completed
              </span>
            )}
            {!isCompleted && !isXQuest && claimed && (
              <span className="px-2.5 py-0.5 bg-green-50 text-green-600 font-['Outfit'] text-xs font-medium rounded-full border border-green-200/60">
                Claimed
              </span>
            )}
          </div>

          <h3 className="font-['Outfit'] font-bold text-lg text-[#1a1228]">{mission.title}</h3>

          {mission.rewards && mission.rewards.length > 0 && (
            <p className="font-['Outfit'] text-sm text-[#6b7280]">
              Rewards: {mission.rewards.map((r: any) => `${r.amount || ''} ${r.name}`.trim()).join(', ')}
            </p>
          )}

          {mission.taskCount !== undefined && (
            <p className="font-['Outfit'] text-sm text-[#6b7280]">
              {mission.taskCount} Tasks
            </p>
          )}

          <div className="pt-2">
            {isXQuest ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl font-['Outfit'] font-semibold text-sm text-[#696f8c] opacity-40 cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(200,200,210,0.3) 0%, rgba(180,175,200,0.2) 100%)',
                  border: '1px solid rgba(200,200,210,0.3)',
                }}
              >
                Coming Soon
              </button>
            ) : (
              <button
                className={`w-full py-2.5 rounded-xl font-['Outfit'] font-semibold text-sm transition-all ${isCompleted ? 'text-[#696f8c]' : 'text-white'}`}
                style={isCompleted ? {
                  background: 'linear-gradient(135deg, rgba(200,200,210,0.3) 0%, rgba(180,175,200,0.2) 100%)',
                  border: '1px solid rgba(200,200,210,0.3)',
                } : {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(139,92,246,0.85) 100%)',
                  boxShadow: '0 2px 12px -2px rgba(124,58,237,0.3)',
                }}
              >
                {isCompleted ? 'View Mission' : claimed ? 'View Mission' : 'Start Mission'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="desktop:hidden font-serif font-bold text-3xl text-[#1e1b4b] tracking-[-0.48px]">Missions</h1>

      {/* Active Missions */}
      {activeMissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-[#1e1b4b]">Active</h2>
          <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
            {activeMissions.map((m) => renderCard(m))}
          </div>
        </div>
      )}

      {/* Completed Bloom missions (XQuest) */}
      {completedMissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-[#1e1b4b]/60">Completed</h2>
          <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
            {completedMissions.map((m) => renderCard(m, true))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {bloomMissions.length === 0 && (
        <div className="text-center py-20">
          <div
            className="relative rounded-[20px] overflow-hidden p-8 max-w-md mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,240,255,0.65) 100%)',
              border: '1px solid rgba(150,130,200,0.12)',
              boxShadow: '0 4px 24px rgba(100,80,150,0.05)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h3 className="font-['Outfit'] text-xl font-bold text-[#1a1228] mb-2">No Missions Available</h3>
            <p className="font-['Outfit'] text-sm text-[#6b7280]">Check back later for new missions!</p>
          </div>
        </div>
      )}
    </div>
  );
}

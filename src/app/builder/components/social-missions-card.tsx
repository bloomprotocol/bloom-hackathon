'use client';

import { useState } from 'react';
import { useBuilderDashboard } from '../contexts/builder-dashboard-context';
import { MissionStatusFilter } from '../constants';
import MissionCard from './mission-card';

/**
 * Social Missions Card
 * Container for the list of missions with status filter
 */
export default function SocialMissionsCard() {
  const { missions } = useBuilderDashboard();
  const [statusFilter, setStatusFilter] = useState<MissionStatusFilter>('all');

  const filteredMissions = statusFilter === 'all'
    ? missions
    : missions.filter(m => m.status === statusFilter);

  return (
    <div className="common-container-style">
      {/* Header with title and status tabs */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-4">
          <h3
            className="text-[20px] font-bold text-[#393f49]"
            style={{ fontFamily: 'Times, serif' }}
          >
            SOCIAL MISSIONS
          </h3>

          {/* Status tabs */}
          <div className="flex gap-4 desktop:gap-6 overflow-x-auto desktop:overflow-visible pb-1 desktop:pb-0">
            {(['all', 'Active', 'Ended'] as MissionStatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap ${
                  statusFilter === status
                    ? 'text-[#8478e0]'
                    : 'text-[#696f8c] hover:text-[#393f49]'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {status === 'all' ? 'All' : status}
                {statusFilter === status && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {filteredMissions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
        {filteredMissions.length === 0 && (
          <div className="text-center py-8 text-[#696f8c] text-[14px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            No missions found
          </div>
        )}
      </div>
    </div>
  );
}

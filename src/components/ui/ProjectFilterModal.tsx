'use client';

import { ProjectStatus } from '@/lib/api/services/projectService';

interface ProjectFilterModalProps {
  selectedStatus: 'all' | ProjectStatus;
  onStatusChange: (status: 'all' | ProjectStatus) => void;
}

const statusOptions: Array<{ value: 'all' | ProjectStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: ProjectStatus.PRE_SALE, label: 'Pre Sale' },
  { value: ProjectStatus.LAUNCH, label: 'Launch' },
];

export function ProjectFilterModal({
  selectedStatus,
  onStatusChange
}: ProjectFilterModalProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50">
      <div className="max-w-[500px] mx-auto px-4">
        <div className="bg-white rounded-[28px] shadow-md px-6 h-14 flex items-center justify-center">
          {/* Status options */}
          <div className="flex items-center gap-4">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => onStatusChange(status.value)}
                className={`text-sm font-medium transition-all ${
                  selectedStatus === status.value
                    ? 'text-black font-semibold scale-110'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
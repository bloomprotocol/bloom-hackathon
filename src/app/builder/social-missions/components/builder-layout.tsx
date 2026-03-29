'use client';

import { useState } from 'react';
import BreadcrumbNav from './breadcrumb-nav';
import MissionOverviewCard from './mission-overview-card';
import SubmissionsCard from './submissions-card';
import ExportDataCard from './export-data-card';
import DistributeDropRewardCard from './distribute-drop-reward-card';
import DistributeTokenRewardCard from './distribute-reward-card';
import TokenDistributionStatusCard from './token-distribution-status-card';
import MissionConfigurePanel from './mission-configure-panel';
import { useBuilderMission } from '../contexts/builder-mission-context';

// Stepper bar component
function StepperBar({
  activeStep,
  onStepClick,
}: {
  activeStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
}) {
  const steps = [
    { num: 1 as const, label: 'Review' },
    { num: 2 as const, label: 'Configure' },
    { num: 3 as const, label: 'Distribute' },
  ];

  return (
    <div className="flex items-center w-full" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1 last:flex-none">
          {/* Step circle + label */}
          <button
            onClick={() => onStepClick(step.num)}
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
          >
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[13px] font-semibold transition-colors ${
                activeStep === step.num
                  ? 'bg-[#8478e0] border-[#8478e0] text-white'
                  : 'bg-white border-[#d1d5db] text-[#696f8c] group-hover:border-[#8478e0] group-hover:text-[#8478e0]'
              }`}
            >
              {step.num}
            </div>
            <span
              className={`text-[13px] transition-colors hidden mobile:inline sm:inline ${
                activeStep === step.num
                  ? 'font-bold text-[#393f49]'
                  : 'font-medium text-[#696f8c] group-hover:text-[#393f49]'
              }`}
            >
              {step.label}
            </span>
          </button>

          {/* Connector line (not after last step) */}
          {i < steps.length - 1 && (
            <div className="flex-1 mx-3 mobile:mx-2">
              <div className="h-[2px] bg-[#e6e8ec]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface BuilderLayoutProps {
  postId: string;
}

export default function BuilderLayout({ postId }: BuilderLayoutProps) {
  const { isLoading, error, mission } = useBuilderMission();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Loading state
  if (isLoading && !mission) {
    return (
      <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#696f8c]">Loading mission...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  // No mission found
  if (!mission) {
    return (
      <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#696f8c]">Mission not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
      <BreadcrumbNav />
      <MissionOverviewCard />

      {/* Stepper container */}
      <div className="common-container-style mt-5">
        <StepperBar activeStep={activeStep} onStepClick={setActiveStep} />

        <div className="mt-4">
          {activeStep === 1 && <SubmissionsCard />}
          {activeStep === 2 && <MissionConfigurePanel />}
          {activeStep === 3 && (
            <div className="space-y-5">
              <ExportDataCard />
              <DistributeDropRewardCard />
              <DistributeTokenRewardCard />
              <TokenDistributionStatusCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

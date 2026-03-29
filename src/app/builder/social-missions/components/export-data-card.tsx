'use client';

import { useState } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';
import MobileDisabledWrapper from './mobile-disabled-wrapper';

export default function ExportDataCard() {
  const {
    isMobile,
    isSubmitting,
    handleExportAll,
    handleExportApproved,
    handleExportDistributionRecord,
  } = useBuilderMission();

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="common-container-style flex w-full flex-col items-start gap-4">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-bold text-[#393f49] text-[20px] leading-none hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'Times, serif' }}
      >
        <span>Export Data</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#696f8c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <>
          {/* Export All Submissions */}
          <MobileDisabledWrapper isMobile={isMobile} message="Please use desktop to export data">
            <button
              onClick={handleExportAll}
              disabled={isSubmitting}
              className="w-full bg-white h-10 rounded-[27px] px-4 py-2 flex items-center justify-center text-[#393f49] text-[14px] font-semibold border-2 border-[#dad9e5] shadow-[0px_3px_0px_-1px_#c0bfcf] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Exporting...' : 'Export All Submissions'}
            </button>
          </MobileDisabledWrapper>

          {/* Export Approved Submissions */}
          <MobileDisabledWrapper isMobile={isMobile} message="Please use desktop to export data">
            <button
              onClick={handleExportApproved}
              disabled={isSubmitting}
              className="w-full bg-white h-10 rounded-[27px] px-4 py-2 flex items-center justify-center text-[#393f49] text-[14px] font-semibold border-2 border-[#dad9e5] shadow-[0px_3px_0px_-1px_#c0bfcf] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Exporting...' : 'Export Approved Submissions'}
            </button>
          </MobileDisabledWrapper>

          {/* Export Distribution Record */}
          <MobileDisabledWrapper isMobile={isMobile} message="Please use desktop to export data">
            <button
              onClick={handleExportDistributionRecord}
              disabled={isSubmitting}
              className="w-full bg-white h-10 rounded-[27px] px-4 py-2 flex items-center justify-center text-[#393f49] text-[14px] font-semibold border-2 border-[#dad9e5] shadow-[0px_3px_0px_-1px_#c0bfcf] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Exporting...' : 'Export Distribution Record'}
            </button>
          </MobileDisabledWrapper>
        </>
      )}
    </div>
  );
}

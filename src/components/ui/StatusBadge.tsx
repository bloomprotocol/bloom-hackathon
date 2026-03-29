"use client";

import { HTMLAttributes } from 'react';

export type StatusType = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'active' 
  | 'inactive' 
  | 'draft' 
  | 'published'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'live'
  | 'upcoming';

interface StatusConfig {
  text: string;
  className: string;
}

const defaultStatusMap: Record<StatusType, StatusConfig> = {
  pending: { text: "Pending", className: "bg-yellow-100 text-yellow-700" },
  in_progress: { text: "In Progress", className: "bg-blue-100 text-blue-700" },
  completed: { text: "Completed", className: "bg-green-100 text-green-700" },
  active: { text: "Active", className: "bg-green-100 text-green-700" },
  inactive: { text: "Inactive", className: "bg-gray-100 text-gray-700" },
  draft: { text: "Draft", className: "bg-gray-100 text-gray-700" },
  published: { text: "Published", className: "bg-blue-100 text-blue-700" },
  approved: { text: "Approved", className: "bg-green-100 text-green-700" },
  rejected: { text: "Rejected", className: "bg-red-100 text-red-700" },
  expired: { text: "Expired", className: "bg-gray-100 text-gray-700" },
  live: { text: "Live", className: "bg-green-100 text-green-700" },
  upcoming: { text: "Upcoming", className: "bg-purple-100 text-purple-700" }
};

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string;
  customStatusMap?: Record<string, StatusConfig>;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ 
  status, 
  customStatusMap,
  size = 'md',
  className = '',
  ...props 
}: StatusBadgeProps) {
  const statusMap = customStatusMap || defaultStatusMap;
  const config = statusMap[status as StatusType] || { 
    text: status, 
    className: "bg-gray-100 text-gray-700" 
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {config.text}
    </span>
  );
}
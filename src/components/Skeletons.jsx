import React from 'react';

// Common base for the pulsing animation
const SkeletonBase = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`}></div>
);

export const ResourceSkeleton = () => (
  <div className="border border-slate-200 rounded-xl p-5 bg-white">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-3 w-full">
        <SkeletonBase className="h-4 w-16" /> {/* Badge */}
        <SkeletonBase className="h-6 w-3/4" /> {/* Title */}
      </div>
      <SkeletonBase className="h-4 w-10" /> {/* Capacity */}
    </div>
    <SkeletonBase className="h-10 w-full rounded-lg mt-4" /> {/* Button */}
  </div>
);

export const HistorySkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-4 w-full">
      <SkeletonBase className="h-12 w-12 rounded-full" /> {/* Icon circle */}
      <div className="space-y-2 flex-1">
        <SkeletonBase className="h-5 w-1/3" /> {/* Title */}
        <SkeletonBase className="h-3 w-1/4" /> {/* Subtitle */}
      </div>
    </div>
    <SkeletonBase className="h-6 w-20 rounded-full" /> {/* Status badge */}
  </div>
);
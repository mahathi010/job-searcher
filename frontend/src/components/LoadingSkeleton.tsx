import React from "react";

interface LoadingSkeletonProps {
  count?: number;
}

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="w-20 h-5 bg-gray-200 rounded-full" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
    </div>
    <div className="mt-3 flex gap-2">
      <div className="h-5 bg-gray-200 rounded-full w-16" />
      <div className="h-5 bg-gray-200 rounded-full w-20" />
      <div className="h-5 bg-gray-200 rounded-full w-14" />
    </div>
    <div className="mt-3 flex items-center justify-between">
      <div className="h-3 bg-gray-200 rounded w-24" />
      <div className="h-8 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6 }) => (
  <div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    aria-busy="true"
    aria-label="Loading jobs"
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default LoadingSkeleton;

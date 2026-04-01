import React from "react";
import { Briefcase, SearchX } from "lucide-react";

interface EmptyStateProps {
  variant: "no-jobs" | "no-results";
  onRefresh?: () => void;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  onRefresh,
  onResetFilters,
}) => {
  if (variant === "no-jobs") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No jobs available</h3>
        <p className="text-gray-500 text-sm max-w-xs mb-4">
          There are no supported jobs at the moment. Check back later or refresh to reload.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">No results found</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-4">
        No jobs match your current filters. Try adjusting your search or reset all filters.
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Reset filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;

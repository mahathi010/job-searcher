import React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { JobFilter, JobType, SupportStatus } from "@/models/job_models";
import { useJobsContext } from "@/store/jobs_context";
import { useJobSelection } from "@/hooks/use_job_selection";

interface JobFiltersProps {
  totalCount: number;
  filteredCount: number;
  onRefresh: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filteredCount,
  onRefresh,
}) => {
  const { state, dispatch } = useJobsContext();
  const { selectedCount, selectAll, clearAll } = useJobSelection();
  const { filters } = state;

  const setFilter = (patch: Partial<JobFilter>) =>
    dispatch({ type: "SET_FILTER", payload: patch });

  const hasActiveFilters =
    filters.query !== "" || filters.status !== "all" || filters.jobType !== "all";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilter({ query: e.target.value })}
            placeholder="Search jobs, companies, skills…"
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search jobs"
          />
          {filters.query && (
            <button
              onClick={() => setFilter({ query: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilter({ status: e.target.value as JobFilter["status"] })
            }
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            aria-label="Filter by support status"
          >
            <option value="all">All statuses</option>
            <option value={SupportStatus.Supported}>Supported</option>
            <option value={SupportStatus.Warning}>Warning</option>
            <option value={SupportStatus.Unsupported}>Unsupported</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Job type filter */}
        <div className="relative">
          <select
            value={filters.jobType}
            onChange={(e) =>
              setFilter({ jobType: e.target.value as JobFilter["jobType"] })
            }
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            aria-label="Filter by job type"
          >
            <option value="all">All types</option>
            <option value={JobType.FullTime}>Full-time</option>
            <option value={JobType.PartTime}>Part-time</option>
            <option value={JobType.Contract}>Contract</option>
            <option value={JobType.Internship}>Internship</option>
            <option value={JobType.Remote}>Remote</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilter({ sort: e.target.value as JobFilter["sort"] })
            }
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            aria-label="Sort jobs"
          >
            <option value="recent">Most recent</option>
            <option value="title">Title A–Z</option>
            <option value="company">Company A–Z</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              dispatch({ type: "RESET_FILTERS" });
              onRefresh();
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Reset
          </button>
        )}
      </div>

      {/* Bottom bar: result count + bulk selection */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          <span className="font-medium text-gray-900">{filteredCount}</span> job
          {filteredCount !== 1 ? "s" : ""} found
          {selectedCount > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              · {selectedCount} selected
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            Select all eligible
          </button>
          {selectedCount > 0 && (
            <button
              onClick={clearAll}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobFilters;

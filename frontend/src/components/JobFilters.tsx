import React, { useState } from "react";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  JobFilter,
  JobType,
  RemoteStatus,
  Experience,
  Sponsorship,
} from "@/models/job_models";
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
  const [showMore, setShowMore] = useState(false);

  const setFilter = (patch: Partial<JobFilter>) =>
    dispatch({ type: "SET_FILTER", payload: patch });

  const hasActiveFilters =
    filters.query !== "" ||
    filters.jobType !== "all" ||
    filters.remoteStatus !== "all" ||
    filters.experience !== "all" ||
    filters.sponsorship !== "all" ||
    filters.postedDateFrom !== "" ||
    filters.postedDateTo !== "" ||
    filters.mainSkillset !== "";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Primary filter row */}
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
            <option value={JobType.full_time}>Full-time</option>
            <option value={JobType.part_time}>Part-time</option>
            <option value={JobType.contract}>Contract</option>
            <option value={JobType.internship}>Internship</option>
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

        {/* Toggle more filters */}
        <button
          onClick={() => setShowMore((v) => !v)}
          className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 ${
            showMore ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-600"
          }`}
          aria-expanded={showMore}
          aria-label="Toggle more filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          More filters
        </button>

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

      {/* Expanded filter row */}
      {showMore && (
        <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
          {/* Remote status */}
          <div className="relative">
            <select
              value={filters.remoteStatus}
              onChange={(e) =>
                setFilter({ remoteStatus: e.target.value as JobFilter["remoteStatus"] })
              }
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              aria-label="Filter by remote status"
            >
              <option value="all">All locations</option>
              <option value={RemoteStatus.remote}>Remote</option>
              <option value={RemoteStatus.hybrid}>Hybrid</option>
              <option value={RemoteStatus.onsite}>Onsite</option>
              <option value={RemoteStatus.unknown}>Unknown</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Experience */}
          <div className="relative">
            <select
              value={filters.experience}
              onChange={(e) =>
                setFilter({ experience: e.target.value as JobFilter["experience"] })
              }
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              aria-label="Filter by experience level"
            >
              <option value="all">All experience</option>
              <option value={Experience.junior}>Junior</option>
              <option value={Experience.mid}>Mid</option>
              <option value={Experience.senior}>Senior</option>
              <option value={Experience.lead}>Lead</option>
              <option value={Experience.unknown}>Unknown</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sponsorship */}
          <div className="relative">
            <select
              value={filters.sponsorship}
              onChange={(e) =>
                setFilter({ sponsorship: e.target.value as JobFilter["sponsorship"] })
              }
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              aria-label="Filter by sponsorship"
            >
              <option value="all">All sponsorship</option>
              <option value={Sponsorship.yes}>Sponsors</option>
              <option value={Sponsorship.no}>No sponsorship</option>
              <option value={Sponsorship.unknown}>Unknown</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Main skillset text filter */}
          <div className="relative">
            <input
              type="text"
              value={filters.mainSkillset}
              onChange={(e) => setFilter({ mainSkillset: e.target.value })}
              placeholder="Main skillset"
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-36"
              aria-label="Filter by main skillset"
            />
            {filters.mainSkillset && (
              <button
                onClick={() => setFilter({ mainSkillset: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear skillset filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Posted date from */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={filters.postedDateFrom}
              onChange={(e) => setFilter({ postedDateFrom: e.target.value })}
              className="pl-2 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Posted date from"
            />
          </div>

          {/* Posted date to */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={filters.postedDateTo}
              onChange={(e) => setFilter({ postedDateTo: e.target.value })}
              className="pl-2 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Posted date to"
            />
          </div>
        </div>
      )}

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

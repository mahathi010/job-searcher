import React, { useCallback } from "react";
import { Upload, Wifi, WifiOff } from "lucide-react";
import { useJobs } from "@/hooks/use_jobs";
import { useJobSelection } from "@/hooks/use_job_selection";
import { useHealth } from "@/hooks/use_health";
import { useJobsContext } from "@/store/jobs_context";
import { simulateIngest } from "@/services/jobs_service";
import { IngestStep, IngestJobResultStatus } from "@/models/job_models";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { JobDetailsDrawer } from "@/components/JobDetailsDrawer";
import { ReviewPanel } from "@/components/ReviewPanel";
import { IngestProgress } from "@/components/IngestProgress";
import { IngestResult } from "@/components/IngestResult";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";

export const JobsListScreen: React.FC = () => {
  const { jobs, loading, error, refresh } = useJobs();
  const { selectedJobs, selectedCount, isSelected, toggle } = useJobSelection();
  const { state, dispatch } = useJobsContext();
  const { status: healthStatus } = useHealth();

  const drawerJob = jobs.find((j) => j.id === state.drawerJobId) ?? null;

  const openDrawer = (id: string) => dispatch({ type: "OPEN_DRAWER", payload: id });
  const closeDrawer = () => dispatch({ type: "CLOSE_DRAWER" });

  const goToReview = () => dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.Review });
  const goToList = () => {
    dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.List });
    dispatch({ type: "CLEAR_SELECTION" });
  };

  const handleConfirmIngest = () => {
    dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.Progress });
  };

  const handleIngestComplete = useCallback(async () => {
    const ids = selectedJobs.map((j) => j.id);
    const results = await simulateIngest(ids);
    dispatch({ type: "SET_INGEST_RESULTS", payload: results });
    dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.Result });
  }, [selectedJobs, dispatch]);

  const handleCancelIngest = () => {
    dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.Review });
  };

  const handleRetryFailed = () => {
    const failedIds = new Set(
      state.ingestResults
        .filter((r) => r.status === IngestJobResultStatus.Failed)
        .map((r) => r.jobId)
    );
    dispatch({ type: "SELECT_ALL", payload: Array.from(failedIds) });
    dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.Review });
  };

  const hasFilter =
    state.filters.query !== "" ||
    state.filters.status !== "all" ||
    state.filters.jobType !== "all";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600"
      >
        Skip to main content
      </a>

      {/* Page header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-0.5">
              <span>job_searcher</span>
              <span className="mx-1">/</span>
              <span className="text-gray-600 font-medium">Supported Jobs</span>
            </nav>
            <h1 className="text-xl font-bold text-gray-900">Ingest Supported Jobs</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Health indicator */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                healthStatus === "online"
                  ? "bg-green-50 text-green-700"
                  : healthStatus === "offline"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-50 text-gray-500"
              }`}
              aria-label={`Backend ${healthStatus}`}
            >
              {healthStatus === "online" ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {healthStatus}
            </span>

            {/* Ingest CTA */}
            <button
              onClick={goToReview}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={`Ingest ${selectedCount} selected job${selectedCount !== 1 ? "s" : ""}`}
            >
              <Upload className="w-4 h-4" />
              Ingest
              {selectedCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            {error} —{" "}
            <button onClick={refresh} className="underline hover:no-underline">
              retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5">
          <JobFilters
            totalCount={jobs.length}
            filteredCount={jobs.length}
            onRefresh={refresh}
          />
        </div>

        {/* Job grid */}
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : jobs.length === 0 ? (
          hasFilter ? (
            <EmptyState
              variant="no-results"
              onResetFilters={() => {
                dispatch({ type: "RESET_FILTERS" });
                refresh();
              }}
            />
          ) : (
            <EmptyState variant="no-jobs" onRefresh={refresh} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={isSelected(job.id)}
                onToggleSelect={toggle}
                onViewDetails={openDrawer}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky bulk action footer */}
      {selectedCount > 0 && state.ingestStep === IngestStep.List && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{selectedCount}</span> job
              {selectedCount !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={goToReview}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Review & Ingest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job details drawer */}
      {drawerJob && (
        <JobDetailsDrawer
          job={drawerJob}
          isSelected={isSelected(drawerJob.id)}
          onClose={closeDrawer}
          onToggleSelect={toggle}
        />
      )}

      {/* Review overlay */}
      {state.ingestStep === IngestStep.Review && (
        <ReviewPanel
          selectedJobs={selectedJobs}
          onConfirm={handleConfirmIngest}
          onBack={() => dispatch({ type: "SET_INGEST_STEP", payload: IngestStep.List })}
        />
      )}

      {/* Progress overlay */}
      {state.ingestStep === IngestStep.Progress && (
        <IngestProgress
          jobIds={selectedJobs.map((j) => j.id)}
          onComplete={handleIngestComplete}
          onCancel={handleCancelIngest}
        />
      )}

      {/* Result overlay */}
      {state.ingestStep === IngestStep.Result && (
        <IngestResult
          results={state.ingestResults}
          onRetryFailed={handleRetryFailed}
          onReturnToList={goToList}
        />
      )}
    </div>
  );
};

export default JobsListScreen;

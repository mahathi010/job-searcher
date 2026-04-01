import React from "react";
import { AlertTriangle, XCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Job, SupportStatus } from "@/models/job_models";
import { StatusBadge } from "./StatusBadge";

interface ReviewPanelProps {
  selectedJobs: Job[];
  onConfirm: () => void;
  onBack: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  selectedJobs,
  onConfirm,
  onBack,
}) => {
  const blockers = selectedJobs.filter(
    (j) => j.supportStatus === SupportStatus.Unsupported || j.missingFields.length > 0
  );
  const warnings = selectedJobs.filter(
    (j) =>
      j.supportStatus === SupportStatus.Warning && j.warnings.length > 0
  );
  const canProceed = blockers.length === 0 && selectedJobs.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Review & Confirm</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""} selected for
            ingest
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Blocker banner */}
          {blockers.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {blockers.length} job{blockers.length !== 1 ? "s have" : " has"} blocking
                  issues
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  Remove unsupported jobs or fix missing fields before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Warning banner */}
          {warnings.length > 0 && blockers.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700">
                  {warnings.length} job{warnings.length !== 1 ? "s have" : " has"} warnings
                </p>
                <p className="text-xs text-yellow-600 mt-0.5">
                  These may partially ingest. Review warnings before confirming.
                </p>
              </div>
            </div>
          )}

          {/* Job list */}
          <ul className="space-y-3">
            {selectedJobs.map((job) => (
              <li
                key={job.id}
                className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg"
              >
                <div
                  className={`w-8 h-8 rounded-full ${job.companyColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {job.companyInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {job.title}
                    </span>
                    <StatusBadge variant={job.supportStatus} />
                  </div>
                  <p className="text-xs text-gray-500">{job.company}</p>
                  {/* Inline issues */}
                  {job.missingFields.length > 0 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Missing: {job.missingFields.join(", ")}
                    </p>
                  )}
                  {job.warnings.map((w) => (
                    <p key={w} className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {w}
                    </p>
                  ))}
                  {job.supportStatus === SupportStatus.Supported &&
                    job.missingFields.length === 0 && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ready to ingest
                      </p>
                    )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!canProceed}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Ingest ({selectedJobs.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;

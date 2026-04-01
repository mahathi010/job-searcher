import React, { useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Job, JobType, SupportStatus } from "@/models/job_models";
import { StatusBadge } from "./StatusBadge";

interface JobDetailsDrawerProps {
  job: Job | null;
  isSelected: boolean;
  onClose: () => void;
  onToggleSelect: (id: string) => void;
}

const jobTypeLabel: Record<JobType, string> = {
  [JobType.FullTime]: "Full-time",
  [JobType.PartTime]: "Part-time",
  [JobType.Contract]: "Contract",
  [JobType.Internship]: "Internship",
  [JobType.Remote]: "Remote",
};

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({
  job,
  isSelected,
  onClose,
  onToggleSelect,
}) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!job) return null;

  const isUnsupported = job.supportStatus === SupportStatus.Unsupported;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl flex flex-col"
        role="complementary"
        aria-label="Job details"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div
            className={`w-12 h-12 rounded-full ${job.companyColor} flex items-center justify-center text-white font-bold flex-shrink-0`}
          >
            {job.companyInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 leading-snug">
              {job.title}
            </h2>
            <p className="text-sm text-gray-500">{job.company}</p>
            <div className="mt-1">
              <StatusBadge variant={job.supportStatus} size="md" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-0.5"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              {jobTypeLabel[job.jobType]}
            </span>
            {job.salary && (
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-400" />
                {job.salary}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Posted {new Date(job.postedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Source */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Source
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800">{job.source}</span>
              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View original
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Summary
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{job.summary}</p>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility */}
          {job.eligibilityCriteria.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Eligibility Criteria
              </p>
              <ul className="space-y-1">
                {job.eligibilityCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support reasons */}
          {job.supportReasons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Why Supported
              </p>
              <ul className="space-y-1">
                {job.supportReasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {job.warnings.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Warnings
              </p>
              <ul className="space-y-1">
                {job.warnings.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-yellow-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing fields */}
          {job.missingFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Missing Fields
              </p>
              <ul className="space-y-1">
                {job.missingFields.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-red-600">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unsupported message */}
          {isUnsupported && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">
                This job cannot be ingested
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Critical fields are missing. Resolve the issues above before ingesting.
              </p>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => onToggleSelect(job.id)}
            disabled={isUnsupported}
            className={`w-full py-2.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${
              isSelected
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-pressed={isSelected}
          >
            {isUnsupported
              ? "Cannot select — unsupported"
              : isSelected
              ? "Deselect job"
              : "Select for ingest"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default JobDetailsDrawer;

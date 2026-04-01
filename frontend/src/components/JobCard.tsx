import React from "react";
import { MapPin, Clock, DollarSign, ExternalLink, AlertTriangle } from "lucide-react";
import { Job, JobType, SupportStatus } from "@/models/job_models";
import { StatusBadge } from "./StatusBadge";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const jobTypeLabel: Record<JobType, string> = {
  [JobType.FullTime]: "Full-time",
  [JobType.PartTime]: "Part-time",
  [JobType.Contract]: "Contract",
  [JobType.Internship]: "Internship",
  [JobType.Remote]: "Remote",
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected,
  onToggleSelect,
  onViewDetails,
}) => {
  const isUnsupported = job.supportStatus === SupportStatus.Unsupported;

  return (
    <article
      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col ${
        isSelected ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-200"
      } ${isUnsupported ? "opacity-60" : ""}`}
      aria-label={`Job: ${job.title} at ${job.company}`}
    >
      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isUnsupported}
              onChange={() => onToggleSelect(job.id)}
              aria-label={`Select ${job.title}`}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          {/* Company avatar */}
          <div
            className={`w-10 h-10 rounded-full ${job.companyColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
            aria-hidden="true"
          >
            {job.companyInitials}
          </div>
          {/* Title block */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 truncate">{job.company}</p>
          </div>
          {/* Status badge */}
          <div className="flex-shrink-0">
            <StatusBadge variant={job.supportStatus} />
          </div>
        </div>

        {/* Metadata chips */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            {jobTypeLabel[job.jobType]}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <DollarSign className="w-3 h-3" />
              {job.salary}
            </span>
          )}
        </div>

        {/* Summary snippet */}
        <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {job.summary}
        </p>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 text-gray-400 text-xs">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Warnings */}
        {job.warnings.length > 0 && (
          <div className="mt-2 flex items-start gap-1 text-xs text-yellow-700">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{job.warnings[0]}</span>
          </div>
        )}

        {/* Unsupported message */}
        {isUnsupported && (
          <p className="mt-2 text-xs text-red-600 font-medium">
            Cannot be ingested — missing required fields
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          {job.sourceUrl && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              aria-label={`View on ${job.source}`}
            >
              <ExternalLink className="w-3 h-3" />
              {job.source}
            </a>
          )}
          <button
            onClick={() => onViewDetails(job.id)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default JobCard;

import React from "react";
import { SupportStatus, IngestJobResultStatus } from "@/models/job_models";

type BadgeVariant = SupportStatus | IngestJobResultStatus | "inProgress";

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  [SupportStatus.Supported]: "bg-green-100 text-green-800 border border-green-200",
  [SupportStatus.Warning]: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  [SupportStatus.Unsupported]: "bg-red-100 text-red-800 border border-red-200",
  [IngestJobResultStatus.Success]: "bg-green-100 text-green-800 border border-green-200",
  [IngestJobResultStatus.Failed]: "bg-red-100 text-red-800 border border-red-200",
  [IngestJobResultStatus.Skipped]: "bg-gray-100 text-gray-600 border border-gray-200",
  inProgress: "bg-blue-100 text-blue-800 border border-blue-200",
};

const defaultLabels: Record<BadgeVariant, string> = {
  [SupportStatus.Supported]: "Supported",
  [SupportStatus.Warning]: "Warning",
  [SupportStatus.Unsupported]: "Unsupported",
  [IngestJobResultStatus.Success]: "Success",
  [IngestJobResultStatus.Failed]: "Failed",
  [IngestJobResultStatus.Skipped]: "Skipped",
  inProgress: "In Progress",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  size = "sm",
}) => {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${variantStyles[variant]}`}
      role="status"
      aria-label={label ?? defaultLabels[variant]}
    >
      {label ?? defaultLabels[variant]}
    </span>
  );
};

export default StatusBadge;

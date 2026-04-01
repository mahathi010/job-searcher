import {
  JobPostResponse,
  RemoteStatus,
  Experience,
  JobType as ApiJobType,
  Sponsorship,
  SourceAttribution,
  RelevanceOutcome,
  LifecycleStatus,
} from "@/types/api_types";

export {
  RemoteStatus,
  Experience,
  Sponsorship,
  SourceAttribution,
  RelevanceOutcome,
  LifecycleStatus,
};

/** Re-export backend JobType as JobType (replaces the old mock enum). */
export { ApiJobType as JobType };

export enum SupportStatus {
  Supported = "supported",
  Warning = "warning",
  Unsupported = "unsupported",
}

export enum IngestStep {
  List = "list",
  Review = "review",
  Progress = "progress",
  Result = "result",
}

export enum IngestJobResultStatus {
  Success = "success",
  Failed = "failed",
  Skipped = "skipped",
}

/** Presentational job object consumed by UI components. */
export interface DisplayJob {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  location: string;
  jobType: ApiJobType;
  salary?: string;
  source: string;
  sourceUrl?: string;
  summary: string;
  skills: string[];
  supportStatus: SupportStatus;
  supportReasons: string[];
  warnings: string[];
  eligibilityCriteria: string[];
  postedAt: string;
  expiresAt?: string;
  missingFields: string[];
  // raw backend fields for filtering/reference
  remote_status: RemoteStatus;
  experience: Experience;
  sponsorship: Sponsorship;
  relevance_outcome: RelevanceOutcome;
  lifecycle_status: LifecycleStatus;
  main_skillset: string | null;
}

/** Alias for backward compatibility with components that import Job. */
export type Job = DisplayJob;

const COMPANY_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function deriveCompanyColor(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = (hash * 31 + company.charCodeAt(i)) & 0xffffffff;
  }
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

function deriveCompanyInitials(company: string): string {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function deriveSupportStatus(response: JobPostResponse): SupportStatus {
  if (response.lifecycle_status !== LifecycleStatus.active) {
    return SupportStatus.Unsupported;
  }
  if (response.relevance_outcome === RelevanceOutcome.excluded) {
    return SupportStatus.Warning;
  }
  return SupportStatus.Supported;
}

function formatSourceAttribution(source: SourceAttribution): string {
  const map: Record<SourceAttribution, string> = {
    [SourceAttribution.linkedin]: "LinkedIn",
    [SourceAttribution.indeed]: "Indeed",
    [SourceAttribution.dice]: "Dice",
    [SourceAttribution.company_site]: "Company Site",
  };
  return map[source] ?? source;
}

/** Converts a backend JobPostResponse into a presentational DisplayJob. */
export function toDisplayJob(response: JobPostResponse): DisplayJob {
  const supportStatus = deriveSupportStatus(response);
  const missingFields: string[] = [];
  if (!response.location) missingFields.push("location");
  if (!response.posted_date) missingFields.push("posted_date");
  if (!response.mandatory_requirements_summary) missingFields.push("summary");

  const warnings: string[] = [];
  if (response.experience === Experience.unknown) warnings.push("Experience level not specified");
  if (response.sponsorship === Sponsorship.unknown) warnings.push("Sponsorship status unknown");

  return {
    id: response.id,
    title: response.title,
    company: response.company,
    companyInitials: deriveCompanyInitials(response.company),
    companyColor: deriveCompanyColor(response.company),
    location: response.location ?? "Location not specified",
    jobType: response.job_type,
    salary: undefined,
    source: formatSourceAttribution(response.source_attribution),
    sourceUrl: response.posting_link ?? undefined,
    summary: response.mandatory_requirements_summary ?? "",
    skills: response.skills,
    supportStatus,
    supportReasons:
      supportStatus === SupportStatus.Supported
        ? [`Relevant: ${response.relevance_outcome.toUpperCase()}`]
        : [],
    warnings,
    eligibilityCriteria: [],
    postedAt: response.posted_date ?? response.created_at.split("T")[0],
    expiresAt: undefined,
    missingFields,
    remote_status: response.remote_status,
    experience: response.experience,
    sponsorship: response.sponsorship,
    relevance_outcome: response.relevance_outcome,
    lifecycle_status: response.lifecycle_status,
    main_skillset: response.main_skillset,
  };
}

export interface JobFilter {
  query: string;
  jobType: ApiJobType | "all";
  sort: "recent" | "title" | "company";
  remoteStatus: RemoteStatus | "all";
  experience: Experience | "all";
  sponsorship: Sponsorship | "all";
  postedDateFrom: string;
  postedDateTo: string;
  mainSkillset: string;
}

export interface IngestJobResult {
  jobId: string;
  jobTitle: string;
  status: IngestJobResultStatus;
  message?: string;
}

export interface JobsState {
  jobs: DisplayJob[];
  loading: boolean;
  error: string | null;
  filters: JobFilter;
  selectedIds: Set<string>;
  drawerJobId: string | null;
  ingestStep: IngestStep;
  ingestResults: IngestJobResult[];
  ingestProgress: number;
  currentPage: number;
  totalCount: number;
  pageSize: number;
}

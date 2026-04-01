export enum SupportStatus {
  Supported = "supported",
  Warning = "warning",
  Unsupported = "unsupported",
}

export enum JobType {
  FullTime = "full_time",
  PartTime = "part_time",
  Contract = "contract",
  Internship = "internship",
  Remote = "remote",
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

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  location: string;
  jobType: JobType;
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
}

export interface JobFilter {
  query: string;
  status: SupportStatus | "all";
  jobType: JobType | "all";
  sort: "recent" | "title" | "company";
}

export interface IngestJobResult {
  jobId: string;
  jobTitle: string;
  status: IngestJobResultStatus;
  message?: string;
}

export interface PaginatedJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  page_size: number;
}

export interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilter;
  selectedIds: Set<string>;
  drawerJobId: string | null;
  ingestStep: IngestStep;
  ingestResults: IngestJobResult[];
  ingestProgress: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

/** TypeScript mirror of backend Pydantic schemas and enums. */

export enum RemoteStatus {
  remote = "remote",
  hybrid = "hybrid",
  onsite = "onsite",
  unknown = "unknown",
}

export enum Experience {
  junior = "junior",
  mid = "mid",
  senior = "senior",
  lead = "lead",
  unknown = "unknown",
}

export enum JobType {
  full_time = "full_time",
  part_time = "part_time",
  contract = "contract",
  internship = "internship",
  unknown = "unknown",
}

export enum Sponsorship {
  yes = "yes",
  no = "no",
  unknown = "unknown",
}

export enum SourceAttribution {
  linkedin = "linkedin",
  indeed = "indeed",
  dice = "dice",
  company_site = "company_site",
}

export enum RelevanceOutcome {
  ai = "ai",
  ds = "ds",
  ml = "ml",
  excluded = "excluded",
}

export enum LifecycleStatus {
  active = "active",
  deactivated = "deactivated",
  deleted = "deleted",
}

export interface JobPostResponse {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote_status: RemoteStatus;
  experience: Experience;
  job_type: JobType;
  main_skillset: string | null;
  skills: string[];
  sponsorship: Sponsorship;
  posted_date: string | null;
  mandatory_requirements_summary: string | null;
  source_attribution: SourceAttribution;
  posting_link: string | null;
  relevance_outcome: RelevanceOutcome;
  lifecycle_status: LifecycleStatus;
  created_at: string;
  updated_at: string;
}

export interface IngestJobPostRequest {
  title: string;
  company: string;
  location?: string | null;
  remote_status?: RemoteStatus;
  experience?: Experience;
  job_type?: JobType;
  main_skillset?: string | null;
  skills?: string[];
  sponsorship?: Sponsorship;
  posted_date?: string | null;
  mandatory_requirements_summary?: string | null;
  source_attribution: SourceAttribution;
  posting_link?: string | null;
}

export interface IngestJobPostsRequest {
  postings: IngestJobPostRequest[];
}

export interface JobPostUpdateRequest {
  title?: string;
  company?: string;
  location?: string | null;
  remote_status?: RemoteStatus;
  experience?: Experience;
  job_type?: JobType;
  main_skillset?: string | null;
  skills?: string[];
  sponsorship?: Sponsorship;
  posted_date?: string | null;
  mandatory_requirements_summary?: string | null;
}

export interface ListJobPostsResponse {
  items: JobPostResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface FetchJobsParams {
  job_type?: JobType;
  experience?: Experience;
  remote_status?: RemoteStatus;
  location?: string;
  main_skillset?: string;
  sponsorship?: Sponsorship;
  posted_date_from?: string;
  posted_date_to?: string;
  page?: number;
  page_size?: number;
  sort_by?: "created_at" | "posted_date" | "title" | "company";
  sort_order?: "asc" | "desc";
}

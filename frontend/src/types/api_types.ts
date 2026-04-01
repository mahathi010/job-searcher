// Generated from api_contract.json

export type RemoteStatusEnum = "remote" | "hybrid" | "onsite" | "unknown";

export type ExperienceEnum = "junior" | "mid" | "senior" | "lead" | "unknown";

export type JobTypeEnum = "full_time" | "part_time" | "contract" | "internship" | "unknown";

export type SponsorshipEnum = "yes" | "no" | "unknown";

export type SourceAttributionEnum = "linkedin" | "indeed" | "dice" | "company_site";

export type RelevanceOutcomeEnum = "ai" | "ds" | "ml" | "excluded";

export type LifecycleStatusEnum = "active" | "deactivated" | "deleted";

export interface IngestJobPostRequest {
  title: string;
  company: string;
  location?: string | null;
  remote_status?: RemoteStatusEnum;
  experience?: ExperienceEnum;
  job_type?: JobTypeEnum;
  main_skillset?: string | null;
  skills?: string[];
  sponsorship?: SponsorshipEnum;
  posted_date?: string | null;
  mandatory_requirements_summary?: string | null;
  source_attribution: SourceAttributionEnum;
  posting_link?: string | null;
}

export interface IngestJobPostsRequest {
  postings: IngestJobPostRequest[];
}

export interface JobPostResponse {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote_status: RemoteStatusEnum;
  experience: ExperienceEnum;
  job_type: JobTypeEnum;
  main_skillset: string | null;
  skills: string[];
  sponsorship: SponsorshipEnum;
  posted_date: string | null;
  mandatory_requirements_summary: string | null;
  source_attribution: SourceAttributionEnum;
  posting_link: string | null;
  relevance_outcome: RelevanceOutcomeEnum;
  lifecycle_status: LifecycleStatusEnum;
  created_at: string;
  updated_at: string;
}

export interface JobPostUpdateRequest {
  title?: string | null;
  company?: string | null;
  location?: string | null;
  remote_status?: RemoteStatusEnum | null;
  experience?: ExperienceEnum | null;
  job_type?: JobTypeEnum | null;
  main_skillset?: string | null;
  skills?: string[] | null;
  sponsorship?: SponsorshipEnum | null;
  posted_date?: string | null;
  mandatory_requirements_summary?: string | null;
}

export interface ListJobPostsResponse {
  items: JobPostResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface HTTPValidationError {
  detail?: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

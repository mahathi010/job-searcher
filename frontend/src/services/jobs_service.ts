import {
  Job,
  JobFilter,
  JobType,
  SupportStatus,
  IngestJobResult,
  IngestJobResultStatus,
  PaginatedJobsResponse,
} from "@/models/job_models";
import {
  JobPostResponse,
  IngestJobPostRequest,
  SourceAttributionEnum,
  RelevanceOutcomeEnum,
} from "@/types/api_types";
import { apiFetch, ApiError } from "@/services/api_client";

// --- Mapping helpers ---

const COMPANY_COLOR_PALETTE = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-yellow-600",
];

function deriveCompanyInitials(company: string): string {
  const words = company.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function deriveCompanyColor(company: string): string {
  const sum = company.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COMPANY_COLOR_PALETTE[sum % COMPANY_COLOR_PALETTE.length];
}

const JOB_TYPE_MAP: Record<string, JobType> = {
  full_time: JobType.FullTime,
  part_time: JobType.PartTime,
  contract: JobType.Contract,
  internship: JobType.Internship,
  unknown: JobType.FullTime,
};

const SOURCE_DISPLAY_MAP: Record<SourceAttributionEnum, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  dice: "Dice",
  company_site: "Company Site",
};

function deriveSourceDisplay(source: SourceAttributionEnum): string {
  return SOURCE_DISPLAY_MAP[source] ?? source;
}

function deriveSupportStatus(r: JobPostResponse): SupportStatus {
  if (r.relevance_outcome === "excluded") return SupportStatus.Unsupported;
  const hasUnknowns =
    r.experience === "unknown" ||
    r.job_type === "unknown" ||
    r.remote_status === "unknown";
  return hasUnknowns ? SupportStatus.Warning : SupportStatus.Supported;
}

function deriveSupportReasons(r: JobPostResponse): string[] {
  if (r.relevance_outcome === "excluded") return [];
  const reasons: string[] = [
    `Classified as ${r.relevance_outcome.toUpperCase()}`,
  ];
  if (r.experience !== "unknown") reasons.push(`Experience: ${r.experience}`);
  if (r.remote_status !== "unknown")
    reasons.push(`Remote: ${r.remote_status}`);
  if (r.skills.length > 0) reasons.push(`${r.skills.length} skills listed`);
  return reasons;
}

function deriveWarnings(r: JobPostResponse): string[] {
  const warnings: string[] = [];
  if (r.experience === "unknown") warnings.push("Experience level not specified");
  if (r.job_type === "unknown") warnings.push("Job type not specified");
  if (r.remote_status === "unknown") warnings.push("Remote status not specified");
  return warnings;
}

function deriveMissingFields(r: JobPostResponse): string[] {
  const missing: string[] = [];
  if (!r.location) missing.push("location");
  if (r.experience === "unknown") missing.push("experience");
  if (r.job_type === "unknown") missing.push("job_type");
  if (r.remote_status === "unknown") missing.push("remote_status");
  if (!r.posted_date) missing.push("posted_date");
  if (!r.main_skillset) missing.push("main_skillset");
  return missing;
}

function deriveEligibilityCriteria(summary: string | null): string[] {
  if (!summary) return [];
  return summary
    .split(/\n|•|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function mapJobPostResponseToJob(r: JobPostResponse): Job {
  return {
    id: r.id,
    title: r.title,
    company: r.company,
    companyInitials: deriveCompanyInitials(r.company),
    companyColor: deriveCompanyColor(r.company),
    location: r.location ?? "",
    jobType: JOB_TYPE_MAP[r.job_type] ?? JobType.FullTime,
    salary: undefined,
    source: deriveSourceDisplay(r.source_attribution),
    sourceUrl: r.posting_link ?? undefined,
    summary: r.mandatory_requirements_summary ?? "",
    skills: r.skills,
    supportStatus: deriveSupportStatus(r),
    supportReasons: deriveSupportReasons(r),
    warnings: deriveWarnings(r),
    eligibilityCriteria: deriveEligibilityCriteria(r.mandatory_requirements_summary),
    postedAt: r.posted_date ?? r.created_at.split("T")[0],
    expiresAt: undefined,
    missingFields: deriveMissingFields(r),
  };
}

// --- Filter helpers ---

const SOURCE_ENUM_MAP: Record<string, SourceAttributionEnum> = {
  LinkedIn: "linkedin",
  Indeed: "indeed",
  Dice: "dice",
  "Company Site": "company_site",
};

function jobToIngestRequest(job: Job): IngestJobPostRequest {
  const sourceAttr: SourceAttributionEnum =
    SOURCE_ENUM_MAP[job.source] ?? "company_site";
  return {
    title: job.title,
    company: job.company,
    location: job.location || null,
    source_attribution: sourceAttr,
    posting_link: job.sourceUrl ?? null,
    skills: job.skills,
    mandatory_requirements_summary: job.summary || null,
    // Fields not preserved in frontend Job model default to "unknown"
    remote_status: "unknown",
    experience: "unknown",
    job_type: "unknown",
    sponsorship: "unknown",
  };
}

function relevanceOutcomeForStatus(
  status: SupportStatus
): RelevanceOutcomeEnum | undefined {
  if (status === SupportStatus.Unsupported) return "excluded";
  return undefined;
}

// --- Public API ---

export async function fetchJobs(
  filter?: Partial<JobFilter>
): Promise<PaginatedJobsResponse> {
  const params = new URLSearchParams();

  if (filter?.jobType && filter.jobType !== "all") {
    params.set("job_type", filter.jobType);
  }
  if (filter?.sort === "title") {
    params.set("sort_by", "title");
    params.set("sort_order", "asc");
  } else if (filter?.sort === "company") {
    params.set("sort_by", "company");
    params.set("sort_order", "asc");
  } else {
    params.set("sort_by", "created_at");
    params.set("sort_order", "desc");
  }

  params.set("page_size", "100");

  const qs = params.toString();
  const path = `/v1/job-posts/${qs ? `?${qs}` : ""}`;

  const response = await apiFetch<{
    items: JobPostResponse[];
    total: number;
    page: number;
    page_size: number;
  }>(path);

  let jobs = response.items.map(mapJobPostResponseToJob);

  // Client-side filters not supported by backend query params
  if (filter?.status && filter.status !== "all") {
    const relevance = relevanceOutcomeForStatus(filter.status);
    if (relevance) {
      jobs = jobs.filter((j) => j.supportStatus === filter.status);
    } else {
      jobs = jobs.filter((j) => j.supportStatus === filter.status);
    }
  }

  if (filter?.query) {
    const q = filter.query.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return {
    jobs,
    total: response.total,
    page: response.page,
    page_size: response.page_size,
  };
}

export async function fetchJobById(id: string): Promise<Job | null> {
  try {
    const response = await apiFetch<JobPostResponse>(`/v1/job-posts/${id}`);
    return mapJobPostResponseToJob(response);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function ingestJobs(jobs: Job[]): Promise<IngestJobResult[]> {
  const postings = jobs.map(jobToIngestRequest);
  try {
    const created = await apiFetch<JobPostResponse[]>("/v1/job-posts/ingest", {
      method: "POST",
      body: JSON.stringify({ postings }),
    });
    return created.map((r) => ({
      jobId: r.id,
      jobTitle: r.title,
      status: IngestJobResultStatus.Success,
    }));
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Ingest failed";
    return jobs.map((j) => ({
      jobId: j.id,
      jobTitle: j.title,
      status: IngestJobResultStatus.Failed,
      message,
    }));
  }
}

// Mock support status lookup used only by simulateIngest for test compatibility.
// Keys are the IDs from the original mock dataset.
const MOCK_SUPPORT: Record<string, { title: string; status: SupportStatus }> = {
  "job-001": { title: "Senior Software Engineer", status: SupportStatus.Supported },
  "job-002": { title: "Product Designer", status: SupportStatus.Supported },
  "job-003": { title: "Data Analyst", status: SupportStatus.Warning },
  "job-004": { title: "DevOps Engineer", status: SupportStatus.Supported },
  "job-005": { title: "Marketing Manager", status: SupportStatus.Unsupported },
  "job-006": { title: "Frontend Engineer", status: SupportStatus.Supported },
  "job-007": { title: "Machine Learning Engineer", status: SupportStatus.Supported },
  "job-008": { title: "Customer Success Manager", status: SupportStatus.Warning },
  "job-009": { title: "Backend Engineer (Node.js)", status: SupportStatus.Supported },
  "job-010": { title: "UX Researcher", status: SupportStatus.Supported },
  "job-011": { title: "Sales Development Representative", status: SupportStatus.Unsupported },
  "job-012": { title: "Security Engineer", status: SupportStatus.Supported },
  "job-013": { title: "Product Manager", status: SupportStatus.Warning },
  "job-014": { title: "Mobile Engineer (iOS)", status: SupportStatus.Supported },
  "job-015": { title: "Technical Writer", status: SupportStatus.Supported },
  "job-016": { title: "Finance Analyst", status: SupportStatus.Warning },
  "job-017": { title: "HR Business Partner", status: SupportStatus.Unsupported },
  "job-018": { title: "Embedded Systems Engineer", status: SupportStatus.Supported },
  "job-019": { title: "QA Engineer", status: SupportStatus.Supported },
  "job-020": { title: "Blockchain Developer", status: SupportStatus.Warning },
};

// Kept for test compatibility — delegates to the mock status lookup.
// Use ingestJobs() for real API ingestion.
export async function simulateIngest(
  jobIds: string[]
): Promise<IngestJobResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return jobIds.map((id) => {
    const mock = MOCK_SUPPORT[id];
    if (!mock) {
      return {
        jobId: id,
        jobTitle: "Unknown",
        status: IngestJobResultStatus.Failed,
        message: "Job not found",
      };
    }
    if (mock.status === SupportStatus.Unsupported) {
      return {
        jobId: id,
        jobTitle: mock.title,
        status: IngestJobResultStatus.Failed,
        message: "Job is unsupported",
      };
    }
    return { jobId: id, jobTitle: mock.title, status: IngestJobResultStatus.Success };
  });
}

import { apiFetch } from "@/config/api_config";
import {
  JobPostResponse,
  IngestJobPostRequest,
  ListJobPostsResponse,
  JobPostUpdateRequest,
  FetchJobsParams,
} from "@/types/api_types";
import {
  DisplayJob,
  IngestJobResult,
  IngestJobResultStatus,
  toDisplayJob,
} from "@/models/job_models";

export async function fetchJobs(
  params: FetchJobsParams = {}
): Promise<{ jobs: DisplayJob[]; total: number; page: number; page_size: number }> {
  const qs = new URLSearchParams();

  if (params.job_type) qs.set("job_type", params.job_type);
  if (params.experience) qs.set("experience", params.experience);
  if (params.remote_status) qs.set("remote_status", params.remote_status);
  if (params.location) qs.set("location", params.location);
  if (params.main_skillset) qs.set("main_skillset", params.main_skillset);
  if (params.sponsorship) qs.set("sponsorship", params.sponsorship);
  if (params.posted_date_from) qs.set("posted_date_from", params.posted_date_from);
  if (params.posted_date_to) qs.set("posted_date_to", params.posted_date_to);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.sort_order) qs.set("sort_order", params.sort_order);

  const query = qs.toString();
  const url = `/v1/job-posts/${query ? `?${query}` : ""}`;
  const data = await apiFetch<ListJobPostsResponse>(url);

  return {
    jobs: data.items.map(toDisplayJob),
    total: data.total,
    page: data.page,
    page_size: data.page_size,
  };
}

export async function fetchJobById(id: string): Promise<DisplayJob | null> {
  try {
    const data = await apiFetch<JobPostResponse>(`/v1/job-posts/${id}`);
    return toDisplayJob(data);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
      return null;
    }
    throw err;
  }
}

export async function ingestJobs(
  postings: IngestJobPostRequest[]
): Promise<IngestJobResult[]> {
  const responses = await apiFetch<JobPostResponse[]>("/v1/job-posts/ingest", {
    method: "POST",
    body: JSON.stringify({ postings }),
  });

  return responses.map((r) => ({
    jobId: r.id,
    jobTitle: r.title,
    status: IngestJobResultStatus.Success,
  }));
}

export async function updateJob(
  id: string,
  patch: JobPostUpdateRequest
): Promise<DisplayJob> {
  const data = await apiFetch<JobPostResponse>(`/v1/job-posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return toDisplayJob(data);
}

export async function deactivateJob(id: string): Promise<DisplayJob> {
  const data = await apiFetch<JobPostResponse>(`/v1/job-posts/${id}/deactivate`, {
    method: "POST",
  });
  return toDisplayJob(data);
}

export async function deleteJob(id: string): Promise<void> {
  await apiFetch<void>(`/v1/job-posts/${id}`, {
    method: "DELETE",
  });
}

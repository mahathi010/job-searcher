import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchJobs,
  fetchJobById,
  ingestJobs,
  updateJob,
  deactivateJob,
  deleteJob,
} from "@/services/jobs_service";
import {
  JobType,
  RemoteStatus,
  Experience,
  Sponsorship,
} from "@/models/job_models";
import {
  SourceAttribution,
  RelevanceOutcome,
  LifecycleStatus,
  JobPostResponse,
  ListJobPostsResponse,
} from "@/types/api_types";

function makeJobResponse(overrides: Partial<JobPostResponse> = {}): JobPostResponse {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Software Engineer",
    company: "Acme Corp",
    location: "Remote",
    remote_status: RemoteStatus.remote,
    experience: Experience.senior,
    job_type: JobType.full_time,
    main_skillset: "Python",
    skills: ["Python", "FastAPI"],
    sponsorship: Sponsorship.yes,
    posted_date: "2026-03-15",
    mandatory_requirements_summary: "5+ years experience",
    source_attribution: SourceAttribution.linkedin,
    posting_link: "https://linkedin.com/jobs/1",
    relevance_outcome: RelevanceOutcome.ai,
    lifecycle_status: LifecycleStatus.active,
    created_at: "2026-03-15T10:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
    ...overrides,
  };
}

function makeListResponse(overrides: Partial<ListJobPostsResponse> = {}): ListJobPostsResponse {
  return {
    items: [makeJobResponse()],
    total: 1,
    page: 1,
    page_size: 20,
    ...overrides,
  };
}

function mockFetchOk(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status,
    json: () => Promise.resolve(body),
  });
}

function mockFetchError(status: number, detail = "Not found") {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ detail }),
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetchOk(makeListResponse()));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── fetchJobs ───────────────────────────────────────────────────────────────

describe("fetchJobs", () => {
  it("calls GET /v1/job-posts/ with no params when none provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs();

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe("/v1/job-posts/");
  });

  it("appends job_type query param when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ job_type: JobType.full_time });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("job_type=full_time");
  });

  it("appends experience query param when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ experience: Experience.senior });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("experience=senior");
  });

  it("appends remote_status query param when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ remote_status: RemoteStatus.remote });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("remote_status=remote");
  });

  it("appends sponsorship query param when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ sponsorship: Sponsorship.yes });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("sponsorship=yes");
  });

  it("appends posted_date_from and posted_date_to when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ posted_date_from: "2026-01-01", posted_date_to: "2026-03-31" });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("posted_date_from=2026-01-01");
    expect(url).toContain("posted_date_to=2026-03-31");
  });

  it("appends page and page_size when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ page: 2, page_size: 10 });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("page=2");
    expect(url).toContain("page_size=10");
  });

  it("appends sort_by and sort_order when provided", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ sort_by: "title", sort_order: "asc" });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("sort_by=title");
    expect(url).toContain("sort_order=asc");
  });

  it("returns mapped DisplayJobs with pagination metadata", async () => {
    const items = [makeJobResponse(), makeJobResponse({ id: "00000000-0000-0000-0000-000000000002", title: "Another Job" })];
    vi.stubGlobal("fetch", mockFetchOk({ items, total: 2, page: 1, page_size: 20 }));

    const result = await fetchJobs();

    expect(result.jobs).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.page_size).toBe(20);
    expect(result.jobs[0].id).toBe("00000000-0000-0000-0000-000000000001");
    expect(result.jobs[0].title).toBe("Software Engineer");
  });

  it("throws ApiError on non-2xx response", async () => {
    vi.stubGlobal("fetch", mockFetchError(500, "Internal Server Error"));

    await expect(fetchJobs()).rejects.toThrow("Internal Server Error");
  });

  it("does not append undefined params to the URL", async () => {
    const mockFetch = mockFetchOk(makeListResponse());
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobs({ job_type: undefined, experience: undefined });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).not.toContain("job_type");
    expect(url).not.toContain("experience");
  });
});

// ─── fetchJobById ─────────────────────────────────────────────────────────────

describe("fetchJobById", () => {
  it("calls GET /v1/job-posts/{id}", async () => {
    const job = makeJobResponse();
    const mockFetch = mockFetchOk(job);
    vi.stubGlobal("fetch", mockFetch);

    await fetchJobById("00000000-0000-0000-0000-000000000001");

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe("/v1/job-posts/00000000-0000-0000-0000-000000000001");
  });

  it("returns a DisplayJob on success", async () => {
    vi.stubGlobal("fetch", mockFetchOk(makeJobResponse()));

    const result = await fetchJobById("00000000-0000-0000-0000-000000000001");

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Software Engineer");
    expect(result?.companyInitials).toBe("AC");
  });

  it("returns null on 404", async () => {
    vi.stubGlobal("fetch", mockFetchError(404, "Not found"));

    const result = await fetchJobById("nonexistent-id");

    expect(result).toBeNull();
  });

  it("re-throws non-404 errors", async () => {
    vi.stubGlobal("fetch", mockFetchError(500, "Server error"));

    await expect(fetchJobById("some-id")).rejects.toThrow("Server error");
  });
});

// ─── ingestJobs ───────────────────────────────────────────────────────────────

describe("ingestJobs", () => {
  it("calls POST /v1/job-posts/ingest with correct body", async () => {
    const mockFetch = mockFetchOk([makeJobResponse()]);
    vi.stubGlobal("fetch", mockFetch);

    const payload = [
      {
        title: "Engineer",
        company: "Corp",
        source_attribution: SourceAttribution.linkedin,
      },
    ];
    await ingestJobs(payload);

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/v1/job-posts/ingest");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body as string);
    expect(body.postings).toHaveLength(1);
    expect(body.postings[0].title).toBe("Engineer");
    expect(body.postings[0].source_attribution).toBe("linkedin");
  });

  it("returns IngestJobResult array with Success status on 201", async () => {
    vi.stubGlobal("fetch", mockFetchOk([makeJobResponse()], 201));

    const results = await ingestJobs([
      { title: "Engineer", company: "Corp", source_attribution: SourceAttribution.linkedin },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("success");
    expect(results[0].jobTitle).toBe("Software Engineer");
  });

  it("throws on non-2xx response", async () => {
    vi.stubGlobal("fetch", mockFetchError(422, "Validation error"));

    await expect(
      ingestJobs([{ title: "", company: "Corp", source_attribution: SourceAttribution.linkedin }])
    ).rejects.toThrow("Validation error");
  });
});

// ─── updateJob ────────────────────────────────────────────────────────────────

describe("updateJob", () => {
  it("calls PUT /v1/job-posts/{id} with patch body", async () => {
    const mockFetch = mockFetchOk(makeJobResponse({ title: "Updated Title" }));
    vi.stubGlobal("fetch", mockFetch);

    const result = await updateJob("00000000-0000-0000-0000-000000000001", { title: "Updated Title" });

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/v1/job-posts/00000000-0000-0000-0000-000000000001");
    expect(options.method).toBe("PUT");
    const body = JSON.parse(options.body as string);
    expect(body.title).toBe("Updated Title");
    expect(result.title).toBe("Updated Title");
  });

  it("throws on 404", async () => {
    vi.stubGlobal("fetch", mockFetchError(404, "Job post not found"));

    await expect(
      updateJob("nonexistent-id", { title: "New" })
    ).rejects.toThrow("Job post not found");
  });
});

// ─── deactivateJob ────────────────────────────────────────────────────────────

describe("deactivateJob", () => {
  it("calls POST /v1/job-posts/{id}/deactivate", async () => {
    const mockFetch = mockFetchOk(
      makeJobResponse({ lifecycle_status: LifecycleStatus.deactivated })
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await deactivateJob("00000000-0000-0000-0000-000000000001");

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/v1/job-posts/00000000-0000-0000-0000-000000000001/deactivate");
    expect(options.method).toBe("POST");
    expect(result.lifecycle_status).toBe(LifecycleStatus.deactivated);
  });

  it("throws on 409 conflict (invalid lifecycle transition)", async () => {
    vi.stubGlobal("fetch", mockFetchError(409, "Invalid lifecycle transition"));

    await expect(deactivateJob("some-id")).rejects.toThrow("Invalid lifecycle transition");
  });
});

// ─── deleteJob ────────────────────────────────────────────────────────────────

describe("deleteJob", () => {
  it("calls DELETE /v1/job-posts/{id}", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", mockFetch);

    await deleteJob("00000000-0000-0000-0000-000000000001");

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/v1/job-posts/00000000-0000-0000-0000-000000000001");
    expect(options.method).toBe("DELETE");
  });

  it("throws on 404", async () => {
    vi.stubGlobal("fetch", mockFetchError(404, "Job post not found"));

    await expect(deleteJob("nonexistent-id")).rejects.toThrow("Job post not found");
  });

  it("resolves void on 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));

    await expect(deleteJob("some-id")).resolves.toBeUndefined();
  });
});

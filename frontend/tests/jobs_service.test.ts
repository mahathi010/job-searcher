import { describe, it, expect } from "vitest";
import { fetchJobs, fetchJobById, simulateIngest } from "@/services/jobs_service";
import { SupportStatus, JobType, IngestJobResultStatus } from "@/models/job_models";

describe("fetchJobs", () => {
  it("returns all jobs when no filter is applied", async () => {
    const jobs = await fetchJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(20);
  });

  it("filters by support status — supported only", async () => {
    const jobs = await fetchJobs({ status: SupportStatus.Supported });
    expect(jobs.every((j) => j.supportStatus === SupportStatus.Supported)).toBe(true);
  });

  it("filters by support status — unsupported only", async () => {
    const jobs = await fetchJobs({ status: SupportStatus.Unsupported });
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((j) => j.supportStatus === SupportStatus.Unsupported)).toBe(true);
  });

  it("filters by job type — remote only", async () => {
    const jobs = await fetchJobs({ jobType: JobType.Remote });
    expect(jobs.every((j) => j.jobType === JobType.Remote)).toBe(true);
  });

  it("filters by text query matching title", async () => {
    const jobs = await fetchJobs({ query: "engineer" });
    expect(jobs.length).toBeGreaterThan(0);
    expect(
      jobs.every(
        (j) =>
          j.title.toLowerCase().includes("engineer") ||
          j.company.toLowerCase().includes("engineer") ||
          j.location.toLowerCase().includes("engineer") ||
          j.skills.some((s) => s.toLowerCase().includes("engineer"))
      )
    ).toBe(true);
  });

  it("returns empty array for query with no matches", async () => {
    const jobs = await fetchJobs({ query: "zzznomatchxxx" });
    expect(jobs).toHaveLength(0);
  });

  it("sorts by title alphabetically", async () => {
    const jobs = await fetchJobs({ sort: "title" });
    for (let i = 1; i < jobs.length; i++) {
      expect(jobs[i - 1].title.localeCompare(jobs[i].title)).toBeLessThanOrEqual(0);
    }
  });

  it("sorts by most recent by default", async () => {
    const jobs = await fetchJobs({ sort: "recent" });
    for (let i = 1; i < jobs.length; i++) {
      expect(jobs[i - 1].postedAt >= jobs[i].postedAt).toBe(true);
    }
  });
});

describe("fetchJobById", () => {
  it("returns the correct job for a known id", async () => {
    const job = await fetchJobById("job-001");
    expect(job).not.toBeNull();
    expect(job?.title).toBe("Senior Software Engineer");
  });

  it("returns null for an unknown id", async () => {
    const job = await fetchJobById("not-a-real-id");
    expect(job).toBeNull();
  });
});

describe("simulateIngest", () => {
  it("returns a result for each submitted job id", async () => {
    const ids = ["job-001", "job-006", "job-009"];
    const results = await simulateIngest(ids);
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.jobId)).toEqual(expect.arrayContaining(ids));
  });

  it("marks supported jobs as success", async () => {
    // job-001 is supported, should always succeed
    const results = await simulateIngest(["job-001"]);
    expect(results[0].status).toBe(IngestJobResultStatus.Success);
  });

  it("marks unsupported jobs as failed", async () => {
    // job-005 is unsupported
    const results = await simulateIngest(["job-005"]);
    expect(results[0].status).toBe(IngestJobResultStatus.Failed);
    expect(results[0].message).toBeTruthy();
  });

  it("returns failed result for unknown job ids", async () => {
    const results = await simulateIngest(["unknown-id-xyz"]);
    expect(results[0].status).toBe(IngestJobResultStatus.Failed);
    expect(results[0].jobTitle).toBe("Unknown");
  });

  it("handles empty input gracefully", async () => {
    const results = await simulateIngest([]);
    expect(results).toHaveLength(0);
  });
});

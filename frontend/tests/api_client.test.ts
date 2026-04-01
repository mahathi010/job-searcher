import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch, ApiError } from "@/services/api_client";

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns typed data on a successful JSON response", async () => {
    const payload = { id: "abc", title: "Test Job" };
    vi.stubGlobal("fetch", mockFetch(200, payload));

    const result = await apiFetch<typeof payload>("/v1/job-posts/abc");

    expect(result).toEqual(payload);
  });

  it("throws ApiError with status and detail on a non-ok response", async () => {
    const errorBody = { detail: [{ loc: ["body"], msg: "field required", type: "missing" }] };
    vi.stubGlobal("fetch", mockFetch(422, errorBody, false));

    await expect(apiFetch("/v1/job-posts/")).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      detail: errorBody,
    });
  });

  it("throws ApiError with status 0 on a network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    const err = await apiFetch("/v1/job-posts/").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toContain("Failed to fetch");
  });

  it("sends correct Content-Type and Accept headers on POST requests", async () => {
    const payload = [{ id: "1", title: "Ingested" }];
    const fetchMock = mockFetch(201, payload);
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/v1/job-posts/ingest", {
      method: "POST",
      body: JSON.stringify({ postings: [] }),
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers["Accept"]).toBe("application/json");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("does not set Content-Type header on GET requests without a body", async () => {
    const fetchMock = mockFetch(200, { items: [], total: 0, page: 1, page_size: 20 });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/v1/job-posts/");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers["Accept"]).toBe("application/json");
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("returns undefined for 204 No Content responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        statusText: "No Content",
        json: () => Promise.reject(new Error("no body")),
      } as Response)
    );

    const result = await apiFetch("/v1/job-posts/abc");
    expect(result).toBeUndefined();
  });
});

export const API_BASE = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const options: RequestInit = {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (import.meta.env.MODE !== "production") {
      console.error(`[api] Network failure: ${options.method ?? "GET"} ${url}`, err);
    }
    throw new ApiError(0, message);
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = undefined;
    }
    const message = `HTTP ${response.status}: ${response.statusText}`;
    if (import.meta.env.MODE !== "production") {
      console.error(`[api] Request failed: ${options.method ?? "GET"} ${url}`, { status: response.status, detail });
    }
    throw new ApiError(response.status, message, detail);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

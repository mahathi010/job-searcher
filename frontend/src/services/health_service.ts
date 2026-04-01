import { apiFetch } from "@/services/api_client";
import { HealthResponse } from "@/types/api_types";

export type { HealthResponse };

export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

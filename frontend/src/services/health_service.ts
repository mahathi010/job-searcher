const API_BASE = import.meta.env.VITE_API_URL || "";

export interface HealthResponse {
  status: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error("Health check failed");
  return response.json();
}

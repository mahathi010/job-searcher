import { useState, useEffect } from "react";
import { fetchHealth } from "@/services/health_service";

export type HealthStatus = "checking" | "online" | "offline";

export function useHealth(pollIntervalMs = 30000) {
  const [status, setStatus] = useState<HealthStatus>("checking");

  const check = async () => {
    try {
      await fetchHealth();
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return { status };
}

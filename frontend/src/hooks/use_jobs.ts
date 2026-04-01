import { useEffect, useCallback } from "react";
import { useJobsContext } from "@/store/jobs_context";
import { fetchJobs } from "@/services/jobs_service";

export function useJobs() {
  const { state, dispatch } = useJobsContext();

  const load = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await fetchJobs(state.filters);
      dispatch({ type: "SET_JOBS", payload: result.jobs });
      dispatch({
        type: "SET_PAGINATION",
        payload: { total: result.total, page: result.page, page_size: result.page_size },
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to load jobs",
      });
    }
  }, [dispatch, state.filters]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    jobs: state.jobs,
    loading: state.loading,
    error: state.error,
    refresh: load,
  };
}

import { useEffect, useCallback, useRef } from "react";
import { useJobsContext } from "@/store/jobs_context";
import { fetchJobs } from "@/services/jobs_service";
import { FetchJobsParams } from "@/types/api_types";
import { JobType, RemoteStatus, Experience, Sponsorship } from "@/models/job_models";

function buildFetchParams(
  filters: ReturnType<typeof useJobsContext>["state"]["filters"],
  page: number,
  pageSize: number
): FetchJobsParams {
  const params: FetchJobsParams = {
    page,
    page_size: pageSize,
  };

  if (filters.query) params.location = filters.query;
  if (filters.jobType !== "all") params.job_type = filters.jobType as JobType;
  if (filters.remoteStatus !== "all") params.remote_status = filters.remoteStatus as RemoteStatus;
  if (filters.experience !== "all") params.experience = filters.experience as Experience;
  if (filters.sponsorship !== "all") params.sponsorship = filters.sponsorship as Sponsorship;
  if (filters.mainSkillset) params.main_skillset = filters.mainSkillset;
  if (filters.postedDateFrom) params.posted_date_from = filters.postedDateFrom;
  if (filters.postedDateTo) params.posted_date_to = filters.postedDateTo;

  if (filters.sort === "title") {
    params.sort_by = "title";
    params.sort_order = "asc";
  } else if (filters.sort === "company") {
    params.sort_by = "company";
    params.sort_order = "asc";
  } else {
    params.sort_by = "created_at";
    params.sort_order = "desc";
  }

  return params;
}

export function useJobs() {
  const { state, dispatch } = useJobsContext();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const params = buildFetchParams(state.filters, state.currentPage, state.pageSize);
      const result = await fetchJobs(params);
      dispatch({ type: "SET_JOBS", payload: result.jobs });
      dispatch({ type: "SET_TOTAL", payload: result.total });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to load jobs",
      });
    }
  }, [dispatch, state.filters, state.currentPage, state.pageSize]);

  useEffect(() => {
    // Debounce text-based filter changes by 300ms; fire immediately otherwise
    const isTextInput = state.filters.query !== undefined || state.filters.mainSkillset !== undefined;
    if (isTextInput) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(load, 300);
      return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
      };
    }
    load();
  }, [load]);

  return {
    jobs: state.jobs,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    refresh: load,
  };
}

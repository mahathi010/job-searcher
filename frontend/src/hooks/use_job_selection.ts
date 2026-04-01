import { useJobsContext } from "@/store/jobs_context";
import { SupportStatus } from "@/models/job_models";

export function useJobSelection() {
  const { state, dispatch } = useJobsContext();

  const isSelected = (id: string) => state.selectedIds.has(id);

  const select = (id: string) => dispatch({ type: "SELECT_JOB", payload: id });
  const deselect = (id: string) => dispatch({ type: "DESELECT_JOB", payload: id });
  const toggle = (id: string) => (isSelected(id) ? deselect(id) : select(id));

  const selectAll = () => {
    const ids = state.jobs
      .filter((j) => j.supportStatus !== SupportStatus.Unsupported)
      .map((j) => j.id);
    dispatch({ type: "SELECT_ALL", payload: ids });
  };

  const clearAll = () => dispatch({ type: "CLEAR_SELECTION" });

  const selectedJobs = state.jobs.filter((j) => state.selectedIds.has(j.id));

  return {
    selectedIds: state.selectedIds,
    selectedJobs,
    selectedCount: state.selectedIds.size,
    isSelected,
    select,
    deselect,
    toggle,
    selectAll,
    clearAll,
  };
}

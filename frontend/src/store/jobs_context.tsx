import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  DisplayJob,
  Job,
  JobFilter,
  JobsState,
  IngestStep,
  IngestJobResult,
  SupportStatus,
} from "@/models/job_models";

const initialFilter: JobFilter = {
  query: "",
  jobType: "all",
  sort: "recent",
  remoteStatus: "all",
  experience: "all",
  sponsorship: "all",
  postedDateFrom: "",
  postedDateTo: "",
  mainSkillset: "",
};

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
  filters: initialFilter,
  selectedIds: new Set(),
  drawerJobId: null,
  ingestStep: IngestStep.List,
  ingestResults: [],
  ingestProgress: 0,
  currentPage: 1,
  totalCount: 0,
  pageSize: 20,
};

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_JOBS"; payload: DisplayJob[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILTER"; payload: Partial<JobFilter> }
  | { type: "RESET_FILTERS" }
  | { type: "SELECT_JOB"; payload: string }
  | { type: "DESELECT_JOB"; payload: string }
  | { type: "SELECT_ALL"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "OPEN_DRAWER"; payload: string }
  | { type: "CLOSE_DRAWER" }
  | { type: "SET_INGEST_STEP"; payload: IngestStep }
  | { type: "SET_INGEST_RESULTS"; payload: IngestJobResult[] }
  | { type: "SET_INGEST_PROGRESS"; payload: number }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_TOTAL"; payload: number };

function reducer(state: JobsState, action: Action): JobsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_JOBS":
      return { ...state, jobs: action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload }, currentPage: 1 };
    case "RESET_FILTERS":
      return { ...state, filters: initialFilter, currentPage: 1 };
    case "SELECT_JOB": {
      const next = new Set(state.selectedIds);
      next.add(action.payload);
      return { ...state, selectedIds: next };
    }
    case "DESELECT_JOB": {
      const next = new Set(state.selectedIds);
      next.delete(action.payload);
      return { ...state, selectedIds: next };
    }
    case "SELECT_ALL":
      return { ...state, selectedIds: new Set(action.payload) };
    case "CLEAR_SELECTION":
      return { ...state, selectedIds: new Set() };
    case "OPEN_DRAWER":
      return { ...state, drawerJobId: action.payload };
    case "CLOSE_DRAWER":
      return { ...state, drawerJobId: null };
    case "SET_INGEST_STEP":
      return { ...state, ingestStep: action.payload };
    case "SET_INGEST_RESULTS":
      return { ...state, ingestResults: action.payload };
    case "SET_INGEST_PROGRESS":
      return { ...state, ingestProgress: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_TOTAL":
      return { ...state, totalCount: action.payload };
    default:
      return state;
  }
}

interface JobsContextValue {
  state: JobsState;
  dispatch: React.Dispatch<Action>;
  selectableJobs: Job[];
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectableJobs = state.jobs.filter(
    (j) => j.supportStatus !== SupportStatus.Unsupported
  );

  return (
    <JobsContext.Provider value={{ state, dispatch, selectableJobs }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobsContext(): JobsContextValue {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobsContext must be used inside JobsContextProvider");
  return ctx;
}

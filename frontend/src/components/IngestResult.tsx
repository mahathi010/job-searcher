import React from "react";
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, List } from "lucide-react";
import { IngestJobResult, IngestJobResultStatus } from "@/models/job_models";
import { StatusBadge } from "./StatusBadge";

interface IngestResultProps {
  results: IngestJobResult[];
  onRetryFailed: () => void;
  onReturnToList: () => void;
}

export const IngestResult: React.FC<IngestResultProps> = ({
  results,
  onRetryFailed,
  onReturnToList,
}) => {
  const succeeded = results.filter((r) => r.status === IngestJobResultStatus.Success);
  const failed = results.filter((r) => r.status === IngestJobResultStatus.Failed);

  const isFullSuccess = failed.length === 0;
  const isFullFailure = succeeded.length === 0;
  const isPartial = !isFullSuccess && !isFullFailure;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 text-center">
          {isFullSuccess && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">Ingest Complete</h2>
              <p className="text-sm text-gray-500 mt-1">
                All {results.length} job{results.length !== 1 ? "s were" : " was"} ingested
                successfully.
              </p>
            </>
          )}
          {isPartial && (
            <>
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">Partial Success</h2>
              <p className="text-sm text-gray-500 mt-1">
                {succeeded.length} succeeded, {failed.length} failed.
              </p>
            </>
          )}
          {isFullFailure && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">Ingest Failed</h2>
              <p className="text-sm text-gray-500 mt-1">
                All {results.length} job{results.length !== 1 ? "s" : ""} failed to ingest.
              </p>
            </>
          )}
        </div>

        {/* Results table */}
        <div className="flex-1 overflow-y-auto p-6">
          <ul className="space-y-2">
            {results.map((result) => (
              <li
                key={result.jobId}
                className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-800 truncate flex-1">
                  {result.jobTitle}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {result.message && (
                    <span className="text-xs text-gray-400 max-w-36 truncate">
                      {result.message}
                    </span>
                  )}
                  <StatusBadge variant={result.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onReturnToList}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <List className="w-4 h-4" />
            Return to list
          </button>
          {failed.length > 0 && (
            <button
              onClick={onRetryFailed}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RotateCcw className="w-4 h-4" />
              Retry failed ({failed.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngestResult;

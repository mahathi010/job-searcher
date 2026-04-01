import React, { useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

interface IngestProgressProps {
  jobIds: string[];
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = ["Validate", "Ingest", "Complete"] as const;

export const IngestProgress: React.FC<IngestProgressProps> = ({
  jobIds,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [jobProgress, setJobProgress] = React.useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Step 0: Validate
      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;
      setCurrentStep(1);

      // Step 1: Ingest — simulate per-job progress
      for (let i = 0; i <= jobIds.length; i++) {
        if (cancelled) return;
        setJobProgress(i);
        await new Promise((r) => setTimeout(r, 400));
      }

      if (cancelled) return;
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 500));
      if (!cancelled) onComplete();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [jobIds, onComplete]);

  const progressPct =
    jobIds.length > 0 ? Math.round((jobProgress / jobIds.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
          Ingesting Jobs
        </h2>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx < currentStep
                      ? "bg-green-500 text-white"
                      : idx === currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {idx < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : idx === currentStep ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs ${
                    idx <= currentStep ? "text-gray-700 font-medium" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    idx < currentStep ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        {currentStep === 1 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {jobProgress} / {jobIds.length} jobs processed
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mb-6">
          {currentStep === 0 && "Validating job schemas…"}
          {currentStep === 1 && `Processing ${jobIds.length} job${jobIds.length !== 1 ? "s" : ""}…`}
          {currentStep === 2 && "Finishing up…"}
        </p>

        <button
          onClick={onCancel}
          className="w-full py-2 border border-gray-200 text-sm text-gray-600 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default IngestProgress;

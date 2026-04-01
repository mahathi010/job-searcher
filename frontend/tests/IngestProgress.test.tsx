import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IngestProgress } from "@/components/IngestProgress";

const JOB_IDS = ["job-1", "job-2", "job-3"];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("IngestProgress", () => {
  it("renders all three step labels", () => {
    render(
      <IngestProgress jobIds={JOB_IDS} onComplete={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByText("Validate")).toBeInTheDocument();
    expect(screen.getByText("Ingest")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("shows the Cancel button", () => {
    render(
      <IngestProgress jobIds={JOB_IDS} onComplete={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <IngestProgress jobIds={JOB_IDS} onComplete={vi.fn()} onCancel={onCancel} />
    );

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows a loading spinner on the active step", () => {
    render(
      <IngestProgress jobIds={JOB_IDS} onComplete={vi.fn()} onCancel={vi.fn()} />
    );

    // Step 0 (Validate) is active initially; Loader2 renders as an svg inside the step circle
    const stepCircles = screen
      .getAllByText((_, el) => el?.tagName === "svg" || false);
    // Check that a spinner element exists (animate-spin class)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  it("shows progress bar after Validate step completes", async () => {
    render(
      <IngestProgress jobIds={JOB_IDS} onComplete={vi.fn()} onCancel={vi.fn()} />
    );

    // Advance past the Validate step (600ms)
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("calls onComplete after all steps finish", async () => {
    const onComplete = vi.fn();
    render(
      <IngestProgress jobIds={JOB_IDS} onComplete={onComplete} onCancel={vi.fn()} />
    );

    // Validate (600ms) + Ingest (4 ticks × 400ms = 1600ms) + Complete (500ms)
    await act(async () => {
      vi.advanceTimersByTime(600 + (JOB_IDS.length + 1) * 400 + 500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { JobCard } from "@/components/JobCard";
import { Job, JobType, SupportStatus } from "@/models/job_models";

const baseJob: Job = {
  id: "test-001",
  title: "Software Engineer",
  company: "TestCo",
  companyInitials: "TC",
  companyColor: "bg-blue-500",
  location: "Remote",
  jobType: JobType.Remote,
  salary: "$120,000",
  source: "LinkedIn",
  summary: "Build great software for our customers around the world.",
  skills: ["TypeScript", "React", "Node.js"],
  supportStatus: SupportStatus.Supported,
  supportReasons: ["Valid schema"],
  warnings: [],
  eligibilityCriteria: ["3+ years experience"],
  postedAt: "2026-03-01",
  missingFields: [],
};

const unsupportedJob: Job = {
  ...baseJob,
  id: "test-002",
  title: "Marketing Manager",
  supportStatus: SupportStatus.Unsupported,
  missingFields: ["salary", "eligibilityCriteria"],
};

const warningJob: Job = {
  ...baseJob,
  id: "test-003",
  title: "Data Analyst",
  supportStatus: SupportStatus.Warning,
  warnings: ["Salary range is approximate"],
};

describe("JobCard", () => {
  it("renders job title, company, and location", () => {
    render(
      <JobCard
        job={baseJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("TestCo")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("renders Supported status badge", () => {
    render(
      <JobCard
        job={baseJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByText("Supported")).toBeInTheDocument();
  });

  it("renders skills as chips", () => {
    render(
      <JobCard
        job={baseJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("calls onToggleSelect when checkbox is clicked", () => {
    const onToggle = vi.fn();
    render(
      <JobCard
        job={baseJob}
        isSelected={false}
        onToggleSelect={onToggle}
        onViewDetails={vi.fn()}
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: /select software engineer/i });
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("test-001");
  });

  it("shows checkbox as checked when isSelected is true", () => {
    render(
      <JobCard
        job={baseJob}
        isSelected={true}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("disables checkbox for unsupported jobs", () => {
    render(
      <JobCard
        job={unsupportedJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("shows cannot be ingested message for unsupported jobs", () => {
    render(
      <JobCard
        job={unsupportedJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    expect(
      screen.getByText(/cannot be ingested/i)
    ).toBeInTheDocument();
  });

  it("shows warning message for warning-status jobs", () => {
    render(
      <JobCard
        job={warningJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByText(/salary range is approximate/i)).toBeInTheDocument();
  });

  it("calls onViewDetails when Details button is clicked", () => {
    const onView = vi.fn();
    render(
      <JobCard
        job={baseJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={onView}
      />
    );
    fireEvent.click(screen.getByText("Details"));
    expect(onView).toHaveBeenCalledWith("test-001");
  });

  it("has aria-label on the article for accessibility", () => {
    render(
      <JobCard
        job={baseJob}
        isSelected={false}
        onToggleSelect={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );
    expect(
      screen.getByRole("article", { name: /software engineer at testco/i })
    ).toBeInTheDocument();
  });
});

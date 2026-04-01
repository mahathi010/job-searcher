import {
  Job,
  JobFilter,
  JobType,
  SupportStatus,
  IngestJobResult,
  IngestJobResultStatus,
} from "@/models/job_models";

const MOCK_JOBS: Job[] = [
  {
    id: "job-001",
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    companyInitials: "TC",
    companyColor: "bg-blue-500",
    location: "San Francisco, CA",
    jobType: JobType.FullTime,
    salary: "$140,000 – $180,000",
    source: "LinkedIn",
    sourceUrl: "https://linkedin.com/jobs/1",
    summary:
      "Build and maintain scalable backend systems for our flagship product. Work with a team of engineers on distributed systems, performance optimization, and technical architecture decisions.",
    skills: ["Python", "Go", "Kubernetes", "PostgreSQL", "gRPC"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Valid schema", "All required fields present", "Active posting"],
    warnings: [],
    eligibilityCriteria: ["5+ years experience", "BS in Computer Science or equivalent"],
    postedAt: "2026-03-28",
    expiresAt: "2026-04-28",
    missingFields: [],
  },
  {
    id: "job-002",
    title: "Product Designer",
    company: "DesignStudio",
    companyInitials: "DS",
    companyColor: "bg-purple-500",
    location: "New York, NY",
    jobType: JobType.FullTime,
    salary: "$110,000 – $140,000",
    source: "Indeed",
    summary:
      "Lead end-to-end product design for consumer-facing features. Partner with PMs and engineers to define user experience across web and mobile platforms.",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Complete metadata", "Valid employment type"],
    warnings: [],
    eligibilityCriteria: ["Portfolio required", "3+ years product design"],
    postedAt: "2026-03-30",
    missingFields: [],
  },
  {
    id: "job-003",
    title: "Data Analyst",
    company: "Analytics Co",
    companyInitials: "AC",
    companyColor: "bg-green-500",
    location: "Austin, TX",
    jobType: JobType.FullTime,
    salary: "$85,000 – $105,000",
    source: "Glassdoor",
    summary:
      "Analyze large datasets to surface business insights. Develop dashboards, write SQL queries, and collaborate with cross-functional teams on data-driven decisions.",
    skills: ["SQL", "Python", "Tableau", "dbt", "BigQuery"],
    supportStatus: SupportStatus.Warning,
    supportReasons: ["Schema partially matches"],
    warnings: ["Salary range is approximate", "Location may be hybrid"],
    eligibilityCriteria: ["2+ years analytics experience"],
    postedAt: "2026-03-25",
    missingFields: ["expiresAt"],
  },
  {
    id: "job-004",
    title: "DevOps Engineer",
    company: "CloudSystems",
    companyInitials: "CS",
    companyColor: "bg-orange-500",
    location: "Remote",
    jobType: JobType.Remote,
    salary: "$120,000 – $155,000",
    source: "LinkedIn",
    summary:
      "Own our CI/CD pipelines, infrastructure-as-code, and cloud operations. Work closely with engineering to maintain 99.9% uptime across production systems.",
    skills: ["AWS", "Terraform", "Docker", "GitHub Actions", "Python"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["All fields valid", "Remote-eligible"],
    warnings: [],
    eligibilityCriteria: ["4+ years DevOps", "AWS certification preferred"],
    postedAt: "2026-03-29",
    expiresAt: "2026-04-29",
    missingFields: [],
  },
  {
    id: "job-005",
    title: "Marketing Manager",
    company: "GrowthBrand",
    companyInitials: "GB",
    companyColor: "bg-pink-500",
    location: "Chicago, IL",
    jobType: JobType.FullTime,
    salary: "$90,000 – $115,000",
    source: "Indeed",
    summary:
      "Drive demand generation and brand awareness campaigns. Manage a team of 4 marketers across paid, organic, and lifecycle channels.",
    skills: ["HubSpot", "Google Ads", "SEO", "Content Strategy", "Analytics"],
    supportStatus: SupportStatus.Unsupported,
    supportReasons: [],
    warnings: [],
    eligibilityCriteria: [],
    postedAt: "2026-03-20",
    missingFields: ["salary", "eligibilityCriteria", "skills"],
  },
  {
    id: "job-006",
    title: "Frontend Engineer",
    company: "WebApps Ltd",
    companyInitials: "WA",
    companyColor: "bg-cyan-500",
    location: "Seattle, WA",
    jobType: JobType.FullTime,
    salary: "$125,000 – $160,000",
    source: "LinkedIn",
    summary:
      "Build responsive, performant React applications. Collaborate with designers and backend engineers to ship user-facing features at scale.",
    skills: ["React", "TypeScript", "GraphQL", "Vite", "Testing Library"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Valid schema", "Active listing"],
    warnings: [],
    eligibilityCriteria: ["3+ years React experience"],
    postedAt: "2026-03-31",
    expiresAt: "2026-04-30",
    missingFields: [],
  },
  {
    id: "job-007",
    title: "Machine Learning Engineer",
    company: "AI Ventures",
    companyInitials: "AV",
    companyColor: "bg-indigo-500",
    location: "Boston, MA",
    jobType: JobType.FullTime,
    salary: "$150,000 – $200,000",
    source: "AngelList",
    summary:
      "Train and deploy production ML models for recommendation and search. Work with data scientists to move experiments into scalable, monitored services.",
    skills: ["Python", "PyTorch", "MLflow", "Kubernetes", "Feature Stores"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Complete schema", "Verified company"],
    warnings: [],
    eligibilityCriteria: ["MS/PhD preferred", "3+ years ML production experience"],
    postedAt: "2026-03-27",
    expiresAt: "2026-04-27",
    missingFields: [],
  },
  {
    id: "job-008",
    title: "Customer Success Manager",
    company: "SaaS Co",
    companyInitials: "SC",
    companyColor: "bg-teal-500",
    location: "Denver, CO",
    jobType: JobType.FullTime,
    salary: "$75,000 – $95,000",
    source: "Glassdoor",
    summary:
      "Own a portfolio of enterprise accounts. Drive product adoption, renewals, and expansion. Work cross-functionally with Sales, Product, and Support.",
    skills: ["Salesforce", "Gainsight", "Customer Success", "SaaS"],
    supportStatus: SupportStatus.Warning,
    supportReasons: ["Partial schema match"],
    warnings: ["Compensation not confirmed", "Travel requirement unclear"],
    eligibilityCriteria: ["2+ years SaaS CSM experience"],
    postedAt: "2026-03-22",
    missingFields: ["expiresAt", "sourceUrl"],
  },
  {
    id: "job-009",
    title: "Backend Engineer (Node.js)",
    company: "StartupXYZ",
    companyInitials: "SX",
    companyColor: "bg-yellow-600",
    location: "Remote",
    jobType: JobType.Remote,
    salary: "$115,000 – $145,000",
    source: "LinkedIn",
    summary:
      "Design and build APIs and microservices powering a high-growth SaaS platform. Own services end-to-end from design to deployment.",
    skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "REST APIs"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["All required fields present", "Remote-eligible"],
    warnings: [],
    eligibilityCriteria: ["3+ years backend development"],
    postedAt: "2026-04-01",
    expiresAt: "2026-05-01",
    missingFields: [],
  },
  {
    id: "job-010",
    title: "UX Researcher",
    company: "InsightLabs",
    companyInitials: "IL",
    companyColor: "bg-rose-500",
    location: "San Jose, CA",
    jobType: JobType.Contract,
    salary: "$65/hr – $85/hr",
    source: "Indeed",
    summary:
      "Plan and conduct usability studies, interviews, and surveys. Synthesize findings into actionable product recommendations for design and PM teams.",
    skills: ["UserTesting", "Dovetail", "Survey Design", "Affinity Mapping"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Valid contract role", "Clear deliverables"],
    warnings: [],
    eligibilityCriteria: ["Portfolio required"],
    postedAt: "2026-03-26",
    missingFields: [],
  },
  {
    id: "job-011",
    title: "Sales Development Representative",
    company: "GrowthForce",
    companyInitials: "GF",
    companyColor: "bg-lime-500",
    location: "Atlanta, GA",
    jobType: JobType.FullTime,
    source: "Indeed",
    summary:
      "Generate qualified pipeline through outbound prospecting. Own the top-of-funnel for a designated territory and hit weekly activity targets.",
    skills: ["Outreach", "Salesforce", "Cold Calling", "LinkedIn Sales Navigator"],
    supportStatus: SupportStatus.Unsupported,
    supportReasons: [],
    warnings: [],
    eligibilityCriteria: [],
    postedAt: "2026-03-18",
    missingFields: ["salary", "eligibilityCriteria"],
  },
  {
    id: "job-012",
    title: "Security Engineer",
    company: "SecureNet",
    companyInitials: "SN",
    companyColor: "bg-gray-600",
    location: "Washington, DC",
    jobType: JobType.FullTime,
    salary: "$130,000 – $170,000",
    source: "LinkedIn",
    summary:
      "Protect infrastructure and data through penetration testing, threat modeling, and security architecture reviews. Drive the security roadmap across cloud and on-prem systems.",
    skills: ["Penetration Testing", "SIEM", "AWS Security", "Zero Trust", "Python"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Verified employer", "Full schema"],
    warnings: [],
    eligibilityCriteria: ["CISSP or equivalent preferred", "5+ years security"],
    postedAt: "2026-03-29",
    expiresAt: "2026-04-29",
    missingFields: [],
  },
  {
    id: "job-013",
    title: "Product Manager",
    company: "InnovateTech",
    companyInitials: "IT",
    companyColor: "bg-violet-500",
    location: "Los Angeles, CA",
    jobType: JobType.FullTime,
    salary: "$130,000 – $160,000",
    source: "AngelList",
    summary:
      "Own the roadmap for our core product. Define requirements, prioritize features, and work with engineering and design to ship impactful products on time.",
    skills: ["Product Strategy", "Jira", "SQL", "User Research", "OKRs"],
    supportStatus: SupportStatus.Warning,
    supportReasons: ["Schema partially matched"],
    warnings: ["Duplicate listing detected", "Posting date older than 30 days"],
    eligibilityCriteria: ["4+ years product management", "Technical background preferred"],
    postedAt: "2026-03-01",
    missingFields: ["expiresAt"],
  },
  {
    id: "job-014",
    title: "Mobile Engineer (iOS)",
    company: "AppFactory",
    companyInitials: "AF",
    companyColor: "bg-sky-500",
    location: "Portland, OR",
    jobType: JobType.FullTime,
    salary: "$120,000 – $150,000",
    source: "LinkedIn",
    summary:
      "Build and ship native iOS features for an app with 2M+ users. Work closely with product and design to deliver smooth, delightful experiences.",
    skills: ["Swift", "SwiftUI", "Xcode", "Core Data", "REST APIs"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Valid schema", "Active listing"],
    warnings: [],
    eligibilityCriteria: ["3+ years iOS development"],
    postedAt: "2026-03-30",
    expiresAt: "2026-04-30",
    missingFields: [],
  },
  {
    id: "job-015",
    title: "Technical Writer",
    company: "DocuCorp",
    companyInitials: "DC",
    companyColor: "bg-amber-500",
    location: "Remote",
    jobType: JobType.Remote,
    salary: "$80,000 – $100,000",
    source: "Glassdoor",
    summary:
      "Write clear, concise API docs, guides, and tutorials for a developer-focused platform. Partner with engineers to keep documentation accurate and up-to-date.",
    skills: ["Technical Writing", "Markdown", "OpenAPI", "Git", "Developer Experience"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Complete metadata", "Remote-eligible"],
    warnings: [],
    eligibilityCriteria: ["Portfolio of technical writing samples required"],
    postedAt: "2026-03-28",
    missingFields: [],
  },
  {
    id: "job-016",
    title: "Finance Analyst",
    company: "CapitalGroup",
    companyInitials: "CG",
    companyColor: "bg-emerald-600",
    location: "New York, NY",
    jobType: JobType.FullTime,
    salary: "$95,000 – $120,000",
    source: "Indeed",
    summary:
      "Support FP&A with financial modeling, variance analysis, and board reporting. Partner with business units to develop accurate forecasts and budgets.",
    skills: ["Excel", "Financial Modeling", "SQL", "Tableau", "PowerPoint"],
    supportStatus: SupportStatus.Warning,
    supportReasons: ["Schema valid but incomplete"],
    warnings: ["Salary listed as range, not confirmed"],
    eligibilityCriteria: ["CFA preferred", "2+ years FP&A"],
    postedAt: "2026-03-24",
    missingFields: ["sourceUrl"],
  },
  {
    id: "job-017",
    title: "HR Business Partner",
    company: "PeopleFirst",
    companyInitials: "PF",
    companyColor: "bg-fuchsia-500",
    location: "Minneapolis, MN",
    jobType: JobType.FullTime,
    source: "LinkedIn",
    summary:
      "Act as a strategic partner to business leaders on talent, culture, and organizational effectiveness. Drive hiring, performance, and retention programs.",
    skills: ["HRBP", "Workday", "Employee Relations", "Talent Acquisition"],
    supportStatus: SupportStatus.Unsupported,
    supportReasons: [],
    warnings: [],
    eligibilityCriteria: [],
    postedAt: "2026-03-15",
    missingFields: ["salary", "eligibilityCriteria", "expiresAt"],
  },
  {
    id: "job-018",
    title: "Embedded Systems Engineer",
    company: "HardwareTech",
    companyInitials: "HT",
    companyColor: "bg-stone-600",
    location: "San Diego, CA",
    jobType: JobType.FullTime,
    salary: "$135,000 – $165,000",
    source: "AngelList",
    summary:
      "Design firmware and low-level software for IoT devices. Write C/C++ code targeting ARM Cortex microcontrollers and work closely with hardware engineers.",
    skills: ["C", "C++", "RTOS", "ARM Cortex", "Embedded Linux"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Full schema valid", "Active company"],
    warnings: [],
    eligibilityCriteria: ["5+ years embedded systems", "Hardware debugging experience"],
    postedAt: "2026-03-27",
    expiresAt: "2026-04-27",
    missingFields: [],
  },
  {
    id: "job-019",
    title: "QA Engineer",
    company: "QualityFirst",
    companyInitials: "QF",
    companyColor: "bg-red-600",
    location: "Remote",
    jobType: JobType.Remote,
    salary: "$90,000 – $115,000",
    source: "LinkedIn",
    summary:
      "Develop and maintain automated test suites for web and API surfaces. Drive quality across the engineering org through process improvements and test strategy.",
    skills: ["Playwright", "Cypress", "Jest", "Python", "CI/CD"],
    supportStatus: SupportStatus.Supported,
    supportReasons: ["Valid schema", "Verified remote role"],
    warnings: [],
    eligibilityCriteria: ["3+ years QA automation"],
    postedAt: "2026-03-31",
    expiresAt: "2026-04-30",
    missingFields: [],
  },
  {
    id: "job-020",
    title: "Blockchain Developer",
    company: "ChainWorks",
    companyInitials: "CW",
    companyColor: "bg-zinc-600",
    location: "Miami, FL",
    jobType: JobType.Contract,
    salary: "$100/hr – $140/hr",
    source: "AngelList",
    summary:
      "Build and audit smart contracts on Ethereum and Solana. Develop DeFi protocol integrations and contribute to open-source tooling.",
    skills: ["Solidity", "Rust", "Hardhat", "Web3.js", "Smart Contracts"],
    supportStatus: SupportStatus.Warning,
    supportReasons: ["Contract role partially supported"],
    warnings: ["Compensation in hourly rate — conversion uncertain", "Crypto compensation component"],
    eligibilityCriteria: ["Smart contract audit experience preferred"],
    postedAt: "2026-03-23",
    missingFields: ["expiresAt"],
  },
];

export async function fetchJobs(filter?: Partial<JobFilter>): Promise<Job[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let results = [...MOCK_JOBS];

  if (filter?.query) {
    const q = filter.query.toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (filter?.status && filter.status !== "all") {
    results = results.filter((j) => j.supportStatus === filter.status);
  }

  if (filter?.jobType && filter.jobType !== "all") {
    results = results.filter((j) => j.jobType === filter.jobType);
  }

  if (filter?.sort === "title") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filter?.sort === "company") {
    results.sort((a, b) => a.company.localeCompare(b.company));
  } else {
    results.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }

  return results;
}

export async function fetchJobById(id: string): Promise<Job | null> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return MOCK_JOBS.find((j) => j.id === id) ?? null;
}

export async function simulateIngest(jobIds: string[]): Promise<IngestJobResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return jobIds.map((id) => {
    const job = MOCK_JOBS.find((j) => j.id === id);
    if (!job) {
      return { jobId: id, jobTitle: "Unknown", status: IngestJobResultStatus.Failed, message: "Job not found" };
    }
    if (job.supportStatus === SupportStatus.Unsupported) {
      return { jobId: id, jobTitle: job.title, status: IngestJobResultStatus.Failed, message: "Job is unsupported" };
    }
    if (job.supportStatus === SupportStatus.Warning && Math.random() < 0.3) {
      return { jobId: id, jobTitle: job.title, status: IngestJobResultStatus.Failed, message: "Validation failed due to warnings" };
    }
    return { jobId: id, jobTitle: job.title, status: IngestJobResultStatus.Success };
  });
}

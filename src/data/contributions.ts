export interface MergedPullRequest {
  number: number;
  title: string;
  description: string;
  mergedAt: string;
}

export interface ContributionProject {
  repository: string;
  name: string;
  pullRequests: MergedPullRequest[];
}

// Verified against GitHub PR details. Only include merged PRs authored by Jarvis636431.
export const contributionsVerifiedAt = "2026-10-13";
export const contributionSearchUrl =
  "https://github.com/search?q=author%3AJarvis636431+is%3Apr+is%3Amerged+-user%3AJarvis636431&type=pullrequests";

const projects: ContributionProject[] = [
  {
    repository: "Tencent/WeKnora",
    name: "WeKnora",
    pullRequests: [
      {
        number: 4224,
        title: "Preserve nonempty Markdown lists when pressing Enter",
        description:
          "Checked the text on both sides of the caret before exiting a list, preventing Enter from removing nonempty list markers.",
        mergedAt: "2026-10-13T08:40:25Z",
      },
      {
        number: 4226,
        title: "Preserve inline images in EPUB previews",
        description:
          "Preserved inline HTML and SVG image sources alongside archive images, with regression coverage for image resolution and sanitization.",
        mergedAt: "2026-10-13T08:39:37Z",
      },
      {
        number: 4180,
        title: "Configure Helm app rollouts and document shared storage",
        description:
          "Added configurable app update strategies and documented single-replica and shared-storage deployment options, with Helm template regression tests.",
        mergedAt: "2026-10-12T10:10:30Z",
      },
      {
        number: 4195,
        title: "Respect Markdown indentation selection boundaries",
        description:
          "Treated selection ends at line starts as exclusive, preventing Tab and Shift+Tab from changing the next unselected line.",
        mergedAt: "2026-10-12T10:08:10Z",
      },
      {
        number: 4177,
        title: "Explain knowledge upload folder paths",
        description:
          "Documented path-qualified upload names, folder listing responses, and document re-filing to clarify how knowledge-base folders work.",
        mergedAt: "2026-10-12T06:30:07Z",
      },
      {
        number: 4171,
        title: "Clarify frontend development proxy configuration",
        description:
          "Documented proxy environment variable precedence and development and preview workflows for connecting the frontend to a remote backend.",
        mergedAt: "2026-10-12T05:03:02Z",
      },
    ],
  },
  {
    repository: "oldj/SwitchHosts",
    name: "SwitchHosts",
    pullRequests: [
      {
        number: 1051,
        title: "Show the macOS tray panel over full-screen apps",
        description:
          "Used a non-activating native panel to display the tray window above full-screen apps, and corrected mouse event handling to prevent accidental dismissal on pointer movement.",
        mergedAt: "2026-09-30T13:01:09Z",
      },
    ],
  },
  {
    repository: "NervJS/taro",
    name: "Taro",
    pullRequests: [
      {
        number: 19459,
        title: "Fix template aliases after removing event listeners",
        description:
          "Aligned template selection with node initialization to prevent mini-program runtime crashes when Text and Image nodes lose their last event listener.",
        mergedAt: "2026-07-21T02:19:38Z",
      },
      {
        number: 19273,
        title: "Support project initialization in the current directory",
        description:
          "Added support for taro init ., deriving the project name from the current directory, with tests for path resolution and initialization.",
        mergedAt: "2026-07-17T10:31:45Z",
      },
    ],
  },
];

export const contributionProjects = projects
  .map((project) => ({
    ...project,
    pullRequests: project.pullRequests
      .slice()
      .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt)),
  }))
  .sort((a, b) =>
    b.pullRequests[0].mergedAt.localeCompare(a.pullRequests[0].mergedAt),
  );

export const mergedPullRequestCount = contributionProjects.reduce(
  (total, project) => total + project.pullRequests.length,
  0,
);

export function formatMergeDate(mergedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(mergedAt));
}

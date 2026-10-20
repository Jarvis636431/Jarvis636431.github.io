import { siteConfig } from "@config/site.mjs";
import snapshot from "@data/contributions.generated.json";

export interface MergedPullRequest {
  repository: string;
  number: number;
  title: string;
  url: string;
  body: string;
  labels: string[];
  createdAt: string;
  mergedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  comments: number;
  reviewComments: number;
  mergedBy: string | null;
}

export const contributionSearchUrl = `https://github.com/search?${new URLSearchParams(
  {
    q: `author:${siteConfig.github.username} is:pr is:merged is:public -user:${siteConfig.github.username}`,
    type: "pullrequests",
  },
)}`;

export const mergedPullRequests: MergedPullRequest[] = snapshot.pullRequests
  .slice()
  .sort(
    (a, b) =>
      b.mergedAt.localeCompare(a.mergedAt) ||
      a.repository.localeCompare(b.repository) ||
      b.number - a.number,
  );

export const contributionProjects = [
  ...new Set(mergedPullRequests.map((pr) => pr.repository)),
]
  .map((repository) => ({
    repository,
    url: `https://github.com/${repository}`,
    count: mergedPullRequests.filter((pr) => pr.repository === repository)
      .length,
  }))
  .sort(
    (a, b) => b.count - a.count || a.repository.localeCompare(b.repository),
  );

export const mergedPullRequestCount = mergedPullRequests.length;
export function formatMergeDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

import { siteConfig } from "@config/site.mjs";
import { integrationConfig } from "@config/integrations.mjs";
import { selectContributions } from "./select.ts";
import snapshot from "@data/contributions.generated.json";

export const contributionSearchUrl =
  siteConfig.github.username && integrationConfig.contributions.enabled
    ? `https://github.com/search?${new URLSearchParams({
        q: `author:${siteConfig.github.username} is:pr is:merged is:public -user:${siteConfig.github.username}`,
        type: "pullrequests",
      })}`
    : undefined;

export const mergedPullRequests = selectContributions(snapshot, {
  enabled: integrationConfig.contributions.enabled,
  username: siteConfig.github.username,
});

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
    timeZone: siteConfig.timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

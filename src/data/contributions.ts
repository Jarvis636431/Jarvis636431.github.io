import snapshot from "./contributions.generated.json";

export interface MergedPullRequest {
  number: number;
  title: string;
  mergedAt: string;
}

export interface ContributionProject {
  repository: string;
  name: string;
  pullRequests: MergedPullRequest[];
}

export const contributionsVerifiedAt = snapshot.syncedAt;
export const contributionSearchUrl =
  "https://github.com/search?q=author%3AJarvis636431+is%3Apr+is%3Amerged+-user%3AJarvis636431&type=pullrequests";

const projects = new Map<string, ContributionProject>();
for (const pullRequest of snapshot.pullRequests) {
  const { repository, ...metadata } = pullRequest;
  let project = projects.get(repository);
  if (!project) {
    project = {
      repository,
      name: repository.split("/")[1],
      pullRequests: [],
    };
    projects.set(repository, project);
  }
  project.pullRequests.push(metadata);
}

export const contributionProjects = [...projects.values()]
  .map((project) => ({
    ...project,
    pullRequests: project.pullRequests.sort((a, b) =>
      b.mergedAt.localeCompare(a.mergedAt),
    ),
  }))
  .sort((a, b) =>
    b.pullRequests[0].mergedAt.localeCompare(a.pullRequests[0].mergedAt),
  );

export const mergedPullRequestCount = snapshot.pullRequests.length;

export function formatMergeDate(mergedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(mergedAt));
}

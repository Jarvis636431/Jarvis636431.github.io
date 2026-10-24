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

/** Snapshots belong to an account; changing the profile never reuses another account's PRs. */
export function selectContributions(
  snapshot: { author: string; pullRequests: MergedPullRequest[] },
  { enabled, username }: { enabled: boolean; username: string },
) {
  if (
    !enabled ||
    !username ||
    snapshot.author.toLowerCase() !== username.toLowerCase()
  )
    return [];
  return snapshot.pullRequests
    .slice()
    .sort(
      (a, b) =>
        b.mergedAt.localeCompare(a.mergedAt) ||
        a.repository.localeCompare(b.repository) ||
        b.number - a.number,
    );
}

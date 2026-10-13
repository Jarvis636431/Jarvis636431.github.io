import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { format } from "prettier";

const author = "Jarvis636431";
const snapshotPath = fileURLToPath(
  new URL("../src/data/contributions.generated.json", import.meta.url),
);
const query = `author:${author} is:pr is:merged is:public -user:${author}`;

export async function fetchContributions(request) {
  const records = new Map();
  let page = 1;
  let total;
  do {
    const params = new URLSearchParams({
      q: query,
      per_page: "100",
      page: String(page),
      sort: "updated",
      order: "desc",
    });
    const result = await request(`/search/issues?${params}`);
    if (
      result.incomplete_results !== false ||
      !Array.isArray(result.items) ||
      !Number.isInteger(result.total_count) ||
      result.total_count > 1000
    ) {
      throw new Error(
        "Incomplete GitHub search; keeping the existing snapshot.",
      );
    }
    total = result.total_count;
    if (result.items.length === 0 && (page - 1) * 100 < total) {
      throw new Error("Missing GitHub search page.");
    }
    for (const item of result.items) {
      const match = item.pull_request?.url?.match(
        /^https:\/\/api\.github\.com\/repos\/([\w.-]+\/[\w.-]+)\/pulls\/(\d+)$/,
      );
      if (!match) throw new Error("Invalid pull request search result.");
      const [, repository, number] = match;
      const pr = await request(`/repos/${repository}/pulls/${number}`);
      if (
        pr.user?.login?.toLowerCase() !== author.toLowerCase() ||
        pr.merged !== true ||
        pr.base?.repo?.private !== false ||
        pr.base.repo.full_name.toLowerCase() !== repository.toLowerCase() ||
        repository.split("/")[0].toLowerCase() === author.toLowerCase() ||
        pr.number !== Number(number) ||
        typeof pr.title !== "string" ||
        !pr.title.trim() ||
        typeof pr.merged_at !== "string" ||
        !Number.isFinite(Date.parse(pr.merged_at))
      ) {
        throw new Error(`Unverified merged PR: ${repository}#${number}`);
      }
      records.set(`${repository}#${number}`, {
        repository,
        number: pr.number,
        title: pr.title,
        mergedAt: pr.merged_at,
      });
    }
    page++;
  } while ((page - 1) * 100 < total);
  if (records.size !== total) {
    throw new Error(
      "GitHub search count mismatch; keeping the existing snapshot.",
    );
  }
  return [...records.values()];
}

export function mergeSnapshot(previous, incoming, now = new Date()) {
  // Retain known contributions if GitHub's search index temporarily omits them.
  const records = new Map(
    previous.pullRequests.map((pr) => [`${pr.repository}#${pr.number}`, pr]),
  );
  for (const pr of incoming) records.set(`${pr.repository}#${pr.number}`, pr);
  const sort = (a, b) =>
    b.mergedAt.localeCompare(a.mergedAt) ||
    a.repository.localeCompare(b.repository) ||
    b.number - a.number;
  const pullRequests = [...records.values()].sort(sort);
  const changed =
    JSON.stringify(pullRequests) !==
    JSON.stringify(previous.pullRequests.slice().sort(sort));
  return {
    changed,
    snapshot: {
      syncedAt: changed
        ? new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Shanghai",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(now)
        : previous.syncedAt,
      pullRequests,
    },
  };
}

async function sync() {
  const previous = JSON.parse(await readFile(snapshotPath, "utf8"));
  const token = process.env.GH_TOKEN;
  const request = async (path) => {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`GitHub API returned HTTP ${response.status}.`);
    }
    return response.json();
  };
  // Finish every API request before changing any local data.
  const incoming = await fetchContributions(request);
  const { changed, snapshot } = mergeSnapshot(previous, incoming);
  if (changed) {
    await writeFile(
      snapshotPath,
      await format(JSON.stringify(snapshot), { parser: "json" }),
    );
  }
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, {
      flag: "a",
    });
  }
  console.log(
    changed
      ? `Synced ${snapshot.pullRequests.length} merged PRs.`
      : "No contribution changes.",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  sync().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

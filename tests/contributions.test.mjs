import assert from "node:assert/strict";
import test from "node:test";
import { selectContributions } from "../src/lib/contributions.ts";
import {
  fetchContributions,
  mergeSnapshot,
} from "../scripts/sync-contributions.mjs";

const pr = (number, mergedAt = "2026-10-20T00:00:00Z") => ({
  repository: "project/repo",
  number,
  title: `Fix ${number}`,
  url: `https://github.com/project/repo/pull/${number}`,
  body: "Description",
  labels: [],
  createdAt: "2026-10-19T00:00:00Z",
  mergedAt,
  additions: 1,
  deletions: 0,
  changedFiles: 1,
  commits: 1,
  comments: 0,
  reviewComments: 0,
  mergedBy: null,
});

test("account changes and disabled contributions never display another account's snapshot", () => {
  const snapshot = { author: "Alice", pullRequests: [pr(1)] };
  for (const settings of [
    { enabled: false, username: "Alice" },
    { enabled: true, username: "Bob" },
    { enabled: true, username: "" },
  ]) {
    assert.deepEqual(selectContributions(snapshot, settings), []);
  }
  assert.deepEqual(
    selectContributions(snapshot, { enabled: true, username: "alice" }),
    snapshot.pullRequests,
  );
});

test("contributions sort newest first without changing the stored snapshot", () => {
  const snapshot = {
    author: "Alice",
    pullRequests: [pr(1), pr(2, "2026-10-21T00:00:00Z")],
  };
  assert.deepEqual(
    selectContributions(snapshot, { enabled: true, username: "Alice" }).map(
      (p) => p.number,
    ),
    [2, 1],
  );
  assert.equal(snapshot.pullRequests[0].number, 1);
});

test("sync retains missing records only for the same account and detects unchanged data", () => {
  const previous = { author: "Alice", pullRequests: [pr(1)] };
  assert.equal(mergeSnapshot(previous, [pr(1)], "Alice").changed, false);
  assert.deepEqual(mergeSnapshot(previous, [], "Alice").snapshot, previous);
  const next = mergeSnapshot(previous, [pr(2)], "Bob");
  assert.equal(next.changed, true);
  assert.equal(next.snapshot.author, "Bob");
  assert.deepEqual(
    next.snapshot.pullRequests.map((p) => p.number),
    [2],
  );
  assert.deepEqual(
    previous.pullRequests.map((p) => p.number),
    [1],
  );
});

test("empty accounts and incomplete GitHub results fail before returning a new snapshot", async () => {
  let calls = 0;
  const request = async () => {
    calls++;
    return { incomplete_results: true, items: [], total_count: 0 };
  };
  await assert.rejects(fetchContributions(request, ""), /username/);
  assert.equal(calls, 0);
  await assert.rejects(fetchContributions(request, "Alice"), /Incomplete/);
});

test("sync verifies PR ownership and metadata before accepting GitHub search results", async () => {
  const record = {
    user: { login: "Alice" },
    merged: true,
    base: { repo: { private: false, full_name: "project/repo" } },
    number: 1,
    title: "Fix",
    merged_at: "2026-10-20T00:00:00Z",
    created_at: "2026-10-19T00:00:00Z",
    html_url: pr(1).url,
    body: null,
    labels: [],
    additions: 1,
    deletions: 0,
    changed_files: 1,
    commits: 1,
    comments: 0,
    review_comments: 0,
    merged_by: null,
  };
  const request = async (path) =>
    path.startsWith("/search/")
      ? {
          incomplete_results: false,
          total_count: 1,
          items: [
            {
              pull_request: {
                url: "https://api.github.com/repos/project/repo/pulls/1",
              },
            },
          ],
        }
      : record;
  const result = await fetchContributions(request, "Alice");
  assert.equal(result.length, 1);
  assert.equal(result[0].body, "");
  record.user.login = "SomeoneElse";
  await assert.rejects(fetchContributions(request, "Alice"), /Unverified/);
});

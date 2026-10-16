import { getCollection } from "astro:content";
import {
  contributionProjects,
  mergedPullRequests,
  mergedPullRequestCount,
} from "../data/contributions";

/** Build resume sections from the same public sources used by the site.
 * Personal and employment details remain explicitly maintained in data/resume.ts.
 * No network access or generated prose is required during a build.
 */
export async function getResumeContent() {
  const entries = await getCollection(
    "projects",
    ({ data }) => data.featured && data.status !== "archived",
  );
  const projects = entries
    .sort(
      (a, b) =>
        b.data.publishDate.getTime() - a.data.publishDate.getTime() ||
        a.slug.localeCompare(b.slug),
    )
    .map(({ data, slug }) => ({
      name: data.titleEn ?? data.title,
      description: data.summaryEn ?? data.summary,
      href: `/projects/${slug}`,
      stack: data.stack,
    }));

  const openSource = contributionProjects.map((project) => ({
    name: project.repository.split("/")[1],
    repository: project.repository,
    href: project.url,
    count: project.count,
    // Preserve the original PR title and link rather than inferring achievements.
    latest: mergedPullRequests.find(
      (pr) => pr.repository === project.repository,
    )!,
  }));

  return { projects, openSource, mergedPullRequestCount };
}

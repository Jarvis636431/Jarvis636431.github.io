import { getFeaturedProjects } from "./content";
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
  const entries = await getFeaturedProjects();
  const projects = entries.map(({ data, slug }) => ({
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

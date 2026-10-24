/** Optional capabilities. Keep personal service settings here, credentials in .env. */
export const integrationConfig = {
  comments: {
    enabled: true,
    repository: "Jarvis636431/Jarvis636431.github.io",
    category: "Announcements",
    theme: "light",
    language: "zh-CN",
  },
  viewCounter: { enabled: true },
  contributions: {
    enabled: true,
    heatmap: true,
    sync: true,
    pageSize: 6,
  },
};

/** The CLI and scheduled workflow use the same opt-in rule.
 * @param {string} username
 */
export function isContributionSyncEnabled(
  username,
  config = integrationConfig,
) {
  return Boolean(
    config.contributions.enabled &&
    config.contributions.sync &&
    username.trim(),
  );
}

/** Resolve optional services without requiring Astro, a browser, or credentials.
 * @param {Record<string, string | undefined>} env
 */
export function resolveIntegrations(env, config = integrationConfig) {
  const comments = {
    ...config.comments,
    repositoryId: env.PUBLIC_GISCUS_REPO_ID?.trim() ?? "",
    categoryId: env.PUBLIC_GISCUS_CATEGORY_ID?.trim() ?? "",
  };
  const viewCounter = {
    ...config.viewCounter,
    url: env.PUBLIC_SUPABASE_URL?.trim() ?? "",
    anonymousKey: env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
  };
  return {
    comments: {
      ...comments,
      configured: Boolean(
        comments.enabled &&
        comments.repository &&
        comments.repositoryId &&
        comments.category &&
        comments.categoryId,
      ),
    },
    viewCounter: {
      ...viewCounter,
      configured: Boolean(
        viewCounter.enabled && viewCounter.url && viewCounter.anonymousKey,
      ),
    },
  };
}

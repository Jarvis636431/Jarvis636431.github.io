// @ts-check
import { integrationConfig } from "../../config/integrations.mjs";
import {
  validateHttpUrl,
  validateIntegrationConfig,
} from "../../config/validate.mjs";

/** The CLI and scheduled workflow use the same opt-in rule.
 * @param {string} username
 * @param {import("../../config/types.ts").IntegrationConfig} [config]
 */
export function isContributionSyncEnabled(
  username,
  config = integrationConfig,
) {
  validateIntegrationConfig(config);
  return Boolean(
    config.contributions.enabled &&
    config.contributions.sync &&
    username.trim(),
  );
}

/** Resolve optional services without requiring Astro, a browser, or credentials.
 * @param {Record<string, string | undefined>} env
 * @param {import("../../config/types.ts").IntegrationConfig} [config]
 */
export function resolveIntegrations(env, config = integrationConfig) {
  validateIntegrationConfig(config);
  const comments = {
    ...config.comments,
    repository: config.comments.repository.trim(),
    category: config.comments.category.trim(),
    repositoryId: env.PUBLIC_GISCUS_REPO_ID?.trim() ?? "",
    categoryId: env.PUBLIC_GISCUS_CATEGORY_ID?.trim() ?? "",
  };
  const viewCounter = {
    ...config.viewCounter,
    url: env.PUBLIC_SUPABASE_URL?.trim() ?? "",
    anonymousKey: env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
  };
  if (viewCounter.enabled && viewCounter.url && viewCounter.anonymousKey) {
    validateHttpUrl(viewCounter.url, "PUBLIC_SUPABASE_URL");
  }
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

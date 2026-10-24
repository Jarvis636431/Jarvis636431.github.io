// @ts-check
import { validateIntegrationConfig } from "./validate.mjs";

/** Optional capabilities. Keep personal service settings here, credentials in .env.
 * @type {import("./types.ts").IntegrationConfig}
 */
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
validateIntegrationConfig(integrationConfig);

// @ts-check

/** @param {string} field @param {string} rule */
function invalid(field, rule) {
  return new TypeError(`Invalid configuration: ${field} ${rule}.`);
}

/** @param {unknown} value @param {string} field @param {boolean} [allowEmpty] */
function stringValue(value, field, allowEmpty = false) {
  if (typeof value !== "string" || (!allowEmpty && !value.trim())) {
    throw invalid(
      field,
      allowEmpty ? "must be a string" : "must be a non-empty string",
    );
  }
  return value.trim();
}

/** Validate URLs without including potentially sensitive input in errors.
 * @param {unknown} value @param {string} field @param {boolean} [rootOnly]
 */
export function validateHttpUrl(value, field, rootOnly = false) {
  const source = stringValue(value, field);
  let url;
  try {
    url = new globalThis.URL(source);
  } catch {
    throw invalid(field, "must be an absolute HTTP(S) URL");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw invalid(
      field,
      "must be an HTTP(S) URL without credentials, a query or a fragment",
    );
  }
  if (rootOnly && url.pathname !== "/") {
    throw invalid(
      field,
      "must use the domain root; subdirectory hosting is not supported",
    );
  }
}

/** @param {{ url: string; timeZone: string }} settings */
export function validateSiteSettings(settings) {
  validateHttpUrl(settings.url, "site.url", true);
  const timeZone = stringValue(settings.timeZone, "site.timeZone");
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
  } catch {
    throw invalid(
      "site.timeZone",
      "must be a valid timezone such as Asia/Shanghai or UTC",
    );
  }
}

/** @param {import("./types.ts").Profile} profile */
export function validateProfile(profile) {
  stringValue(profile.name, "profile.name");
  const username = stringValue(
    profile.githubUsername,
    "profile.githubUsername",
    true,
  );
  if (username && !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    throw invalid(
      "profile.githubUsername",
      "must be a GitHub username, not a URL",
    );
  }
  stringValue(profile.email, "profile.email", true);
}

/** @param {import("./types.ts").IntegrationConfig} config */
export function validateIntegrationConfig(config) {
  for (const [field, value] of Object.entries({
    "comments.enabled": config.comments.enabled,
    "viewCounter.enabled": config.viewCounter.enabled,
    "contributions.enabled": config.contributions.enabled,
    "contributions.heatmap": config.contributions.heatmap,
    "contributions.sync": config.contributions.sync,
  })) {
    if (typeof value !== "boolean") throw invalid(field, "must be a boolean");
  }
  if (
    !Number.isSafeInteger(config.contributions.pageSize) ||
    config.contributions.pageSize < 1
  ) {
    throw invalid("contributions.pageSize", "must be a positive integer");
  }
  const repository = stringValue(
    config.comments.repository,
    "comments.repository",
    true,
  );
  stringValue(config.comments.category, "comments.category", true);
  stringValue(config.comments.theme, "comments.theme");
  stringValue(config.comments.language, "comments.language");
  if (
    config.comments.enabled &&
    repository &&
    !/^[\w.-]+\/[\w.-]+$/.test(repository)
  ) {
    throw invalid("comments.repository", "must use owner/repository format");
  }
}

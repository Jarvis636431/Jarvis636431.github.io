import assert from "node:assert/strict";
import test from "node:test";
import {
  integrationConfig,
  isContributionSyncEnabled,
  resolveIntegrations,
} from "../src/config/integrations.mjs";

const credentials = {
  PUBLIC_GISCUS_REPO_ID: "repository-id",
  PUBLIC_GISCUS_CATEGORY_ID: "category-id",
  PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  PUBLIC_SUPABASE_ANON_KEY: "anonymous-key",
};

test("optional services are inactive without complete credentials", () => {
  for (const env of [
    {},
    {
      PUBLIC_GISCUS_REPO_ID: "id",
      PUBLIC_SUPABASE_URL: credentials.PUBLIC_SUPABASE_URL,
    },
  ]) {
    const services = resolveIntegrations(env);
    assert.equal(services.comments.configured, false);
    assert.equal(services.viewCounter.configured, false);
  }
  const services = resolveIntegrations(credentials);
  assert.equal(services.comments.configured, true);
  assert.equal(services.viewCounter.configured, true);
});

test("disabled services stay inactive even when credentials exist", () => {
  const config = globalThis.structuredClone(integrationConfig);
  config.comments.enabled = false;
  config.viewCounter.enabled = false;
  const services = resolveIntegrations(credentials, config);
  assert.equal(services.comments.enabled, false);
  assert.equal(services.comments.configured, false);
  assert.equal(services.viewCounter.configured, false);
});

test("comments require repository and category settings as well as IDs", () => {
  for (const field of ["repository", "category"]) {
    const config = globalThis.structuredClone(integrationConfig);
    config.comments[field] = "";
    assert.equal(
      resolveIntegrations(credentials, config).comments.configured,
      false,
    );
  }
});

test("contribution sync requires both switches and an account", () => {
  assert.equal(isContributionSyncEnabled("author"), true);
  assert.equal(isContributionSyncEnabled("   "), false);
  for (const field of ["enabled", "sync"]) {
    const config = globalThis.structuredClone(integrationConfig);
    config.contributions[field] = false;
    assert.equal(isContributionSyncEnabled("author", config), false);
  }
});

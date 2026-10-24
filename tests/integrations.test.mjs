import assert from "node:assert/strict";
import test from "node:test";
import {
  isContributionSyncEnabled,
  resolveIntegrations,
} from "../src/config/integrations.mjs";

import { createConfig } from "./fixtures/config.mjs";

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
    const services = resolveIntegrations(env, createConfig());
    assert.equal(services.comments.configured, false);
    assert.equal(services.viewCounter.configured, false);
  }
  const services = resolveIntegrations(credentials, createConfig());
  assert.equal(services.comments.configured, true);
  assert.equal(services.viewCounter.configured, true);
});

test("disabled services stay inactive even when credentials exist", () => {
  const config = createConfig();
  config.comments.enabled = false;
  config.viewCounter.enabled = false;
  const services = resolveIntegrations(credentials, config);
  assert.equal(services.comments.enabled, false);
  assert.equal(services.comments.configured, false);
  assert.equal(services.viewCounter.configured, false);
});

test("comments require repository and category settings as well as IDs", () => {
  for (const field of ["repository", "category"]) {
    const config = createConfig();
    config.comments[field] = "";
    assert.equal(
      resolveIntegrations(credentials, config).comments.configured,
      false,
    );
  }
});

test("contribution sync requires both switches and an account", () => {
  assert.equal(isContributionSyncEnabled("author", createConfig()), true);
  assert.equal(isContributionSyncEnabled("   ", createConfig()), false);
  for (const field of ["enabled", "sync"]) {
    const config = createConfig();
    config.contributions[field] = false;
    assert.equal(isContributionSyncEnabled("author", config), false);
  }
});

test("invalid Supabase URLs fail clearly only when the service would initialize", () => {
  const env = { ...credentials, PUBLIC_SUPABASE_URL: "not-a-url" };
  assert.throws(
    () => resolveIntegrations(env, createConfig()),
    /PUBLIC_SUPABASE_URL/,
  );
  const disabled = createConfig();
  disabled.viewCounter.enabled = false;
  assert.equal(
    resolveIntegrations(env, disabled).viewCounter.configured,
    false,
  );
  assert.equal(
    resolveIntegrations({ PUBLIC_SUPABASE_URL: "not-a-url" }, createConfig())
      .viewCounter.configured,
    false,
  );
});

test("whitespace-only comment settings do not enable a widget", () => {
  const config = createConfig();
  config.comments.repository = "   ";
  config.comments.category = "   ";
  assert.equal(
    resolveIntegrations(credentials, config).comments.configured,
    false,
  );
});

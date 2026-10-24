import assert from "node:assert/strict";
import test from "node:test";
import {
  validateIntegrationConfig,
  validateProfile,
  validateSiteSettings,
} from "../src/config/validate.mjs";
import { createConfig, createProfile } from "./fixtures/config.mjs";

test("site settings allow root URLs and reject unsupported or malformed origins", () => {
  for (const url of ["https://example.com", "http://localhost:4321/"]) {
    assert.doesNotThrow(() => validateSiteSettings({ url, timeZone: "UTC" }));
  }
  for (const url of [
    "",
    "example.com",
    "javascript:alert(1)",
    "https://example.com/blog/",
    "https://example.com/?query=1",
    "https://example.com/#section",
  ]) {
    assert.throws(
      () => validateSiteSettings({ url, timeZone: "UTC" }),
      /site.url/,
    );
  }
  assert.throws(
    () =>
      validateSiteSettings({
        url: "https://user:private-value@example.com",
        timeZone: "UTC",
      }),
    (error) => {
      assert.match(error.message, /site.url/);
      assert.doesNotMatch(error.message, /private-value/);
      return true;
    },
  );
});

test("invalid timezone settings identify the failing field", () => {
  assert.doesNotThrow(() =>
    validateSiteSettings({
      url: "https://example.com",
      timeZone: "Asia/Shanghai",
    }),
  );
  for (const timeZone of ["", "Not/A_Timezone"]) {
    assert.throws(
      () => validateSiteSettings({ url: "https://example.com", timeZone }),
      /site.timeZone/,
    );
  }
});

test("pagination and feature switches reject values that break browser behavior", () => {
  for (const pageSize of [
    0,
    -1,
    1.5,
    Infinity,
    NaN,
    "6",
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    const config = createConfig();
    config.contributions.pageSize = pageSize;
    assert.throws(
      () => validateIntegrationConfig(config),
      /contributions.pageSize/,
    );
  }
  const config = createConfig();
  config.comments.enabled = "false";
  assert.throws(() => validateIntegrationConfig(config), /comments.enabled/);
  const invalidRepository = createConfig();
  invalidRepository.comments.repository = "https://github.com/example/site";
  assert.throws(
    () => validateIntegrationConfig(invalidRepository),
    /comments.repository/,
  );
});

test("profile settings allow absent contacts but catch missing names and GitHub URLs", () => {
  const profile = createProfile();
  assert.doesNotThrow(() => validateProfile(profile));
  for (const username of ["Example", "example-user", "a"]) {
    profile.githubUsername = username;
    assert.doesNotThrow(() => validateProfile(profile));
  }
  for (const username of [
    "https://github.com/example",
    "-example",
    "example-",
    "x".repeat(40),
  ]) {
    profile.githubUsername = username;
    assert.throws(() => validateProfile(profile), /profile.githubUsername/);
  }
  profile.name = "   ";
  assert.throws(() => validateProfile(profile), /profile.name/);
});

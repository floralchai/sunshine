#!/usr/bin/env node
/**
 * Resolve the Giscus category ID during Quartz builds.
 *
 * The public Giscus configuration endpoint returns the repository node ID and
 * its Discussion categories. This avoids committing a guessed category ID:
 * GitHub's Discussion category IDs are repository-specific.
 */
import { readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";

const CONFIG_PATH = new URL("../quartz.config.yaml", import.meta.url);
const EXPECTED_REPO_ID = "R_kgDOVl2v_A";
const PLACEHOLDER = "REPLACE_WITH_GISCUS_CATEGORY_ID";

async function main() {
  const configText = await readFile(CONFIG_PATH, "utf8");
  const config = parse(configText);

  const commentsPlugin = config.plugins?.find(
    (plugin) => plugin.source === "@quartz-community/comments",
  );
  if (!commentsPlugin?.enabled) {
    throw new Error("The @quartz-community/comments plugin is not enabled.");
  }

  const options = commentsPlugin.options?.options;
  const repo = options?.repo;
  const expectedCategory = options?.category;
  const currentCategoryId = options?.categoryId;

  if (!repo || !expectedCategory || !currentCategoryId) {
    throw new Error("Giscus repo, category, and categoryId must be configured.");
  }

  if (currentCategoryId !== PLACEHOLDER) {
    console.log("Giscus category ID is already configured; nothing to resolve.");
    return;
  }

  const endpoint = new URL("https://giscus.app/api/discussions/categories");
  endpoint.searchParams.set("repo", repo);

  let response;
  try {
    response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TawnyFlor-Quartz-build",
      },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(
      `Could not reach the Giscus category API: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Giscus returned a non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok || result.error) {
    const detail = result.error || `HTTP ${response.status}`;
    throw new Error(
      `Giscus could not read categories for ${repo}: ${detail}. Check that the repository is public, Discussions is enabled, and the Giscus GitHub App is installed for this repository.`,
    );
  }

  if (result.repositoryId !== EXPECTED_REPO_ID) {
    throw new Error(
      `Giscus returned repository ID "${result.repositoryId ?? "(missing)"}"; expected "${EXPECTED_REPO_ID}". Refusing to build with an unexpected repository.`,
    );
  }

  const categories = Array.isArray(result.categories) ? result.categories : [];
  const category = categories.find((item) => item.name === expectedCategory);

  if (!category?.id) {
    const available = categories.map((item) => item.name).filter(Boolean).join(", ") || "(none)";
    throw new Error(
      `Giscus category "${expectedCategory}" was not found for ${repo}. Available categories: ${available}. Create or select the intended category in GitHub Discussions.`,
    );
  }

  const placeholderPattern = new RegExp(
    `(^\\s*categoryId:\\s*)["']${PLACEHOLDER}["']`,
    "m",
  );
  if (!placeholderPattern.test(configText)) {
    throw new Error("Could not find the configured Giscus categoryId placeholder in quartz.config.yaml.");
  }

  const updatedConfig = configText.replace(placeholderPattern, `$1"${category.id}"`);
  await writeFile(CONFIG_PATH, updatedConfig, "utf8");

  console.log(
    `Resolved Giscus category "${expectedCategory}" for ${repo} (${category.id}).`,
  );
}

main().catch((error) => {
  console.error(`[Giscus setup] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

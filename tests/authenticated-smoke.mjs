import assert from "node:assert/strict";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const extensionPath = path.join(repositoryRoot, "dist");
const profilePath =
  process.env.MYPACK_AUTH_PROFILE ||
  path.join(repositoryRoot, ".auth", "mypack-smoke-profile");
const portalUrl =
  process.env.MYPACK_PORTAL_URL || "https://portalsp.acs.ncsu.edu/";
const authWaitMs = Number(process.env.MYPACK_AUTH_WAIT_MS || 300_000);

const context = await chromium.launchPersistentContext(profilePath, {
  channel: "chrome",
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});

try {
  const pages = context.pages();
  const page = pages[0] || (await context.newPage());

  console.log(`Opening ${portalUrl}`);
  console.log(
    "Complete OAuth/MFA if prompted, then navigate to the supported MyPack planner page.",
  );

  await page.goto(portalUrl, { waitUntil: "domcontentloaded" });

  const launcher = page.getByRole("button", { name: "Open Pack Planner" });
  await launcher.waitFor({ state: "visible", timeout: authWaitMs });

  assert.match(
    new URL(page.url()).hostname,
    /(^|\.)acs\.ncsu\.edu$/,
    "The smoke test must remain on an NC State ACS host.",
  );

  await launcher.click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  await page.getByRole("tab", { name: "GEP Search" }).click();
  await page.getByRole("tab", { name: "Major Plan Search" }).click();

  const themeButton = page.getByRole("button", {
    name: /Switch to (light|dark) mode/,
  });
  await themeButton.click();

  await page.getByRole("button", { name: "Close planner" }).click();
  await launcher.waitFor({ state: "visible" });

  console.log("Authenticated smoke test passed.");
  console.log(
    "Verified injection, drawer open/close, tab switching, and theme toggle. No cart or enrollment action was attempted.",
  );
} finally {
  await context.close();
}

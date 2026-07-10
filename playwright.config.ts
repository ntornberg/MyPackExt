import { defineConfig, devices } from "@playwright/test";

const stagingUrl = "http://127.0.0.1:4173/planner-staging.html";

export default defineConfig({
  testDir: "./tests/smoke",
  testMatch: "**/*.smoke.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: stagingUrl,
    channel: "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        channel: "chrome",
      },
    },
  ],
  webServer: {
    command:
      "npm exec vite -- --mode staging --host 127.0.0.1 --port 4173",
    url: stagingUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { expect, test, type Page } from "@playwright/test";

function failOnAppErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().startsWith("Failed to load resource:")
    ) {
      errors.push(message.text());
    }
  });

  return errors;
}

test("loads the planner and exposes its primary controls", async ({ page }) => {
  const errors = failOnAppErrors(page);

  await page.goto("/planner-staging.html");

  await expect(page).toHaveTitle("Pack Planner Staging");
  await expect(
    page.getByRole("heading", { name: "Pack Planner", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Planner search tabs" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeEnabled();
  await expect(page.getByText("Comparison workspace")).toBeVisible();
  expect(errors).toEqual([]);
});

test("searches fixture data and switches planner modes", async ({ page }) => {
  const errors = failOnAppErrors(page);

  await page.goto("/planner-staging.html");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText(/\d+ results? after filters\./)).toBeVisible();

  const gepTab = page.getByRole("tab", { name: "GEP Search" });
  await gepTab.click();
  await expect(gepTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Comparison workspace")).toBeVisible();

  const majorTab = page.getByRole("tab", { name: "Major Plan Search" });
  await majorTab.click();
  await expect(majorTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Focus")).toBeVisible();
  expect(errors).toEqual([]);
});

test("toggles theme and keeps cart behavior safely inside staging", async ({
  page,
}) => {
  const errors = failOnAppErrors(page);

  await page.goto("/planner-staging.html");
  await expect(page.locator("html")).toHaveAttribute("data-mpp-theme", "dark");

  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mpp-theme", "light");

  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await expect(page.getByText("Cart (staging)")).toBeVisible();
  await expect(page.getByText(/MyPack not available here/)).toBeVisible();
  expect(errors).toEqual([]);
});

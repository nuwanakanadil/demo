import { test as base, expect, Page } from "@playwright/test";

type Fixtures = {
  loggedInPage: Page;
  originalName: string;
};

const TEST_EMAIL = "sithumridmal34@gmail.com";
const TEST_PASSWORD = "Sithum11";

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    // ---- SETUP: login ----
    await page.goto("/login");

    // These match LoginPage exactly:
    await page.getByLabel(/email address/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);

    // Button text is "Sign in"
    await page.getByRole("button", { name: /sign in/i }).click();

    // After login  app should navigate; to be safe:
    await page.waitForLoadState("networkidle");

    // Go to profile page
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();

    await use(page);

    // ---- TEARDOWN ----
    await page.evaluate(() => localStorage.removeItem("token"));
  },

  originalName: async ({ loggedInPage }, use) => {
    // Reads the displayed name value in the Profile card.
    // Label "Name" is present; the value is the next line div with the actual name.
    const nameValue = loggedInPage
      .locator("div:text-is('Name')")
      .locator("xpath=following-sibling::div[1]");

    const currentName = (await nameValue.textContent())?.trim() || "";
    await use(currentName);
  },
});

export { expect };
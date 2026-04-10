import { test, expect } from "./fixtures";

test.describe("User Profile Page - Real API using Fixture", () => {

  test("update modal validations (includes password validations, no DB change)", async ({ loggedInPage }) => {

    // Ensure profile page loaded
    await expect(
      loggedInPage.getByRole("heading", { name: "Profile" })
    ).toBeVisible();

    // Open update modal
    await loggedInPage.getByRole("button", { name: "Update User" }).click();
    await expect(loggedInPage.getByText("Update Profile")).toBeVisible();

    // 1️⃣ Save with nothing changed
    await loggedInPage.getByRole("button", { name: "Save Changes" }).click();
    await expect(
      loggedInPage.getByText(/Nothing to update/i)
    ).toBeVisible();

    // 2️⃣ Only one password field filled
    await loggedInPage.locator("#newPassword").fill("123456");
    await loggedInPage.locator("#confirmPassword").fill("");

    await loggedInPage.getByRole("button", { name: "Save Changes" }).click();

    await expect(
      loggedInPage.getByText(/fill BOTH New Password and Confirm Password/i)
    ).toBeVisible();

    // 3️⃣ Password mismatch
    await loggedInPage.locator("#newPassword").fill("123456");
    await loggedInPage.locator("#confirmPassword").fill("654321");

    await loggedInPage.getByRole("button", { name: "Save Changes" }).click();

    await expect(
      loggedInPage.getByText(/Passwords do not match/i)
    ).toBeVisible();

    // 4️⃣ Password too short
    await loggedInPage.locator("#newPassword").fill("123");
    await loggedInPage.locator("#confirmPassword").fill("123");

    await loggedInPage.getByRole("button", { name: "Save Changes" }).click();

    await expect(
      loggedInPage.getByText(/Password must be at least 6 characters/i)
    ).toBeVisible();

    // Close modal
    await loggedInPage.getByRole("button", { name: "Close" }).click();
  });


  test("updates name to 'Sithum' (real API) then restores original name", async ({
    loggedInPage,
    originalName,
  }) => {

    // Open update modal
    await loggedInPage.getByRole("button", { name: "Update User" }).click();
    await expect(loggedInPage.getByText("Update Profile")).toBeVisible();

    // Update name
    await loggedInPage.locator("#fullName").fill("Sithum");

    await loggedInPage.getByRole("button", { name: "Save Changes" }).click();

    // Check wherther data changed.
    await expect(
  loggedInPage.getByText("Sithum", { exact: true })
).toBeVisible();

    await loggedInPage.getByRole("button", { name: "Close" }).click();

    // Verify name updated on profile
    await expect(
  loggedInPage.getByText("Sithum", { exact: true })
).toBeVisible();

    // Restore original name (keep DB clean)
    if (originalName && originalName !== "Sithum") {

      await loggedInPage.getByRole("button", { name: "Update User" }).click();

      await loggedInPage.locator("#fullName").fill(originalName);

      await loggedInPage.getByRole("button", { name: "Save Changes" }).click();

      await expect(
        loggedInPage.getByText(/Profile updated/i)
      ).toBeVisible();

      await loggedInPage.getByRole("button", { name: "Close" }).click();

      await expect(
        loggedInPage.getByText(originalName)
      ).toBeVisible();
    }
  });


  test("opens delete modal and cancels (safe, no delete)", async ({ loggedInPage }) => {

    // Open delete modal
    await loggedInPage.getByRole("button", { name: "Delete User" }).click();

    await expect(
      loggedInPage.getByText(/Delete account/i)
    ).toBeVisible();

    // Cancel deletion
    await loggedInPage.getByRole("button", { name: "Cancel" }).click();

    // Ensure modal closed
    await expect(
      loggedInPage.getByText(/Delete account/i)
    ).toBeHidden();
  });

});
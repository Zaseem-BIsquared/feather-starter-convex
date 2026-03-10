import { test } from "./fixtures";
import { signUp } from "./helpers";

function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("Settings flows", () => {
  test("profile settings page loads with username", async ({ session }) => {
    const email = uniqueEmail();

    await signUp(session, email, "password123", "settingsuser");

    // Navigate to settings
    await session
      .visit("/dashboard/settings")
      .assertText("Your Username")
      .assertText("Your Avatar");
  });

});

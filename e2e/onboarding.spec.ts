import { test } from "./fixtures";
import { signUp } from "./helpers";

function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("Onboarding flows", () => {
  test("onboarding username flow", async ({ session }) => {
    const email = uniqueEmail();

    // Sign up triggers redirect to onboarding
    await session
      .visit("/login")
      .click("Create an account")
      .fillIn("Email", email)
      .fillIn("Password", "password123")
      .clickButton("Sign Up");

    // Should be on onboarding page
    await session
      .assertPath("/onboarding/username")
      .assertText("Welcome!")
      .assertText("Let's get started by choosing a username.");

    // Complete onboarding
    await session
      .fillIn("Username", "testuser")
      .clickButton("Continue")
      .assertPath("/dashboard");
  });

  test("onboarding shows for new users only", async ({ session }) => {
    const email = uniqueEmail();
    const password = "password123";

    // Sign up and complete onboarding
    await signUp(session, email, password, "testuser");
    await session.assertPath("/dashboard");

    // Sign out
    await session.click("Log Out");
    await session.assertPath("/login");

    // Sign in again -- should go directly to dashboard (no onboarding)
    await session
      .fillIn("Email", email)
      .fillIn("Password", password)
      .clickButton("Sign In")
      .assertPath("/dashboard");
  });
});

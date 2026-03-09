import "@testing-library/jest-dom/vitest";

/**
 * Some mutations schedule Stripe actions (e.g. PREAUTH_createStripeCustomer)
 * which fail in the test environment. convex-test runs scheduled functions
 * automatically and their failures surface as unhandled rejections with
 * "Write outside of transaction" errors. Suppress these globally.
 */
process.on("unhandledRejection", (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (msg.includes("Write outside of transaction")) return;
  if (msg.includes("Unable to create customer")) return;
  // Re-throw anything unexpected so real errors still fail tests
  throw reason;
});

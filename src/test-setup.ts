import "@testing-library/jest-dom/vitest";

/**
 * Targeted suppression of expected unhandled rejections.
 *
 * Some mutations schedule Stripe actions (e.g. PREAUTH_createStripeCustomer,
 * cancelCurrentUserSubscriptions) which fail in the test environment because
 * Stripe isn't configured. convex-test runs scheduled functions automatically
 * and their failures surface as unhandled rejections. We suppress only the
 * known messages here so genuine bugs still fail tests.
 */
const SUPPRESSED_MESSAGES = [
  "Write outside of transaction",
  "Unable to create customer",
  "Something went wrong while trying to handle Stripe API",
];

process.on("unhandledRejection", (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (SUPPRESSED_MESSAGES.some((s) => msg.includes(s))) return;
  // Re-throw anything unexpected so real errors still fail tests
  throw reason;
});

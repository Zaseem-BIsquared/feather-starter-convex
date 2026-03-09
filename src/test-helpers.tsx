import { type ReactNode } from "react";
import { render } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { ConvexTestQueryAuthProvider } from "feather-testing-convex/tanstack-query";
import type { ConvexTestClient } from "feather-testing-convex";

/**
 * Renders a component wrapped with:
 * 1. Real TanStack Router (createMemoryHistory + catch-all route)
 * 2. ConvexTestQueryAuthProvider (QueryClient + ConvexProvider + auth context)
 *
 * This means useQuery(convexQuery(...)), useConvexMutation(...), useAuthActions(),
 * useConvexAuth(), <Link>, useNavigate(), and useRouter() all work — zero mocks.
 */
export function renderWithRouter(
  ui: ReactNode,
  client: ConvexTestClient,
  options?: {
    authenticated?: boolean;
    initialPath?: string;
  },
) {
  const rootRoute = createRootRoute({
    component: () => (
      <ConvexTestQueryAuthProvider
        client={client}
        authenticated={options?.authenticated ?? true}
      >
        {ui}
      </ConvexTestQueryAuthProvider>
    ),
  });

  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => null,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([catchAllRoute]),
    history: createMemoryHistory({
      initialEntries: [options?.initialPath ?? "/"],
    }),
    defaultPendingMinMs: 0,
  });

  const result = render(<RouterProvider router={router} />);

  return { ...result, router };
}

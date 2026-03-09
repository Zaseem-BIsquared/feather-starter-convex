# Dashboard

## Purpose

Main authenticated area of the application. Provides the dashboard landing page and the navigation shell (tab bar) that wraps all authenticated routes. Navigation is data-driven from `src/shared/nav.ts`, making it extensible by plugins.

## Backend Counterpart

No dedicated `convex/dashboard/` directory. The dashboard consumes data from `convex/users/queries.ts` (current user) and displays it.

## Key Files

- `src/features/dashboard/components/DashboardPage.tsx` -- dashboard landing page with getting-started content
- `src/features/dashboard/components/Navigation.tsx` -- navigation shell with tab bar, user dropdown, theme toggle
- `src/features/dashboard/index.ts` -- barrel export (`DashboardPage`, `Navigation`)
- `src/features/dashboard/dashboard.test.tsx` -- feature tests
- `src/routes/_app/_auth/dashboard/_layout.tsx` -- dashboard layout route (renders Navigation + Outlet)

## Dependencies

- `src/shared/nav.ts` -- data-driven navigation items array
- `convex/users/queries.ts` -- `getCurrentUser` for user display in nav
- `react-i18next` for translations (`dashboard` namespace)
- `lucide-react` for icons

## Extension Points

- Add navigation items by appending to `src/shared/nav.ts` (plugins do this)
- Add dashboard sub-pages by creating new routes under `src/routes/_app/_auth/dashboard/`
- The Navigation component renders items from the `navItems` array -- no code changes needed to add tabs

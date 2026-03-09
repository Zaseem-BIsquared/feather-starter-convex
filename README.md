# Feather Starter (Convex)

A lightweight, production-ready starter template for building SaaS applications with Convex.

## Tech Stack

- **[Convex](https://convex.dev)** — Reactive, typesafe backend with auth and file storage
- **[React](https://react.dev)** + **[Vite](https://vite.dev)** — Fast frontend tooling
- **[TanStack Router](https://tanstack.com/router)** — Type-safe file-based routing
- **[Stripe](https://stripe.com)** — Subscriptions and billing
- **[Tailwind CSS](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)** — Styling and components
- **[Resend](https://resend.com)** + **[React Email](https://react.email)** — Transactional email
- **i18n** — Internationalization support

## Features

- 🔑 Email code and social login authentication
- 🛍️ Stripe subscription plans and customer portal
- 📥 File uploads with Convex storage
- 🌙 Light / dark theme switching
- 📱 Fully responsive design
- 🏕 Landing, onboarding, dashboard, and admin pages

## Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Set up Convex:**

   ```sh
   npx convex dev --configure=new --once
   npx @convex-dev/auth
   ```

3. **Configure environment variables:**

   ```sh
   # Resend (email)
   npx convex env set AUTH_RESEND_KEY re_...

   # Stripe
   npx convex env set STRIPE_SECRET_KEY sk_test_...
   npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
   ```

4. **Start the dev server:**

   ```sh
   npm start
   ```

   Open [http://localhost:5173](http://localhost:5173).

## Documentation

See the [`docs/`](./docs) directory for detailed setup and deployment guides.

## License

MIT

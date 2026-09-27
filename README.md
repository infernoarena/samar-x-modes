# SAMAR X MODES

Live storefront with a Firebase Realtime Database-backed catalog and admin panel.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/samar-x-modes-store run dev
```

## Enable Firebase sync

The web client reads the public Firebase project configuration from
`config/google-services.json` and signs in anonymously before opening the
Realtime Database stream. The Firebase project must allow anonymous sign-in and
authenticated database access:

1. In Firebase Console, open **Authentication → Sign-in method** and enable
   **Anonymous**.
2. Open **Realtime Database → Rules** and publish the contents of
   `firebase-database.rules.json`.

The rules intentionally require an authenticated Firebase user. Until that
one-time rules update is published, the storefront stays usable with its
browser-local fallback and the admin panel shows **Local mode** instead of
pretending that live sync is active.

## Publish to GitHub Pages

Run this from the repository root:

```bash
pnpm --filter @workspace/scripts run publish:github-pages
```

The command builds the store with GitHub Pages-safe relative asset paths and
updates `docs/` with `index.html`, `404.html`, and `.nojekyll`. In the GitHub
repository settings, choose **Pages → Deploy from a branch**, select the
default branch, and choose the `/docs` folder. A root `index.html` redirect is
also included for repositories configured to publish from `/`.
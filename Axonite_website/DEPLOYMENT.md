# Build and deployment

The site is built as static HTML with Astro. Blog posts and open roles are Markdown entries in `src/content/blog/` and `src/content/careers/`; changes are published through the normal pull-request workflow.

## Local build

1. Copy `.env.example` to `.env`.
2. Set `PUBLIC_TURNSTILE_SITE_KEY` to the public Cloudflare Turnstile site key.
3. Run `npm ci` and `npm run build`.

The Azure Function is in `api/` and exposes `POST /api/contact`. It checks the Turnstile token before sending the message through SendGrid. Configure these application settings on the Azure Static Web App; do not commit their values:

- `TURNSTILE_SECRET_KEY` — Cloudflare secret key
- `SENDGRID_API_KEY` — SendGrid API key
- `CONTACT_FROM_EMAIL` — verified SendGrid sender address
- `CONTACT_TO_EMAIL` — Axonite enquiry inbox

Set the GitHub repository variable `PUBLIC_TURNSTILE_SITE_KEY` and repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN` for the workflow in `.github/workflows/azure-static-web-apps.yml`. The Turnstile widget must allow the deployed site hostname.

## Azure Static Web Apps

The workflow builds `Axonite_website/dist` and deploys that directory alongside `Axonite_website/api`. The workflow deploys `main` and creates/closes preview environments for pull requests.

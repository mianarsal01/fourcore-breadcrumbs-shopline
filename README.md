# fourcore-breadcrumbs-shopline

Shopline version scaffold for FourCore Breadcrumbs.

## App URLs (SHOPLINE Partner Portal)

- App URL: `https://fourcore-breadcrumbs.netlify.app`
- App callback URL: `https://fourcore-breadcrumbs.netlify.app/auth/callback`

## Netlify Environment Variables

- `SHOPLINE_APP_KEY`
- `SHOPLINE_APP_SECRET`
- `SHOPLINE_SCOPES` (comma-separated, no spaces)
- `SHOPLINE_REDIRECT_URI=https://fourcore-breadcrumbs.netlify.app/auth/callback`

## Endpoints

- `/auth/install` -> Start OAuth authorization redirect.
- `/auth/callback` -> Exchanges `code` for access token.
- `/webhooks/app-uninstalled` -> Verifies webhook signature.
- `/health` -> Runtime status check.

## Notes

- OAuth token exchange is implemented.
- Token persistence is not implemented yet; next step is storing access/refresh token per merchant.
- Webhook signature verification follows SHOPLINE docs using:
  - `x-shopline-developer-event-timestamp`
  - `x-shopline-hmac-sha256`
  - message format: `timestamp + ':' + JSON.stringify(sortedPayload)`

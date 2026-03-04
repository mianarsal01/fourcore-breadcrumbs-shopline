# fourcore-breadcrumbs-shopline

Shopline adaptation of FourCore Breadcrumbs, implemented in this repository only.

## URLs for SHOPLINE Partner Portal

- App URL: `https://fourcore-breadcrumbs.netlify.app`
- App callback URL: `https://fourcore-breadcrumbs.netlify.app/auth/callback`

## Netlify Environment Variables

- `SHOPLINE_APP_KEY`
- `SHOPLINE_APP_SECRET`
- `SHOPLINE_SCOPES` (comma-separated, no spaces)
- `SHOPLINE_REDIRECT_URI=https://fourcore-breadcrumbs.netlify.app/auth/callback`

## App Endpoints

- `/auth/install` -> Starts OAuth authorization.
- `/auth/callback` -> Exchanges code for access token and stores token per merchant.
- `/api/session?merchant_id=...` -> Returns OAuth connection status.
- `/api/settings?merchant_id=...` -> GET/POST settings payload for dashboard.
- `/webhooks/app-uninstalled` -> Webhook signature verification endpoint.
- `/health` -> Runtime check.

## Notes

- Merchant tokens and settings are stored in Netlify Blobs.
- This codebase is separate from the Shopify app and does not modify it.

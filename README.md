# fourcore-breadcrumbs-shopline

Minimal Netlify starter for SHOPLINE app onboarding.

## Endpoints

- App URL: `/`
- Callback URL: `/auth/callback`
- Health check: `/health`

## SHOPLINE setup

Use these values in SHOPLINE Partner Portal:

- App URL: `https://fourcore-breadcrumbs.netlify.app`
- App callback URL: `https://fourcore-breadcrumbs.netlify.app/auth/callback`

## Notes

`/auth/callback` currently validates incoming query params and returns JSON.
Next step is implementing OAuth code exchange and token storage.

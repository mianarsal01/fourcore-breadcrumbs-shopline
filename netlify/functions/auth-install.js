const crypto = require("crypto");

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function toScopeParam(value) {
  // SHOPLINE auth expects space-delimited scopes.
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

exports.handler = async function handler(event) {
  try {
    const clientId = required("SHOPLINE_APP_KEY");
    const redirectUri = required("SHOPLINE_REDIRECT_URI");
    const rawScopes = required("SHOPLINE_SCOPES");
    const scope = toScopeParam(rawScopes);

    const incoming = event.queryStringParameters || {};
    const merchantId = incoming.merchant_id || "";
    const next = incoming.next || "/";

    const state = crypto.randomBytes(16).toString("hex");

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope,
      state,
    });

    // SHOPLINE expects merchant_id (not store handle). If we only have handle-like
    // value, omit it and let auth server resolve merchant from current session.
    const merchantIdLooksValid = /^\d+$/.test(String(merchantId).trim());
    if (merchantIdLooksValid) {
      params.set("merchant_id", merchantId);
    }

    // We return state in query for now because there is no persistent session store yet.
    // Next iteration should store state in encrypted cookie or DB and verify on callback.
    params.set("next", next);

    const authorizeUrl = `https://developers.shoplineapp.com/oauth/authorize?${params.toString()}`;
    const escapedUrl = authorizeUrl.replace(/"/g, "&quot;");

    // SHOPLINE admin embeds apps in an iframe. OAuth must run in the top-level
    // window because SSO pages reject iframe embedding.
    return {
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
      body: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to SHOPLINE</title>
  </head>
  <body style="font-family: sans-serif; padding: 16px;">
    <p>Redirecting to SHOPLINE authorization...</p>
    <p><a href="${escapedUrl}" target="_top" rel="noopener noreferrer">Continue</a></p>
    <script>
      (function () {
        var url = ${JSON.stringify(authorizeUrl)};
        try {
          if (window.top && window.top !== window.self) {
            window.top.location.href = url;
          } else {
            window.location.href = url;
          }
        } catch (e) {
          window.location.href = url;
        }
      })();
    </script>
  </body>
</html>`,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};

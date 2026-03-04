const crypto = require("crypto");

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(payload, null, 2),
  };
}

async function exchangeToken({ code, clientId, clientSecret, redirectUri }) {
  const response = await fetch("https://developers.shoplineapp.com/oauth/token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      code,
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { ok: response.ok, status: response.status, data };
}

function mask(value) {
  if (!value || typeof value !== "string") return "";
  if (value.length <= 10) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

exports.handler = async function handler(event) {
  try {
    const clientId = required("SHOPLINE_APP_KEY");
    const clientSecret = required("SHOPLINE_APP_SECRET");
    const redirectUri = required("SHOPLINE_REDIRECT_URI");

    const params = event.queryStringParameters || {};
    const code = params.code || "";
    const state = params.state || "";
    const err = params.error || "";

    if (err) {
      return json(400, {
        ok: false,
        message: "OAuth callback returned an error",
        error: err,
        params,
      });
    }

    if (!code) {
      return json(400, {
        ok: false,
        message: "Missing query param: code",
        params,
      });
    }

    const tokenResult = await exchangeToken({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });

    if (!tokenResult.ok) {
      return json(tokenResult.status, {
        ok: false,
        message: "Token exchange failed",
        tokenResponse: tokenResult.data,
      });
    }

    const accessToken = tokenResult.data && tokenResult.data.access_token;
    const refreshToken = tokenResult.data && tokenResult.data.refresh_token;

    // We surface token metadata for now; persistent storage comes next.
    return json(200, {
      ok: true,
      message: "SHOPLINE OAuth completed",
      stateReceived: Boolean(state),
      token: {
        accessTokenPreview: mask(accessToken),
        refreshTokenPreview: mask(refreshToken),
        expiresIn: tokenResult.data.expires_in,
        scope: tokenResult.data.scope,
        tokenType: tokenResult.data.token_type,
        resourceOwnerId: tokenResult.data.resource_owner_id,
      },
      nextStep: "Persist tokens by merchant and wire real app settings CRUD.",
    });
  } catch (error) {
    return json(500, { ok: false, message: error.message });
  }
};

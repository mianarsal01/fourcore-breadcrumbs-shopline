const { setTokenRecord } = require("./_store");

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

exports.handler = async function handler(event) {
  try {
    const clientId = required("SHOPLINE_APP_KEY");
    const clientSecret = required("SHOPLINE_APP_SECRET");
    const redirectUri = required("SHOPLINE_REDIRECT_URI");

    const params = event.queryStringParameters || {};
    const code = params.code || "";
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

    const merchantId = String(
      tokenResult.data.resource_owner_id ||
        params.merchant_id ||
        params.shop_id ||
        params.shop ||
        ""
    ).trim();

    if (!merchantId) {
      return json(500, {
        ok: false,
        message: "OAuth succeeded but merchant identifier is missing",
        tokenResponse: tokenResult.data,
      });
    }

    await setTokenRecord(merchantId, tokenResult.data);

    return {
      statusCode: 302,
      headers: {
        location: `/?merchant_id=${encodeURIComponent(merchantId)}&connected=1`,
        "cache-control": "no-store",
        "set-cookie": [
          `fc_shopline_merchant=${encodeURIComponent(merchantId)}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`,
          `fc_shopline_merchant_server=${encodeURIComponent(merchantId)}; Path=/; Max-Age=2592000; Secure; HttpOnly; SameSite=Lax`,
        ],
      },
    };
  } catch (error) {
    return json(500, { ok: false, message: error.message });
  }
};

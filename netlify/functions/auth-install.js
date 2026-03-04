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

    if (merchantId) {
      params.set("merchant_id", merchantId);
    }

    // We return state in query for now because there is no persistent session store yet.
    // Next iteration should store state in encrypted cookie or DB and verify on callback.
    params.set("next", next);

    return {
      statusCode: 302,
      headers: {
        location: `https://developers.shoplineapp.com/oauth/authorize?${params.toString()}`,
        "cache-control": "no-store",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};

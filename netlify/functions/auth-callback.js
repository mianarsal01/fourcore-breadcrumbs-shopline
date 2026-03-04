exports.handler = async function handler(event) {
  const params = event.queryStringParameters || {};
  const code = params.code || "";
  const shop = params.shop || params.shop_id || "";
  const state = params.state || "";
  const error = params.error || "";

  if (error) {
    return {
      statusCode: 400,
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: false,
        message: "OAuth callback returned an error",
        error
      })
    };
  }

  if (!code) {
    return {
      statusCode: 400,
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: false,
        message: "Missing 'code' in callback query params"
      })
    };
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      ok: true,
      message: "Callback received. Next: exchange code for access token server-side.",
      received: {
        shop,
        hasCode: Boolean(code),
        state
      }
    })
  };
};

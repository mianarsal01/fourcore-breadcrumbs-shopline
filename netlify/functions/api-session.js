const { getTokenRecord } = require("./_store");

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

exports.handler = async function handler(event) {
  try {
    const params = event.queryStringParameters || {};
    const merchantId = (params.merchant_id || "").trim();

    if (!merchantId) {
      return json(400, { ok: false, message: "Missing merchant_id" });
    }

    const tokenRecord = await getTokenRecord(merchantId);

    return json(200, {
      ok: true,
      connected: Boolean(tokenRecord && tokenRecord.access_token),
      merchantId,
      tokenUpdatedAt: tokenRecord ? tokenRecord.updatedAt : null,
    });
  } catch (error) {
    return json(500, { ok: false, message: error.message });
  }
};

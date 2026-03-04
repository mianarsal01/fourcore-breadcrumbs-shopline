const { DEFAULT_SETTINGS, normalizeSettings } = require("./_settings");
const { getSettingsRecord, setSettingsRecord } = require("./_store");

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

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

exports.handler = async function handler(event) {
  try {
    const params = event.queryStringParameters || {};
    const merchantId = String(params.merchant_id || "").trim();

    if (!merchantId) {
      return json(400, { ok: false, message: "Missing merchant_id" });
    }

    if (event.httpMethod === "GET") {
      const record = await getSettingsRecord(merchantId);
      const settings = normalizeSettings(record && record.settings ? record.settings : DEFAULT_SETTINGS);
      return json(200, {
        ok: true,
        merchantId,
        settings,
        updatedAt: record ? record.updatedAt : null,
      });
    }

    if (event.httpMethod === "POST") {
      const body = parseBody(event);
      const settings = normalizeSettings(body.settings || {});
      await setSettingsRecord(merchantId, settings);
      return json(200, {
        ok: true,
        merchantId,
        settings,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      statusCode: 405,
      headers: { allow: "GET, POST" },
      body: "Method Not Allowed",
    };
  } catch (error) {
    return json(500, { ok: false, message: error.message });
  }
};

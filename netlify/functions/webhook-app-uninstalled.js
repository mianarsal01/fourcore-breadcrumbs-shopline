const crypto = require("crypto");

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function sortPayload(input) {
  if (Array.isArray(input)) {
    return input.map(sortPayload);
  }
  if (input && typeof input === "object") {
    const sorted = {};
    for (const key of Object.keys(input).sort()) {
      sorted[key] = sortPayload(input[key]);
    }
    return sorted;
  }
  return input;
}

function timingSafeEqualString(a, b) {
  const ba = Buffer.from(a || "", "utf8");
  const bb = Buffer.from(b || "", "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function verifyLegacy({ payload, timestamp, signature, appSecret }) {
  if (!timestamp || !signature) return false;
  const sortedPayload = sortPayload(payload);
  const message = `${timestamp}:${JSON.stringify(sortedPayload)}`;
  const expectedHex = crypto.createHmac("sha256", appSecret).update(message).digest("hex");
  return timingSafeEqualString(expectedHex, signature);
}

function verifyRawBody({ rawBody, signature, appSecret }) {
  if (!rawBody || !signature) return false;
  const expectedBase64 = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("base64");
  const expectedHex = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqualString(expectedBase64, signature) || timingSafeEqualString(expectedHex, signature);
}

exports.handler = async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { allow: "POST" },
        body: "Method Not Allowed",
      };
    }

    const appSecret = required("SHOPLINE_APP_SECRET");
    const headers = event.headers || {};
    const timestamp = headers["x-shopline-developer-event-timestamp"] || headers["X-Shopline-Developer-Event-Timestamp"];
    const signature = headers["x-shopline-hmac-sha256"] || headers["X-Shopline-Hmac-Sha256"];

    if (!signature) {
      return {
        statusCode: 401,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, message: "Missing webhook signature header" }),
      };
    }

    const rawBody = event.body || "";
    const payload = rawBody ? JSON.parse(rawBody) : {};

    const validLegacy = verifyLegacy({ payload, timestamp, signature, appSecret });
    const validRawBody = verifyRawBody({ rawBody, signature, appSecret });

    if (!validLegacy && !validRawBody) {
      return {
        statusCode: 401,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, message: "Invalid webhook signature" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        ok: true,
        received: true,
        topic: headers["x-shopline-topic"] || headers["X-Shopline-Topic"] || null,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, message: error.message }),
    };
  }
};

const { getStore } = require("@netlify/blobs");

const TOKENS_STORE = "fourcore-breadcrumbs-shopline-tokens";
const SETTINGS_STORE = "fourcore-breadcrumbs-shopline-settings";

function tokenKey(merchantId) {
  return `merchant:${merchantId}:token`;
}

function settingsKey(merchantId) {
  return `merchant:${merchantId}:settings`;
}

function parseJsonSafe(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function getTokenRecord(merchantId) {
  const store = getStore(TOKENS_STORE);
  const value = await store.get(tokenKey(merchantId));
  return parseJsonSafe(value, null);
}

async function setTokenRecord(merchantId, tokenData) {
  const store = getStore(TOKENS_STORE);
  await store.setJSON(tokenKey(merchantId), {
    ...tokenData,
    merchantId,
    updatedAt: new Date().toISOString(),
  });
}

async function getSettingsRecord(merchantId) {
  const store = getStore(SETTINGS_STORE);
  const value = await store.get(settingsKey(merchantId));
  return parseJsonSafe(value, null);
}

async function setSettingsRecord(merchantId, settings) {
  const store = getStore(SETTINGS_STORE);
  await store.setJSON(settingsKey(merchantId), {
    merchantId,
    settings,
    updatedAt: new Date().toISOString(),
  });
}

module.exports = {
  getTokenRecord,
  setTokenRecord,
  getSettingsRecord,
  setSettingsRecord,
};

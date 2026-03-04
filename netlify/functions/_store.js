let getStoreFromBlobs = null;
try {
  ({ getStore: getStoreFromBlobs } = require("@netlify/blobs"));
} catch {
  getStoreFromBlobs = null;
}

const TOKENS_STORE = "fourcore-breadcrumbs-shopline-tokens";
const SETTINGS_STORE = "fourcore-breadcrumbs-shopline-settings";
const memoryStores = global.__fcMemoryStores || (global.__fcMemoryStores = new Map());

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

function getMemoryStore(name) {
  if (!memoryStores.has(name)) {
    memoryStores.set(name, new Map());
  }
  const map = memoryStores.get(name);
  return {
    async get(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async setJSON(key, value) {
      map.set(key, JSON.stringify(value));
    },
  };
}

function resolveStore(name) {
  if (!getStoreFromBlobs) {
    return getMemoryStore(name);
  }
  try {
    return getStoreFromBlobs(name);
  } catch {
    return getMemoryStore(name);
  }
}

async function getTokenRecord(merchantId) {
  const store = resolveStore(TOKENS_STORE);
  const value = await store.get(tokenKey(merchantId));
  return parseJsonSafe(value, null);
}

async function setTokenRecord(merchantId, tokenData) {
  const store = resolveStore(TOKENS_STORE);
  await store.setJSON(tokenKey(merchantId), {
    ...tokenData,
    merchantId,
    updatedAt: new Date().toISOString(),
  });
}

async function getSettingsRecord(merchantId) {
  const store = resolveStore(SETTINGS_STORE);
  const value = await store.get(settingsKey(merchantId));
  return parseJsonSafe(value, null);
}

async function setSettingsRecord(merchantId, settings) {
  const store = resolveStore(SETTINGS_STORE);
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

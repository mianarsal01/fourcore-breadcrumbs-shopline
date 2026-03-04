const DEFAULT_SETTINGS = {
  enabled: true,
  followVisitorPath: false,
  hideTopLevelCategory: false,
  hideLegacyBreadcrumb: false,
  legacyBreadcrumbSelector: "",
  useThemeSeparator: false,
  useThemeAlignment: false,
  useThemeFontSize: false,
  useThemeLinkColor: false,
  useThemeHoverColor: false,
  useThemeProductTitleColor: false,
  productTitleColor: "#111111",
  linkUnderlineMode: "theme",
  capitalizationMode: "theme",
  showRootCategory: true,
  rootCategoryLabel: "Home",
  rootCategoryPath: "/",
  homeIconImageUrl: "",
  autoDetectLanguageFromUrl: false,
  lastCrumbAsText: false,
  lastCrumbWeight: "theme",
  productTitleTruncate: 0,
  mobileScrollable: true,
  seoSafeMode: true,
  separator: "›",
  alignment: "left",
  fontSize: 14,
  textColor: "#111111",
  linkColor: "#4f46e5",
  hoverColor: "#06b6d4",
  maxLevels: 5,
  strategy: "default",
  menuHandle: "",
  menuTopLevelHandle: "",
  defaultCollectionHandle: "",
  ignoredCollections: "",
  enableSchema: true,
};

function getCookie(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function getMerchantId() {
  const url = new URL(window.location.href);
  const queryKeys = ["merchant_id", "merchantId", "shop_id", "shopId", "shop", "handle", "merchant"];

  for (const key of queryKeys) {
    const value = (url.searchParams.get(key) || "").trim();
    if (value) {
      localStorage.setItem("fc_merchant_id", value);
      return value;
    }
  }

  const fromCookie = getCookie("fc_shopline_merchant");
  if (fromCookie) {
    localStorage.setItem("fc_merchant_id", fromCookie);
    return fromCookie;
  }

  return localStorage.getItem("fc_merchant_id") || "";
}

function setToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
}

function clearToast() {
  const toast = document.getElementById("toast");
  toast.className = "toast";
  toast.textContent = "";
}

function setConnectionStatus(connected) {
  const el = document.getElementById("connection-status");
  el.textContent = connected ? "Connected" : "Not connected";
  el.className = `value ${connected ? "ok" : "bad"}`;
}

function updateInstallLink(merchantId) {
  const a = document.getElementById("install-link");
  a.href = merchantId ? `/auth/install?merchant_id=${encodeURIComponent(merchantId)}` : "/auth/install";
}

function readForm() {
  const out = { ...DEFAULT_SETTINGS };
  const fields = document.querySelectorAll("[data-field]");
  for (const field of fields) {
    const key = field.getAttribute("data-field");
    if (!key) continue;

    if (field.type === "checkbox") out[key] = Boolean(field.checked);
    else if (field.type === "number") out[key] = Number(field.value);
    else out[key] = field.value;
  }
  return out;
}

function writeForm(settings) {
  const fields = document.querySelectorAll("[data-field]");
  for (const field of fields) {
    const key = field.getAttribute("data-field");
    if (!key) continue;
    const value = settings[key];

    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value ?? "";
  }
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

async function init() {
  clearToast();
  const merchantId = getMerchantId();
  document.getElementById("merchant-id").textContent = merchantId || "Unknown";
  updateInstallLink(merchantId);

  if (!merchantId) {
    setConnectionStatus(false);
    setToast("Missing merchant context. Run /auth/install once from this app URL, then reload.", "error");
    writeForm(DEFAULT_SETTINGS);
    return;
  }

  try {
    const session = await fetchJson(`/api/session?merchant_id=${encodeURIComponent(merchantId)}`);
    setConnectionStatus(Boolean(session.connected));

    const payload = await fetchJson(`/api/settings?merchant_id=${encodeURIComponent(merchantId)}`);
    writeForm(payload.settings || DEFAULT_SETTINGS);
    if (payload.updatedAt) {
      document.getElementById("last-saved").textContent = new Date(payload.updatedAt).toLocaleString();
    }
  } catch (error) {
    setToast(error.message, "error");
    writeForm(DEFAULT_SETTINGS);
  }
}

async function saveSettings() {
  clearToast();
  const merchantId = getMerchantId();
  if (!merchantId) {
    setToast("Cannot save: missing merchant context", "error");
    return;
  }

  const settings = readForm();

  try {
    const payload = await fetchJson(`/api/settings?merchant_id=${encodeURIComponent(merchantId)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ settings }),
    });

    writeForm(payload.settings || settings);
    document.getElementById("last-saved").textContent = new Date(payload.updatedAt).toLocaleString();
    setToast("Settings saved.", "success");
  } catch (error) {
    setToast(error.message, "error");
  }
}

function resetDefaults() {
  writeForm(DEFAULT_SETTINGS);
  setToast("Defaults restored locally. Click Save to persist.", "success");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("save-btn").addEventListener("click", saveSettings);
  document.getElementById("reset-btn").addEventListener("click", resetDefaults);
  init();
});

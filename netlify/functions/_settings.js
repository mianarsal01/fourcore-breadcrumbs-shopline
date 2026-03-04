const ALLOWED_SEPARATORS = new Set(["›", ">", "/", "|", "•", "»", "→", "-", "·", ":"]);

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

function sanitizeSeparator(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return ">";
  if (normalized.includes("â")) return "›";
  if (ALLOWED_SEPARATORS.has(normalized)) return normalized;
  return normalized.slice(0, 1);
}

function normalizeHex(value, fallback) {
  const raw = String(value || "").trim();
  const match = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return fallback.toLowerCase();
  const hex = match[1];
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((ch) => `${ch}${ch}`)
      .join("")
      .toLowerCase()}`;
  }
  return `#${hex.toLowerCase()}`;
}

function bool(input, fallback) {
  return typeof input === "boolean" ? input : fallback;
}

function text(input, fallback, max = 255) {
  const out = String(input ?? fallback).trim();
  return out.slice(0, max);
}

function normalizeSettings(input = {}) {
  const fontSize = Number(input.fontSize ?? DEFAULT_SETTINGS.fontSize);
  const maxLevels = Number(input.maxLevels ?? DEFAULT_SETTINGS.maxLevels);
  const truncate = Number(input.productTitleTruncate ?? DEFAULT_SETTINGS.productTitleTruncate);

  return {
    ...DEFAULT_SETTINGS,
    enabled: bool(input.enabled, DEFAULT_SETTINGS.enabled),
    followVisitorPath: bool(input.followVisitorPath, DEFAULT_SETTINGS.followVisitorPath),
    hideTopLevelCategory: bool(input.hideTopLevelCategory, DEFAULT_SETTINGS.hideTopLevelCategory),
    hideLegacyBreadcrumb: bool(input.hideLegacyBreadcrumb, DEFAULT_SETTINGS.hideLegacyBreadcrumb),
    legacyBreadcrumbSelector: text(input.legacyBreadcrumbSelector, DEFAULT_SETTINGS.legacyBreadcrumbSelector, 180),
    useThemeSeparator: bool(input.useThemeSeparator, DEFAULT_SETTINGS.useThemeSeparator),
    useThemeAlignment: bool(input.useThemeAlignment, DEFAULT_SETTINGS.useThemeAlignment),
    useThemeFontSize: bool(input.useThemeFontSize, DEFAULT_SETTINGS.useThemeFontSize),
    useThemeLinkColor: bool(input.useThemeLinkColor, DEFAULT_SETTINGS.useThemeLinkColor),
    useThemeHoverColor: bool(input.useThemeHoverColor, DEFAULT_SETTINGS.useThemeHoverColor),
    useThemeProductTitleColor: bool(input.useThemeProductTitleColor, DEFAULT_SETTINGS.useThemeProductTitleColor),
    productTitleColor: normalizeHex(input.productTitleColor, DEFAULT_SETTINGS.productTitleColor),
    linkUnderlineMode: ["theme", "always", "never", "hover"].includes(input.linkUnderlineMode)
      ? input.linkUnderlineMode
      : DEFAULT_SETTINGS.linkUnderlineMode,
    capitalizationMode: ["theme", "none", "uppercase", "lowercase", "title"].includes(input.capitalizationMode)
      ? input.capitalizationMode
      : DEFAULT_SETTINGS.capitalizationMode,
    showRootCategory: bool(input.showRootCategory, DEFAULT_SETTINGS.showRootCategory),
    rootCategoryLabel: text(input.rootCategoryLabel, DEFAULT_SETTINGS.rootCategoryLabel, 40),
    rootCategoryPath: text(input.rootCategoryPath, DEFAULT_SETTINGS.rootCategoryPath, 120).startsWith("/")
      ? text(input.rootCategoryPath, DEFAULT_SETTINGS.rootCategoryPath, 120)
      : `/${text(input.rootCategoryPath, DEFAULT_SETTINGS.rootCategoryPath, 120)}`,
    homeIconImageUrl: text(input.homeIconImageUrl, DEFAULT_SETTINGS.homeIconImageUrl, 2048),
    autoDetectLanguageFromUrl: bool(input.autoDetectLanguageFromUrl, DEFAULT_SETTINGS.autoDetectLanguageFromUrl),
    lastCrumbAsText: bool(input.lastCrumbAsText, DEFAULT_SETTINGS.lastCrumbAsText),
    lastCrumbWeight: ["theme", "500", "600", "700"].includes(input.lastCrumbWeight)
      ? input.lastCrumbWeight
      : DEFAULT_SETTINGS.lastCrumbWeight,
    productTitleTruncate: Number.isFinite(truncate) ? Math.max(0, Math.min(120, Math.round(truncate))) : 0,
    mobileScrollable: bool(input.mobileScrollable, DEFAULT_SETTINGS.mobileScrollable),
    seoSafeMode: bool(input.seoSafeMode, DEFAULT_SETTINGS.seoSafeMode),
    separator: sanitizeSeparator(input.separator),
    alignment: ["left", "center", "right"].includes(input.alignment) ? input.alignment : DEFAULT_SETTINGS.alignment,
    fontSize: Number.isFinite(fontSize) ? Math.max(10, Math.min(16, Math.round(fontSize))) : DEFAULT_SETTINGS.fontSize,
    textColor: normalizeHex(input.textColor, DEFAULT_SETTINGS.textColor),
    linkColor: normalizeHex(input.linkColor, DEFAULT_SETTINGS.linkColor),
    hoverColor: normalizeHex(input.hoverColor, DEFAULT_SETTINGS.hoverColor),
    maxLevels: Number.isFinite(maxLevels) ? Math.max(2, Math.min(10, Math.round(maxLevels))) : DEFAULT_SETTINGS.maxLevels,
    strategy: input.strategy === "menu" ? "menu" : "default",
    menuHandle: text(input.menuHandle, DEFAULT_SETTINGS.menuHandle, 80).toLowerCase(),
    menuTopLevelHandle: text(input.menuTopLevelHandle, DEFAULT_SETTINGS.menuTopLevelHandle, 80).toLowerCase(),
    defaultCollectionHandle: text(input.defaultCollectionHandle, DEFAULT_SETTINGS.defaultCollectionHandle, 80).toLowerCase(),
    ignoredCollections: text(input.ignoredCollections, DEFAULT_SETTINGS.ignoredCollections, 240).toLowerCase(),
    enableSchema: bool(input.enableSchema, DEFAULT_SETTINGS.enableSchema),
  };
}

module.exports = { DEFAULT_SETTINGS, normalizeSettings };

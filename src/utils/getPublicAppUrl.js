function normalizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/+$/, "");
}

export function getPublicAppUrl() {
  const envUrl =
    import.meta.env.VITE_PUBLIC_APP_URL ||
    import.meta.env.VITE_APP_BASE_URL ||
    "";

  const normalizedEnv = normalizeUrl(envUrl);
  if (normalizedEnv) return normalizedEnv;

  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeUrl(window.location.origin);
  }

  return "";
}

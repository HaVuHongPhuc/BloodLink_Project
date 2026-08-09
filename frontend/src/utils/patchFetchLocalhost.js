import { API_BASE_URL } from "./apiBaseUrl";

const LEGACY_API_PREFIX = "http://localhost:5000";

const rewriteLegacyApiUrl = (rawUrl) => {
  if (!rawUrl || !API_BASE_URL) {
    return rawUrl;
  }

  if (rawUrl.startsWith(LEGACY_API_PREFIX)) {
    return `${API_BASE_URL}${rawUrl.slice(LEGACY_API_PREFIX.length)}`;
  }

  return rawUrl;
};

export const patchFetchLocalhost = () => {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return;
  }

  if (window.__BLOODLINK_FETCH_PATCHED__) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return originalFetch(rewriteLegacyApiUrl(input), init);
    }

    if (input instanceof URL) {
      const rewritten = rewriteLegacyApiUrl(input.toString());
      return originalFetch(rewritten, init);
    }

    if (typeof Request !== "undefined" && input instanceof Request) {
      const rewritten = rewriteLegacyApiUrl(input.url);
      if (rewritten !== input.url) {
        return originalFetch(new Request(rewritten, input), init);
      }
    }

    return originalFetch(input, init);
  };

  window.__BLOODLINK_FETCH_PATCHED__ = true;
};
const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const getDefaultBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const envBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  const runtimeBaseUrl = normalizeBaseUrl(window.__API_BASE_URL__);
  if (runtimeBaseUrl) {
    return runtimeBaseUrl;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  return normalizeBaseUrl(window.location.origin);
};

export const API_BASE_URL = getDefaultBaseUrl();

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

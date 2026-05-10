const LOCAL_API_BASE_URL = "http://localhost:4000";

const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();

export const API_BASE_URL = configuredApiBaseUrl || LOCAL_API_BASE_URL;

export function buildBackendUrl(path = "") {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildBackendAssetUrl(path = "") {
  return buildBackendUrl(path);
}
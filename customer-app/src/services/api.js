function resolveApiUrl() {
  const configured = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
  const url = new URL(configured, window.location.origin);
  const pageHost = window.location.hostname;
  const configuredIsLocal = ["localhost", "127.0.0.1"].includes(url.hostname);
  const pageIsLocal = ["localhost", "127.0.0.1"].includes(pageHost);
  if (configuredIsLocal && !pageIsLocal) url.hostname = pageHost;
  return url.toString().replace(/\/$/, "");
}

const API_URL = resolveApiUrl();

export function apiUrl(path = "") {
  return `${API_URL}${path}`;
}

export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: isForm ? options.headers : { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error("Cannot connect to the server. Make sure the API server is running, then try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", headers: isForm ? options.headers : { "Content-Type":"application/json", ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

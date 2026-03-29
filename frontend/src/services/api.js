const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export function buildApiUrl(path = "") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", headers = {}, body, token } = options;
  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody = body;
  if (body !== undefined && body !== null && typeof body === "object" && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export function extractApiError(data, fallback = "Error en la solicitud") {
  if (!data) {
    return fallback;
  }
  if (typeof data === "string") {
    return data || fallback;
  }
  if (Array.isArray(data)) {
    return data.join(" ") || fallback;
  }
  if (typeof data === "object") {
    if (data.detail) {
      return data.detail;
    }
    return Object.values(data)
      .flat()
      .join(" ") || fallback;
  }
  return fallback;
}

// Local development uses Vite’s same-origin proxy to the hosted API.
const rawBase = (import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "https://zyrava-server.onrender.com")).trim().replace(/\/$/, "");

function resolveBase() {
  if (!rawBase) return "/api/admin";
  if (rawBase.endsWith("/api/admin")) return rawBase;
  if (rawBase.endsWith("/api")) return `${rawBase}/admin`;
  return `${rawBase}/api/admin`;
}

const BASE = resolveBase();
const TOKEN_KEY = "zyrava_admin_token";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function queryString(params) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === "all") continue;
    search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function request(path, options = {}) {
  const { method = "GET", body, params, signal } = options;
  const token = getToken();
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE}${path}${queryString(params)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Could not reach the admin API. Is it running?", 0);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/login")) {
      clearToken();
      window.dispatchEvent(new Event("zyrava:unauthorized"));
    }
    throw new ApiError(
      data?.error || `Request failed (${response.status}).`,
      response.status,
      data?.details
    );
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  del: (path, body, options) => request(path, { ...options, method: "DELETE", body }),
};

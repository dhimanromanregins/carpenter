// Centralized API client — every request to the backend goes through here.
// Do not fetch/axios directly from components; add a function to the
// relevant src/api/*.ts file instead so the request shape stays typed and
// the auth/error handling below stays in one place.

const RAW_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!RAW_BASE_URL) {
  // Fail loudly in dev rather than silently hitting a wrong host.
  console.warn(
    "VITE_API_URL is not set — copy .env.example to .env and point it at your backend."
  );
}

const BASE_URL = (RAW_BASE_URL ?? "http://localhost:8000/api").replace(/\/+$/, "");

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function toQueryString(params?: QueryParams) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Swapped out by setAuthToken() once the phone/OTP auth flow lands; every
// request picks up whatever is currently set.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

interface RequestOptions {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  { params, body, signal }: RequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}/${path.replace(/^\/+/, "")}${toQueryString(params)}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(
      "Unable to reach the server. Check your connection.",
      "NETWORK_ERROR",
      0
    );
  }

  // The backend wraps every response as {success, data} or {success, error}
  // even on non-2xx statuses, but parse defensively in case something upstream
  // (a proxy, a 502) returns a non-JSON body.
  let json: { success?: boolean; data?: T; error?: { code?: string; message?: string } } | null =
    null;
  try {
    json = await res.json();
  } catch {
    // no/invalid body
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(
      json?.error?.message ?? `Request failed (${res.status})`,
      json?.error?.code ?? `HTTP_${res.status}`,
      res.status
    );
  }

  return json?.data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body" | "params">) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body" | "params">) =>
    request<T>("PUT", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, options),
};

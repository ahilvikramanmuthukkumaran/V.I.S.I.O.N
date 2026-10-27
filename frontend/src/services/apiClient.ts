// Centralized HTTP client. All backend calls go through here.
// Backend contract (routes, methods, auth, schemas) must come from Member 2.
// Until then, services fall back to clearly-labelled mock data.

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("Backend API base URL is not configured (VITE_API_BASE_URL).", 0);
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      `Network error while contacting backend: ${err instanceof Error ? err.message : String(err)}`,
      0,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    try {
      body = await response.json();
    } catch {
      throw new ApiError("Backend returned malformed JSON.", response.status);
    }
  } else {
    const text = await response.text();
    body = text.length ? text : null;
  }

  if (!response.ok) {
    const message =
      (typeof body === "object" && body !== null && "message" in body && typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : null) ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

export async function requestMultipart<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body: formData });
}

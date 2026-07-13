import { useAuthStore } from "@/stores/auth.store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    cursor?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // Get access token from auth store
  const accessToken = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Attach Authorization header if token exists
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - clear auth state
  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      error: { code: "NETWORK_ERROR", message: "Request failed" },
    }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export const REQUEST_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export type RequestMethod =
  (typeof REQUEST_METHODS)[keyof typeof REQUEST_METHODS];

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
} as const;

export interface RequestConfig {
  method: RequestMethod;
  url: string;
  data?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
}

export interface NetworkResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export const CONTENT_TYPES = {
  JSON: "application/json",
} as const;

export const getDefaultHeaders = (): Record<string, string> => ({
  "Content-Type": CONTENT_TYPES.JSON,
  Accept: CONTENT_TYPES.JSON,
});

export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers = getDefaultHeaders();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const combineUrls = (baseUrl: string, path: string): string => {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const route = path.startsWith("/") ? path : `/${path}`;
  return `${base}${route}`;
};

export const buildQueryString = (
  params: Record<string, string | number | boolean | null | undefined>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
import {
  RequestConfig,
  NetworkResponse,
  combineUrls,
  buildQueryString,
  getAuthHeaders,
  HTTP_STATUS,
} from "../utils/networking";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const REFRESH_ENDPOINT = "/api/tiktak/auth/refresh";

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }

  return BASE_URL.replace(/\/$/, "");
};

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch(combineUrls(getBaseUrl(), REFRESH_ENDPOINT), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Refresh token request failed");
  }

  const payload = await response.json();

  const accessToken =
    payload?.data?.access_token ||
    payload?.tokens?.access_token ||
    payload?.access_token;
  const nextRefreshToken =
    payload?.data?.refresh_token ||
    payload?.tokens?.refresh_token ||
    payload?.refresh_token;

  if (!accessToken || !nextRefreshToken) {
    throw new Error("Refresh response does not include tokens");
  }

  setTokens(accessToken, nextRefreshToken);

  return {
    access_token: accessToken as string,
    refresh_token: nextRefreshToken as string,
  };
};

const Fetcher = async <T = unknown>(
  config: RequestConfig,
): Promise<NetworkResponse<T>> => {
  const { method, url, data, params, headers = {} } = config;

  const fullUrl = url.startsWith("http") ? url : combineUrls(getBaseUrl(), url);
  const queryString = params ? buildQueryString(params) : "";
  const requestUrl = `${fullUrl}${queryString}`;

  const token = getAccessToken();
  const requestHeaders = {
    ...getAuthHeaders(token || undefined),
    ...headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (data && ["POST", "PUT", "PATCH"].includes(method)) {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(requestUrl, fetchOptions);
  const contentType = response.headers.get("content-type") || "";

  const responseData = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = {
      message: responseData?.message || responseData?.error || "Request failed",
      status: response.status,
      response: {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      },
    };

    if (response.status === HTTP_STATUS.UNAUTHORIZED && token) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken);

          const retryHeaders = {
            ...headers,
            ...getAuthHeaders(refreshed.access_token),
          };

          return Fetcher<T>({
            ...config,
            headers: retryHeaders,
          });
        } catch {
          clearTokens();
          throw error;
        }
      }

      clearTokens();
    }

    throw error;
  }

  return {
    data: responseData as T,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  };
};

export default Fetcher;

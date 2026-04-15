import { create } from "zustand";
import type { IAuthStore } from "./auth.types";
import {
  login as authLogin,
  signup as authSignup,
  refreshToken as authRefresh,
  logout as authLogout,
} from "@/services/api/auth.api";
import type { IAuthResponse } from "@/common/types/api.types";

type ErrorResponse = {
  response?: {
    data?: {
      message?: string | string[];
      error?: string;
    };
  };
  message?: string;
};

const getStoredToken = (key: "access_token" | "refresh_token") => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const initialBase = {
  loading: false,
  user: null,
  accessToken: getStoredToken("access_token"),
  refreshToken: getStoredToken("refresh_token"),
  isAuthenticated: !!getStoredToken("access_token"),
};

const parseErrorMessage = (error: unknown): string => {
  const err = error as ErrorResponse;
  const message = err?.response?.data?.message || err?.response?.data?.error || err?.message;

  if (!message) return "Bilinməyən xəta";
  return Array.isArray(message) ? message.join(", ") : message;
};

const pickAuthPayload = (res: IAuthResponse) => {
  if (res?.access_token && res?.refresh_token) {
    return {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      user: res.profile || res.user || null,
    };
  }

  if (res?.tokens?.access_token && res?.tokens?.refresh_token) {
    return {
      accessToken: res.tokens.access_token,
      refreshToken: res.tokens.refresh_token,
      user: res.profile || res.user || null,
    };
  }

  if (res?.data?.access_token && res?.data?.refresh_token) {
    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      user: res.data.profile || res.data.user || null,
    };
  }

  if (res?.data?.tokens?.access_token && res?.data?.tokens?.refresh_token) {
    return {
      accessToken: res.data.tokens.access_token,
      refreshToken: res.data.tokens.refresh_token,
      user: res.data.profile || res.data.user || null,
    };
  }

  return {
    accessToken: null,
    refreshToken: null,
    user: null,
  };
};

export const useAuthStore = create<IAuthStore>((set) => ({
  ...initialBase,
  actions: {
    setLoading: (loading) => set({ loading }),

    reset: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      set({
        ...initialBase,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },

    login: async (data, cb, errCb) => {
      set({ loading: true });
      try {
        const res = await authLogin(data);
        const parsed = pickAuthPayload(res);

        if (!parsed.accessToken || !parsed.refreshToken) {
          throw new Error("Token alina bilmedi");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", parsed.accessToken);
          localStorage.setItem("refresh_token", parsed.refreshToken);
        }

        set({
          loading: false,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          user: parsed.user,
          isAuthenticated: true,
        });

        cb?.();
      } catch (error) {
        console.error("Login xetasi:", parseErrorMessage(error));
        set({ loading: false });
        errCb?.(error);
      }
    },

    signup: async (data, cb, errCb) => {
      set({ loading: true });
      try {
        await authSignup(data);
        set({ loading: false });
        cb?.();
      } catch (error) {
        console.error("Signup xetasi:", parseErrorMessage(error));
        set({ loading: false });
        errCb?.(error);
      }
    },

    refreshToken: async (data, cb, errCb) => {
      set({ loading: true });
      try {
        const res = await authRefresh(data);
        const parsed = pickAuthPayload(res);

        if (!parsed.accessToken || !parsed.refreshToken) {
          throw new Error("Token yenilenmedi");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", parsed.accessToken);
          localStorage.setItem("refresh_token", parsed.refreshToken);
        }

        set({
          loading: false,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          isAuthenticated: true,
        });

        cb?.();
      } catch (error) {
        console.error("Refresh token xetasi:", parseErrorMessage(error));
        set({ loading: false });
        errCb?.(error);
      }
    },

    logout: async (cb) => {
      set({ loading: true });
      try {
        await authLogout();
      } catch {
        // Logout local reset should still run even if request fails.
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }

        set({
          loading: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        cb?.();
      }
    },
  },
}));
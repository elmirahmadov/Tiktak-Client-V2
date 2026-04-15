import { useAuthStore } from "./auth.store";
import type { IAuthStore } from "./auth.types";

export const useAuthActions = () =>
  useAuthStore((state: IAuthStore) => state.actions);

export const useAuth = () =>
  useAuthStore((state: IAuthStore) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
  }));

export { useAuthStore };
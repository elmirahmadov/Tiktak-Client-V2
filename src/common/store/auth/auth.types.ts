import type {
  ILoginRequest,
  ISignupRequest,
  IRefreshTokenRequest,
  IUser,
} from "@/common/types/api.types";

export interface IAuthStoreActions {
  setLoading: (loading: boolean) => void;
  reset: () => void;
  login: (
    data: ILoginRequest,
    cb?: () => void,
    err?: (err: unknown) => void
  ) => Promise<void>;
  signup: (
    data: ISignupRequest,
    cb?: () => void,
    err?: (err: unknown) => void
  ) => Promise<void>;
  refreshToken: (
    data: IRefreshTokenRequest,
    cb?: () => void,
    err?: (err: unknown) => void
  ) => Promise<void>;
  logout: (cb?: () => void) => Promise<void>;
}

export interface IAuthStore {
  loading: boolean;
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  actions: IAuthStoreActions;
}
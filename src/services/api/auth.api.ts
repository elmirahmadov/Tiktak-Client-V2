import {
  IAuthResponse,
  ILoginRequest,
  ISignupRequest,
  IRefreshTokenRequest,
} from "@/common/types/api.types";
import { API } from "../EndpointResources.g";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";

type AuthFetcherResponse = IAuthResponse | { data?: IAuthResponse };

const unwrapAuthResponse = (
  payload: AuthFetcherResponse | undefined,
): IAuthResponse => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const wrappedData = (payload as { data?: IAuthResponse }).data;

    if (wrappedData) {
      return wrappedData;
    }
  }

  if (payload) {
    return payload as IAuthResponse;
  }

  throw new Error("Auth response is empty");
};

export const login = async (data: ILoginRequest): Promise<IAuthResponse> => {
  const response = await Fetcher<AuthFetcherResponse>({
    method: REQUEST_METHODS.POST,
    url: API.auth.login,
    data,
  });

  return unwrapAuthResponse(response.data);
};

export const signup = async (data: ISignupRequest): Promise<IAuthResponse> => {
  const response = await Fetcher<AuthFetcherResponse>({
    method: REQUEST_METHODS.POST,
    url: API.auth.signup,
    data,
  });

  return unwrapAuthResponse(response.data);
};

export const refreshToken = async (
  data: IRefreshTokenRequest,
): Promise<IAuthResponse> => {
  const response = await Fetcher<AuthFetcherResponse>({
    method: REQUEST_METHODS.POST,
    url: API.auth.refresh,
    data,
  });

  return unwrapAuthResponse(response.data);
};

export const logout = async (): Promise<void> => {
  await Fetcher({
    method: REQUEST_METHODS.POST,
    url: API.auth.logout,
  });
};

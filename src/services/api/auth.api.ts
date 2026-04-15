import {
  IAuthResponse,
  ILoginRequest,
  ISignupRequest,
  IRefreshTokenRequest,
} from "@/common/types/api.types";
import { API } from "../EndpointResources.g";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";

export const login = async (data: ILoginRequest): Promise<IAuthResponse> => {
  const response = await Fetcher<IAuthResponse | { data: IAuthResponse }>({
    method: REQUEST_METHODS.POST,
    url: API.auth.login,
    data,
  });

  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return response.data.data;
  }

  return response.data as IAuthResponse;
};

export const signup = async (data: ISignupRequest): Promise<IAuthResponse> => {
  const response = await Fetcher<IAuthResponse | { data: IAuthResponse }>({
    method: REQUEST_METHODS.POST,
    url: API.auth.signup,
    data,
  });

  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return response.data.data;
  }

  return response.data as IAuthResponse;
};

export const refreshToken = async (
  data: IRefreshTokenRequest
): Promise<IAuthResponse> => {
  const response = await Fetcher<IAuthResponse | { data: IAuthResponse }>({
    method: REQUEST_METHODS.POST,
    url: API.auth.refresh,
    data,
  });

  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return response.data.data;
  }

  return response.data as IAuthResponse;
};

export const logout = async (): Promise<void> => {
  await Fetcher({
    method: REQUEST_METHODS.POST,
    url: API.auth.logout,
  });
};
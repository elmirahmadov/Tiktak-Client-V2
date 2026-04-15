import type { IProfileUpdateRequest, IUser } from "@/common/types/api.types";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";
import { API } from "../EndpointResources.g";

type ProfilePayload =
  | IUser
  | {
      data?: IUser;
      message?: string;
      result?: boolean;
    };

const extractProfile = (payload: ProfilePayload): IUser | null => {
  if (payload && typeof payload === "object" && "id" in payload) {
    return payload as IUser;
  }

  if (payload && typeof payload === "object" && payload.data) {
    return payload.data;
  }

  return null;
};

export const getProfile = async (): Promise<IUser | null> => {
  const response = await Fetcher<ProfilePayload>({
    method: REQUEST_METHODS.GET,
    url: API.client.profile,
  });

  return extractProfile(response.data);
};

export const updateProfile = async (
  data: IProfileUpdateRequest,
): Promise<IUser | null> => {
  const response = await Fetcher<ProfilePayload>({
    method: REQUEST_METHODS.PUT,
    url: API.client.profile,
    data,
  });

  return extractProfile(response.data);
};

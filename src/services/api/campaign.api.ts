import type { ICampaign } from "@/common/types/api.types";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";
import { API } from "../EndpointResources.g";

export const getAllCampaigns = async (): Promise<ICampaign[]> => {
  const response = await Fetcher<ICampaign[] | { data: ICampaign[] }>({
    method: REQUEST_METHODS.GET,
    url: API.campaign.list,
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  return [];
};

import type { IProduct } from "@/common/types/api.types";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";
import { API } from "../EndpointResources.g";

function normalizeProducts(payload: unknown): IProduct[] {
  if (Array.isArray(payload)) {
    return payload as IProduct[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const dataNode = (payload as { data?: unknown }).data;
  if (Array.isArray(dataNode)) {
    return dataNode as IProduct[];
  }

  if (dataNode && typeof dataNode === "object") {
    const nestedItems = (dataNode as { products?: unknown }).products;
    if (Array.isArray(nestedItems)) {
      return nestedItems as IProduct[];
    }
  }

  return [];
}

export const fetchAllProducts = async (): Promise<IProduct[]> => {
  const response = await Fetcher<unknown>({
    method: REQUEST_METHODS.GET,
    url: API.products.list,
  });

  return normalizeProducts(response.data);
};

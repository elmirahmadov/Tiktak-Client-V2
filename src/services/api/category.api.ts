import type { ICategory } from "@/common/types/api.types";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";
import { API } from "../EndpointResources.g";

function normalizeCategoryResponse(payload: unknown): ICategory[] {
  if (Array.isArray(payload)) {
    return payload as ICategory[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const dataNode = (payload as { data?: unknown }).data;

  if (Array.isArray(dataNode)) {
    return dataNode as ICategory[];
  }

  if (dataNode && typeof dataNode === "object") {
    const nestedList = (dataNode as { categories?: unknown }).categories;
    if (Array.isArray(nestedList)) {
      return nestedList as ICategory[];
    }
  }

  return [];
}

export const fetchAllCategories = async (): Promise<ICategory[]> => {
  const response = await Fetcher<unknown>({
    method: REQUEST_METHODS.GET,
    url: API.category.list,
  });

  return normalizeCategoryResponse(response.data);
};

import type { IBasket } from "@/common/types/api.types";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";
import { API } from "../EndpointResources.g";

type BasketPayload =
	| IBasket
	| {
			data?: IBasket;
			message?: string;
			result?: boolean;
		};

type BasketMutationPayload = {
	quantity?: number;
	productId?: string;
};

const normalizeBasket = (payload: BasketPayload): IBasket => {
	if (payload && typeof payload === "object" && "items" in payload) {
		return payload as IBasket;
	}

	if (payload && typeof payload === "object" && payload.data) {
		return payload.data;
	}

	return { items: [] };
};

export const getBasket = async (): Promise<IBasket> => {
	const response = await Fetcher<BasketPayload>({
		method: REQUEST_METHODS.GET,
		url: API.products.basket.get,
	});

	return normalizeBasket(response.data);
};

export const addToBasket = async (
	productId: number,
	data?: BasketMutationPayload
): Promise<IBasket> => {
	const response = await Fetcher<BasketPayload>({
		method: REQUEST_METHODS.POST,
		url: API.products.basket.add(productId),
		data: data || { quantity: 1, productId: String(productId) },
	});

	return normalizeBasket(response.data);
};

export const decreaseFromBasket = async (
	productId: number,
	data?: BasketMutationPayload
): Promise<IBasket> => {
	const response = await Fetcher<BasketPayload>({
		method: REQUEST_METHODS.POST,
		url: API.products.basket.remove(productId),
		data: data || { quantity: 1, productId: String(productId) },
	});

	return normalizeBasket(response.data);
};

export const removeAllFromBasket = async (productId: number): Promise<IBasket> => {
	const response = await Fetcher<BasketPayload>({
		method: REQUEST_METHODS.DELETE,
		url: API.products.basket.removeAll(productId),
	});

	return normalizeBasket(response.data);
};

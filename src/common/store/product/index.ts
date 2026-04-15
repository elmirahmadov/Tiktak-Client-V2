import { useProductStore } from "./product.store";
import type { IProductStore } from "./product.types";

export const useProductActions = () =>
  useProductStore((state: IProductStore) => state.actions);

export const useProductList = () =>
  useProductStore((state: IProductStore) => state.products);

export const useProductLoading = () =>
  useProductStore((state: IProductStore) => state.loading);

export const useProductError = () =>
  useProductStore((state: IProductStore) => state.error);

export { useProductStore };

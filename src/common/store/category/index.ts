import { useCategoryStore } from "./category.store";
import type { ICategoryStore } from "./category.types";

export const useCategoryActions = () =>
  useCategoryStore((state: ICategoryStore) => state.actions);

export const useCategoryList = () =>
  useCategoryStore((state: ICategoryStore) => state.categories);

export const useCategoryLoading = () =>
  useCategoryStore((state: ICategoryStore) => state.loading);

export const useCategoryError = () =>
  useCategoryStore((state: ICategoryStore) => state.error);

export { useCategoryStore };

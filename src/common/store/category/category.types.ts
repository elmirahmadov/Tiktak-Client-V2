import type { ICategory } from "@/common/types/api.types";

export interface ICategoryStoreActions {
  setLoading: (loading: boolean) => void;
  reset: () => void;
  fetchCategories: (errCb?: (err: unknown) => void) => Promise<void>;
}

export interface ICategoryStore {
  loading: boolean;
  error: string | null;
  categories: ICategory[];
  actions: ICategoryStoreActions;
}

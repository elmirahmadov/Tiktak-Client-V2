import type { IProduct } from "@/common/types/api.types";

export interface IProductStoreActions {
  setLoading: (loading: boolean) => void;
  reset: () => void;
  fetchProducts: (errCb?: (err: unknown) => void) => Promise<void>;
}

export interface IProductStore {
  loading: boolean;
  error: string | null;
  products: IProduct[];
  actions: IProductStoreActions;
}

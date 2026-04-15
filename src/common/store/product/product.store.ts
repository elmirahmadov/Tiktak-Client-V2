import { create } from "zustand";
import type { IProductStore } from "./product.types";
import { fetchAllProducts } from "@/services/api/products.api";

const initial: Omit<IProductStore, "actions"> = {
  loading: false,
  error: null,
  products: [],
};

export const useProductStore = create<IProductStore>((set) => ({
  ...initial,
  actions: {
    setLoading: (loading) => set({ loading }),

    reset: () => set({ ...initial }),

    fetchProducts: async (errCb) => {
      set({ loading: true, error: null });

      try {
        const products = await fetchAllProducts();
        set({ products, loading: false, error: null });
      } catch (error) {
        errCb?.(error);
        set({ products: [], loading: false, error: "Mehsullar yuklenmedi." });
      }
    },
  },
}));

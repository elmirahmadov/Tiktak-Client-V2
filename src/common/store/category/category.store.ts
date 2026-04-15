import { create } from "zustand";
import type { ICategoryStore } from "./category.types";
import { fetchAllCategories } from "@/services/api/category.api";

const initial: Omit<ICategoryStore, "actions"> = {
  loading: false,
  error: null,
  categories: [],
};

export const useCategoryStore = create<ICategoryStore>((set) => ({
  ...initial,
  actions: {
    setLoading: (loading) => set({ loading }),

    reset: () => set({ ...initial }),

    fetchCategories: async (errCb) => {
      set({ loading: true });

      try {
        const categories = await fetchAllCategories();
        set({ categories, loading: false, error: null });
      } catch (error) {
        console.error("Category fetch xetasi:", error);
        errCb?.(error);
        const status =
          typeof error === "object" && error !== null && "status" in error
            ? Number((error as { status?: number }).status)
            : undefined;

        set({
          loading: false,
          categories: initial.categories,
          error:
            status === 401
              ? "Kateqoriyalari gormek ucun once giris edin."
              : "Kateqoriyalar yüklənərkən xəta baş verdi.",
        });
      }
    },
  },
}));

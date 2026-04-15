import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IProduct } from "@/common/types/api.types";

interface IFavouritesStore {
  items: IProduct[];
  addFavourite: (product: IProduct) => void;
  removeFavourite: (id: number) => void;
  isFavourite: (id: number) => boolean;
}

export const useFavouritesStore = create<IFavouritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addFavourite: (product) =>
        set((state) => {
          if (state.items.some((p) => p.id === product.id)) return state;
          return { items: [...state.items, product] };
        }),

      removeFavourite: (id) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== id),
        })),

      isFavourite: (id) => get().items.some((p) => p.id === id),
    }),
    {
      name: "tiktak-favourites",
    },
  ),
);

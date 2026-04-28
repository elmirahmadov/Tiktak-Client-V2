"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
          if (state.items.some((p) => String(p.id) === String(product.id))) {
            return state;
          }

          return { items: [...state.items, product] };
        }),

      removeFavourite: (id) =>
        set((state) => ({
          items: state.items.filter((p) => String(p.id) !== String(id)),
        })),

      isFavourite: (id) => get().items.some((p) => String(p.id) === String(id)),
    }),
    {
      name: "tiktak-favourites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

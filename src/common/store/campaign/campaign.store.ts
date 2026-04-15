import { create } from "zustand";
import type { ICampaignStore } from "./campaign.types";
import { getAllCampaigns as getAllCampaignsApi } from "@/services/api/campaign.api";

const initial: Omit<ICampaignStore, "actions"> = {
  loading: false,
  campaigns: [],
};

export const useCampaignStore = create<ICampaignStore>((set) => ({
  ...initial,
  actions: {
    setLoading: (loading) => set({ loading }),

    reset: () => set({ ...initial }),

    getAllCampaigns: async (errCb) => {
      set({ loading: true });

      try {
        const campaigns = await getAllCampaignsApi();

        set({
          campaigns,
          loading: false,
        });
      } catch (error) {
        console.error("Campaign fetch xetasi:", error);
        errCb?.(error);
        set({ loading: false, campaigns: [] });
      }
    },
  },
}));

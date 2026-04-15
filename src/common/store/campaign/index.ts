import { useCampaignStore } from "./campaign.store";
import type { ICampaignStore } from "./campaign.types";

export const useCampaignActions = () =>
  useCampaignStore((state: ICampaignStore) => state.actions);

export const useCampaigns = () =>
  useCampaignStore((state: ICampaignStore) => ({
    campaigns: state.campaigns,
    loading: state.loading,
  }));

export { useCampaignStore };

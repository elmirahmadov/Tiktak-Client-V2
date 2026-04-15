import type { ICampaign } from "@/common/types/api.types";

export interface ICampaignStoreActions {
  setLoading: (loading: boolean) => void;
  reset: () => void;
  getAllCampaigns: (errCb?: (err: unknown) => void) => Promise<void>;
}

export interface ICampaignStore {
  loading: boolean;
  campaigns: ICampaign[];
  actions: ICampaignStoreActions;
}

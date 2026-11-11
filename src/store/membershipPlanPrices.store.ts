/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type {
  TierItem,
  UpdateMembershipPlanPricesPayload,
} from "../api/membershipPlanPrices/membershipPlanPrices.types";
import {
  getMembershipPlanPricesApi,
  updateMembershipPlanPricesApi,
} from "../api/membershipPlanPrices/membershipPlanPricesApi";
import { formatLocalDateTime } from "../utility/dayjs";

interface MembershipPlanPricesState {
  tiers: TierItem[];
  loading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastPublishedAt: string | null;
  fetchPrices: () => Promise<TierItem[]>;
  updatePrices: (payload: UpdateMembershipPlanPricesPayload) => Promise<any>;
  setTiers: (tiers: TierItem[]) => void;
  setError: (error: string | null) => void;
  setLastPublishedAt: (time: string | null) => void;
}

export const useMembershipPlanPricesStore = create<MembershipPlanPricesState>(
  (set) => ({
    tiers: [],
    loading: false,
    isUpdating: false,
    error: null,
    lastPublishedAt: null,

    fetchPrices: async () => {
      set({ loading: true, error: null });
      try {
        const tiers = await getMembershipPlanPricesApi();
        set({ tiers, loading: false });
        return tiers;
      } catch (err: any) {
        set({
          error: err.message || "Failed to fetch membership plan prices",
          loading: false,
        });
        throw err;
      }
    },

    updatePrices: async (payload: UpdateMembershipPlanPricesPayload) => {
      set({ isUpdating: true, error: null });
      try {
        const response = await updateMembershipPlanPricesApi(payload);
        const timestamp = formatLocalDateTime(new Date(), "D MMM YYYY, hh:mm A");
        set({
          isUpdating: false,
          lastPublishedAt: timestamp,
        });
        return response;
      } catch (err: any) {
        set({
          error: err.message || "Failed to update membership plan prices",
          isUpdating: false,
        });
        throw err;
      }
    },

    setTiers: (tiers: TierItem[]) => set({ tiers }),
    setError: (error: string | null) => set({ error }),
    setLastPublishedAt: (lastPublishedAt: string | null) =>
      set({ lastPublishedAt }),
  }),
);

export default useMembershipPlanPricesStore;

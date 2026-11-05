/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../apiInstance";
import { EndPoints } from "../endpoints";
import { useAuthStore } from "../../store/auth.store";
import type {
  MembershipPlanPricesResponse,
  TierItem,
  UpdateMembershipPlanPricesPayload,
} from "./membershipPlanPrices.types";

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * GET /api/membership-plan-prices
 * Retrieves the network-wide membership tiers and plan pricing.
 */
export const getMembershipPlanPricesApi = async (): Promise<TierItem[]> => {
  try {
    const response = await api.get<
      | MembershipPlanPricesResponse
      | { data: MembershipPlanPricesResponse }
      | { data: TierItem[] }
      | any
    >(EndPoints.membershipPlanPrices, {
      headers: getAuthHeaders(),
    });

    const res = response.data;
    if (Array.isArray(res?.tiers)) {
      return res.tiers;
    }
    if (Array.isArray(res?.data?.tiers)) {
      return res.data.tiers;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }

    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch membership plan prices",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching membership plan prices",
    );
  }
};

/**
 * PUT /api/membership-plan-prices
 * Updates the network-wide membership tiers and plan pricing with edited fields only.
 */
export const updateMembershipPlanPricesApi = async (
  payload: UpdateMembershipPlanPricesPayload,
): Promise<any> => {
  try {
    const response = await api.put(EndPoints.membershipPlanPrices, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update membership plan prices",
      );
    }
    throw new Error(
      "An unexpected error occurred while updating membership plan prices",
    );
  }
};

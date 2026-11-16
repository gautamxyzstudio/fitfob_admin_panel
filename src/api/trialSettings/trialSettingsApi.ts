/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../apiInstance";
import { EndPoints } from "../endpoints";
import { useAuthStore } from "../../store/auth.store";
import type {
  TrialSettings,
  TrialSettingsResponse,
  UpdateTrialSettingsPayload,
} from "./trialSettings.types";

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * GET /api/trial-settings/:clubOwnerDocumentId
 * Fetches trial settings for a specific club owner.
 */
export const getTrialSettingsApi = async (
  clubOwnerDocumentId: string,
): Promise<TrialSettings> => {
  try {
    const response = await api.get<TrialSettingsResponse | any>(
      EndPoints.trialSettings(clubOwnerDocumentId),
      {
        headers: getAuthHeaders(),
      },
    );

    const raw = response.data?.data || response.data;
    if (!raw) {
      return {
        isTrialEnabled: false,
        dailyTrialLimit: 6,
      };
    }

    return {
      isTrialEnabled: Boolean(raw.isTrialEnabled),
      dailyTrialLimit:
        typeof raw.dailyTrialLimit === "number" ? raw.dailyTrialLimit : 6,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        // Return sensible default if not yet created on backend
        return {
          isTrialEnabled: false,
          dailyTrialLimit: 6,
        };
      }
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch trial settings",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching trial settings",
    );
  }
};

/**
 * PUT /api/trial-settings/:clubOwnerDocumentId
 * Updates trial settings for a specific club owner.
 */
export const updateTrialSettingsApi = async (
  clubOwnerDocumentId: string,
  payload: UpdateTrialSettingsPayload,
): Promise<TrialSettings> => {
  try {
    const response = await api.put(
      EndPoints.trialSettings(clubOwnerDocumentId),
      payload,
      {
        headers: getAuthHeaders(),
      },
    );

    const raw = response.data?.data || response.data;
    return {
      isTrialEnabled: Boolean(raw?.isTrialEnabled ?? payload.isTrialEnabled),
      dailyTrialLimit:
        typeof raw?.dailyTrialLimit === "number"
          ? raw.dailyTrialLimit
          : payload.dailyTrialLimit,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update trial settings",
      );
    }
    throw new Error(
      "An unexpected error occurred while updating trial settings",
    );
  }
};

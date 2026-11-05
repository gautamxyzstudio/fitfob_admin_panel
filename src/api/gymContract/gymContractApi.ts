/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../apiInstance";
import { EndPoints } from "../endpoints";
import { useAuthStore } from "../../store/auth.store";
import type {
  GymContractResponse,
  GymContractResponseData,
  UpdateGymContractPayload,
} from "./gymContract.types";

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * GET /api/gym-contract/:documentId
 * Fetches contract tier, zero commission deal and plans for a specific club.
 */
export const getGymContractApi = async (
  documentId: string,
): Promise<GymContractResponseData> => {
  try {
    const response = await api.get<
      GymContractResponse | { data: GymContractResponseData } | any
    >(EndPoints.gymContract(documentId), {
      headers: getAuthHeaders(),
    });

    const data = response.data?.data || response.data;
    if (!data) {
      throw new Error("Invalid gym contract response");
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch gym contract",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching gym contract",
    );
  }
};

/**
 * PUT /api/gym-contract/:documentId
 * Updates only the edited fields of the gym contract.
 */
export const updateGymContractApi = async (
  documentId: string,
  payload: UpdateGymContractPayload,
): Promise<any> => {
  try {
    const response = await api.put(
      EndPoints.gymContract(documentId),
      payload,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update gym contract",
      );
    }
    throw new Error(
      "An unexpected error occurred while updating gym contract",
    );
  }
};

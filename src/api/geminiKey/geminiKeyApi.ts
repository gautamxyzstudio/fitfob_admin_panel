import axios from "axios";
import api from "../apiInstance";
import { EndPoints } from "../endpoints";
import { useAuthStore } from "../../store/auth.store";
import type {
  GeminiKeyData,
  GeminiKeyPayload,
  GeminiKeyResponse,
} from "./geminiKey.types";

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * 1. FIND (GET /api/gemini-key)
 */
export const getGeminiKeyApi = async (): Promise<GeminiKeyData | null> => {
  try {
    const response = await api.get<GeminiKeyResponse>(EndPoints.geminiKey, {
      headers: getAuthHeaders(),
    });
    return response.data?.data || null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch Gemini key",
      );
    }
    throw new Error("An unexpected error occurred while fetching Gemini key");
  }
};

/**
 * 2. UPDATE / REPLACE (PUT /api/gemini-key)
 * Payload format: { data: { key: string, isActive?: boolean } }
 */
export const updateGeminiKeyApi = async (
  payloadData: { key?: string; isActive?: boolean },
): Promise<GeminiKeyData> => {
  const payload: GeminiKeyPayload = {
    data: payloadData,
  };

  try {
    const response = await api.put<GeminiKeyResponse>(
      EndPoints.geminiKey,
      payload,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.data?.data) {
      throw new Error("Invalid response format from server");
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update Gemini key",
      );
    }
    throw new Error("An unexpected error occurred while updating Gemini key");
  }
};

/**
 * 3. DELETE (DELETE /api/gemini-key)
 */
export const deleteGeminiKeyApi = async (): Promise<any> => {
  try {
    const response = await api.delete(EndPoints.geminiKey, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to delete Gemini key",
      );
    }
    throw new Error("An unexpected error occurred while deleting Gemini key");
  }
};

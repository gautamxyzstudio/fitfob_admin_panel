/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { EndPoints } from "../endpoints";
import api from "../apiInstance";
import { useAuthStore } from "../../store/auth.store";
import type {
  ClientDetailResponse,
  ClientListItem,
  UpdateClientPayload,
} from "./client.types";

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Fetch list of clients
 * GET /api/client-details
 */
export const getClientListApi = async (): Promise<ClientListItem[]> => {
  try {
    const response = await api.get(EndPoints.clientDetails, {
      headers: getAuthHeaders(),
    });

    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch clients",
      );
    }
    throw new Error("An unexpected error occurred while fetching clients");
  }
};

/**
 * Fetch single client details by documentId
 * GET /api/client-details/{docId}
 */
export const getClientDetailApi = async (
  docId: string,
): Promise<ClientDetailResponse> => {
  try {
    const response = await api.get(EndPoints.clientDetailByDocId(docId), {
      headers: getAuthHeaders(),
    });

    const data = response.data?.data ? response.data.data : response.data;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch client details",
      );
    }
    throw new Error("An unexpected error occurred while fetching client details");
  }
};

/**
 * Update client details by documentId
 * PUT /api/client-details/{docId}
 */
export const updateClientDetailApi = async (
  docId: string,
  payload: UpdateClientPayload,
): Promise<ClientDetailResponse> => {
  try {
    // Strapi 5 format expects { data: ... }
    const response = await api.put(
      EndPoints.clientDetailByDocId(docId),
      { data: payload },
      {
        headers: getAuthHeaders(),
      },
    );

    const data = response.data?.data ? response.data.data : response.data;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update client details",
      );
    }
    throw new Error("An unexpected error occurred while updating client details");
  }
};

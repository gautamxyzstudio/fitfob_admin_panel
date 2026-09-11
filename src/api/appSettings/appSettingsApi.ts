/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BASE_URL, EndPoints } from "../endpoints";
import api from "../apiInstance";
import { useAuthStore } from "../../store/auth.store";
import type {
  FacilityOrClubTypeItem,
  FacilityOrClubTypePayload,
  UploadFileResponse,
} from "./appSettings.types";

const getAuthHeaders = (contentType: string = "application/json") => {
  const { token } = useAuthStore.getState();
  return {
    Authorization: `Bearer ${token}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
};

// ==================== FACILITIES ====================

export const getFacilitiesApi = async (): Promise<FacilityOrClubTypeItem[]> => {
  try {
    const response = await api.get(EndPoints.clubFacilities, {
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
          "Failed to fetch facilities",
      );
    }
    throw new Error("An unexpected error occurred while fetching facilities");
  }
};

export const createFacilityApi = async (
  payload: FacilityOrClubTypePayload,
): Promise<any> => {
  try {
    const response = await api.post(EndPoints.clubFacilities, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to create facility",
      );
    }
    throw new Error("An unexpected error occurred while creating facility");
  }
};

export const updateFacilityApi = async (
  docId: string,
  payload: Partial<FacilityOrClubTypePayload>,
): Promise<any> => {
  try {
    const response = await api.put(EndPoints.clubFacilityById(docId), payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update facility",
      );
    }
    throw new Error("An unexpected error occurred while updating facility");
  }
};

export const deleteFacilityApi = async (docId: string): Promise<any> => {
  try {
    const response = await api.delete(EndPoints.clubFacilityById(docId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to delete facility",
      );
    }
    throw new Error("An unexpected error occurred while deleting facility");
  }
};

// ==================== CLUB SERVICES (CLUB TYPES) ====================

export const getClubTypesApi = async (): Promise<FacilityOrClubTypeItem[]> => {
  try {
    const response = await api.get(EndPoints.clubServices, {
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
          "Failed to fetch club types",
      );
    }
    throw new Error("An unexpected error occurred while fetching club types");
  }
};

export const createClubTypeApi = async (
  payload: FacilityOrClubTypePayload,
): Promise<any> => {
  try {
    const response = await api.post(EndPoints.clubServices, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to create club type",
      );
    }
    throw new Error("An unexpected error occurred while creating club type");
  }
};

export const updateClubTypeApi = async (
  docId: string,
  payload: Partial<FacilityOrClubTypePayload>,
): Promise<any> => {
  try {
    const response = await api.put(EndPoints.clubServiceById(docId), payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update club type",
      );
    }
    throw new Error("An unexpected error occurred while updating club type");
  }
};

export const deleteClubTypeApi = async (docId: string): Promise<any> => {
  try {
    const response = await api.delete(EndPoints.clubServiceById(docId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to delete club type",
      );
    }
    throw new Error("An unexpected error occurred while deleting club type");
  }
};

// ==================== MEDIA UPLOAD ====================

export const uploadFileApi = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append("files", file);

  try {
    const response = await api.post(EndPoints.upload, formData, {
      headers: {
        ...getAuthHeaders(""),
        // Let browser set boundary automatically for FormData
        "Content-Type": "multipart/form-data",
      },
    });

    const uploaded = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    if (!uploaded || !uploaded.id) {
      throw new Error("Upload response did not contain file ID");
    }

    const rawUrl = uploaded.url || "";
    const fullUrl =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `${BASE_URL}${rawUrl}`;

    return {
      id: uploaded.id,
      url: fullUrl,
      name: uploaded.name,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to upload file",
      );
    }
    throw new Error("An unexpected error occurred during file upload");
  }
};

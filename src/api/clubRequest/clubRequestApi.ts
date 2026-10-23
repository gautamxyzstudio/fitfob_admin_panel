/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { EndPoints } from "../endpoints";
import api from "../apiInstance";
import { useAuthStore } from "../../store/auth.store";
import type {
  ClubListResponse,
  ClubOwnerActivityLog,
  ClubResponse,
} from "./clubRequest.types";

export const unverifiedOwnersApi = async (
  search: string,
  status?: string,
): Promise<ClubListResponse> => {
  const { token } = useAuthStore.getState();

  try {
    const response = await api.get(EndPoints.unverifiedClubOwners(search, status), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const verifiedOwnersApi = async (
  search: string,
): Promise<ClubListResponse> => {
  const { token } = useAuthStore.getState();
  try {
    const response = await api.get(EndPoints.verifiedClubOwners(search), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getClubOwnerById = async (
  ownerId: number,
): Promise<ClubResponse> => {
  const { token } = useAuthStore.getState();
  try {
    const response = await api.get(EndPoints.getClubOwner(ownerId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data) {
      return response.data?.data ? response.data.data : response.data;
    }
  } catch (error) {
    // If not a 404, rethrow error. If 404, proceed to pending fallback below.
    if (axios.isAxiosError(error) && error.response?.status !== 404) {
      throw new Error(
        error.response?.data?.error?.message || "An error occurred",
      );
    }
  }

  try {
    const pendingResponse = await api.get(
      EndPoints.getPendingClubOwner(ownerId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return pendingResponse.data?.data
      ? pendingResponse.data.data
      : pendingResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message || "Club owner not found",
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const verifyApproval = async (userId: number): Promise<any> => {
  const { token } = useAuthStore.getState();
  try {
    const response = await api.post(EndPoints.verifyApproval(userId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const rejectApproval = async (
  userId: number,
  reason: string,
): Promise<any> => {
  const { token } = useAuthStore.getState();
  try {
    const response = await api.post(
      EndPoints.rejectApproval(userId),
      {
        rejection_reason: reason,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateClubOwner = async (
  ownerId: number,
  payload: { data: any },
): Promise<ClubResponse> => {
  const { token } = useAuthStore.getState();

  try {
    const response = await api.put(EndPoints.getClubOwner(ownerId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data) {
      return response.data?.data ? response.data.data : response.data;
    }
  } catch (error) {
    // If not a 404, rethrow error. If 404, proceed to pending fallback below.
    if (axios.isAxiosError(error) && error.response?.status !== 404) {
      throw new Error(
        error.response?.data?.error?.message || "An error occurred",
      );
    }
  }

  try {
    const pendingResponse = await api.put(
      EndPoints.updatePendingClubOwner(ownerId),
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return pendingResponse.data?.data
      ? pendingResponse.data.data
      : pendingResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message || "Club owner not found",
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getClubOwnerActivityLogsApi = async (
  documentId: string,
): Promise<ClubOwnerActivityLog[]> => {
  const { token } = useAuthStore.getState();
  try {
    const response = await api.get(EndPoints.clubOwnerActivityLogs(documentId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message || "Failed to fetch activity logs",
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

/**
 * Toggle push notifications for club owner / user
 * PUT/POST /api/toggle-send-noyifications/:documentId
 */
export const toggleSendNotificationsApi = async (
  documentId: string,
): Promise<{
  message: string;
  data: any;
}> => {
  const { token } = useAuthStore.getState();
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await api.put(
      EndPoints.toggleSendNotifications(documentId),
      {},
      { headers },
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 405 || error.response?.status === 404) {
      try {
        const postRes = await api.post(
          EndPoints.toggleSendNotifications(documentId),
          {},
          { headers },
        );
        return postRes.data;
      } catch (postErr: any) {
        if (postErr.response?.status === 404) {
          const fallbackUrl = EndPoints.toggleSendNotifications(
            documentId,
          ).replace("toggle-send-noyifications", "toggle-send-notifications");
          try {
            const putRes = await api.put(fallbackUrl, {}, { headers });
            return putRes.data;
          } catch {
            const postRes2 = await api.post(fallbackUrl, {}, { headers });
            return postRes2.data;
          }
        }
        throw postErr;
      }
    }
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to toggle push notifications",
      );
    }
    throw error;
  }
};


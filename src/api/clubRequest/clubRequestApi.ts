/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { EndPoints } from "../endpoints";
import api from "../apiInstance";
import { useAuthStore } from "../../store/auth.store";
import type { ClubListResponse, ClubResponse } from "./clubRequest.types";

export const unverifiedOwnersApi = async (
  search: string,
): Promise<ClubListResponse> => {
  const { token } = useAuthStore.getState();

  try {
    const response = await api.get(EndPoints.unverifiedClubOwners(search), {
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
      return response.data;
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
    return pendingResponse.data;
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
      return response.data;
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
    return pendingResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message || "Club owner not found",
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

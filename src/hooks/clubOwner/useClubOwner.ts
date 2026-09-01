/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClubOwnerById,
  rejectApproval,
  unverifiedOwnersApi,
  updateClubOwner,
  verifiedOwnersApi,
  verifyApproval,
} from "../../api/clubRequest/clubRequestApi";
import type {
  ClubListResponse,
  ClubResponse,
} from "../../api/clubRequest/clubRequest.types";

// 🔹 Fetch Unverified Club Owners (useQuery)
export const useUnverifiedOwners = (search: string = "") => {
  const { data, isLoading, isFetching, error, refetch } =
    useQuery<ClubListResponse>({
      queryKey: ["unverifiedOwners", search],
      queryFn: () => unverifiedOwnersApi(search),
    });

  return {
    unverifiedOwners: data || [],
    loading: isLoading || isFetching,
    error: error ? (error as Error).message : null,
    fetchUnverifiedOwners: () => refetch(),
    refetch,
  };
};

// 🔹 Fetch Verified Club Owners (useQuery)
export const useVerifiedOwners = (search: string = "") => {
  const { data, isLoading, isFetching, error, refetch } =
    useQuery<ClubListResponse>({
      queryKey: ["verifiedOwners", search],
      queryFn: () => verifiedOwnersApi(search),
    });

  return {
    verifiedOwners: data || [],
    loading: isLoading || isFetching,
    error: error ? (error as Error).message : null,
    fetchVerifiedOwners: () => refetch(),
    refetch,
  };
};

// 🔹 Fetch Single Club Owner Details (useQuery)
export const useClubOwnerDetails = (ownerId: number) => {
  const { data, isLoading, error, refetch } = useQuery<ClubResponse>({
    queryKey: ["clubOwnerDetails", ownerId],
    queryFn: () => getClubOwnerById(ownerId),
    enabled: Boolean(ownerId),
  });

  return {
    selectedOwner: data || null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

// 🔹 Update Club Owner Data (useMutation)
export const useUpdateClubOwner = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      ownerId,
      payload,
    }: {
      ownerId: number;
      payload: { data: any };
    }) => updateClubOwner(ownerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["clubOwnerDetails", variables.ownerId],
      });
      queryClient.invalidateQueries({ queryKey: ["unverifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedOwners"] });
    },
  });

  return {
    updateClubOwner: (ownerId: number, payload: { data: any }) =>
      mutation.mutateAsync({ ownerId, payload }),
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
};

// 🔹 Verify / Approve Club Request (useMutation)
export const useVerifyApproval = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userId: number) => verifyApproval(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unverifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["clubOwnerDetails"] });
    },
  });

  return {
    verifyApproval: (userId: number) => mutation.mutateAsync(userId),
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
};

export const useRejectApproval = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) =>
      rejectApproval(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unverifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["clubOwnerDetails"] });
    },
  });

  return {
    rejectApproval: (userId: number, reason: string) =>
      mutation.mutateAsync({ userId, reason }),
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
};

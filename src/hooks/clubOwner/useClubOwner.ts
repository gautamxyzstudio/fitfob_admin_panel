/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getClubOwnerActivityLogsApi,
  getClubOwnerById,
  rejectApproval,
  toggleSendNotificationsApi,
  unverifiedOwnersApi,
  updateClubOwner,
  verifiedOwnersApi,
  verifyApproval,
} from "../../api/clubRequest/clubRequestApi";
import type {
  ClubListResponse,
  ClubOwnerActivityLog,
  ClubResponse,
} from "../../api/clubRequest/clubRequest.types";

// 🔹 Fetch Unverified Club Owners (useQuery)
export function useUnverifiedOwners<TData = ClubListResponse>(
  search?: string,
  status?: string,
  options?: Omit<
    UseQueryOptions<ClubListResponse, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  const query = useQuery<ClubListResponse, Error, TData, any>({
    queryKey: ["unverifiedOwners", search, status],
    queryFn: () => unverifiedOwnersApi(search, status),
    placeholderData: keepPreviousData,
    ...options,
  });

  const unverifiedOwners: TData = (query.data ?? []) as unknown as TData;

  return {
    ...query,
    unverifiedOwners,
    loading: query.isLoading || query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    fetchUnverifiedOwners: () => query.refetch(),
    refetch: query.refetch,
  };
}

// 🔹 Fetch Verified Club Owners (useQuery)
export function useVerifiedOwners<TData = ClubListResponse>(
  search: string = "",
  options?: Omit<
    UseQueryOptions<ClubListResponse, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  const query = useQuery<ClubListResponse, Error, TData, any>({
    queryKey: ["verifiedOwners", search],
    queryFn: () => verifiedOwnersApi(search),
    placeholderData: keepPreviousData,
    ...options,
  });

  const verifiedOwners: TData = (query.data ?? []) as unknown as TData;

  return {
    ...query,
    verifiedOwners,
    loading: query.isLoading || query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    fetchVerifiedOwners: () => query.refetch(),
    refetch: query.refetch,
  };
}

// 🔹 Fetch Single Club Owner Details (useQuery)
export function useClubOwnerDetails<TData = ClubResponse>(
  ownerId: number,
  options?: Omit<
    UseQueryOptions<ClubResponse, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  const query = useQuery<ClubResponse, Error, TData, any>({
    queryKey: ["clubOwnerDetails", ownerId],
    queryFn: () => getClubOwnerById(ownerId),
    enabled: Boolean(ownerId),
    refetchInterval: 20000,
    placeholderData: keepPreviousData,
    ...options,
  });

  const selectedOwner: TData | null = (query.data ??
    null) as unknown as TData | null;

  return {
    ...query,
    selectedOwner,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

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

// 🔹 Fetch Club Owner Activity Logs by documentId (useQuery)
export function useClubOwnerActivityLogs<TData = ClubOwnerActivityLog[]>(
  documentId?: string,
  options?: Omit<
    UseQueryOptions<ClubOwnerActivityLog[], Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  const query = useQuery<ClubOwnerActivityLog[], Error, TData, any>({
    queryKey: ["clubOwnerActivityLogs", documentId],
    queryFn: () => getClubOwnerActivityLogsApi(documentId || ""),
    enabled: Boolean(documentId),
    refetchInterval: 50000,
    placeholderData: keepPreviousData,
    ...options,
  });

  const activityLogs: TData = (query.data ?? []) as unknown as TData;

  return {
    ...query,
    activityLogs,
    loading: query.isLoading,
    isInitialLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

// 🔹 Toggle Send Push Notifications Mutation Hook
export const useToggleSendNotifications = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (documentId: string) => toggleSendNotificationsApi(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubOwnerDetails"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["unverifiedOwners"] });
      queryClient.invalidateQueries({ queryKey: ["clientDetail"] });
    },
  });

  return {
    toggleSendNotifications: mutation.mutateAsync,
    isToggling: mutation.isPending,
  };
};

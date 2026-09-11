/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClientDetailApi,
  getClientListApi,
  updateClientDetailApi,
} from "../../api/client/clientApi";
import type {
  ClientDetailResponse,
  ClientListItem,
  UpdateClientPayload,
} from "../../api/client/client.types";
import useSnackBarStore from "../../store/snackBar.store";
import { useMemo } from "react";

/**
 * Hook to fetch all clients with optional search filtering
 */
export const useClientList = (search: string = "") => {
  const { data, isLoading, isFetching, error, refetch } = useQuery<
    ClientListItem[]
  >({
    queryKey: ["clientList"],
    queryFn: getClientListApi,
  });

  const filteredClients = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;

    const term = search.toLowerCase().trim();
    return data.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(term);
      const emailMatch = item.email?.toLowerCase().includes(term);
      const phoneMatch = item.phoneNumber?.toLowerCase().includes(term);
      const clientIdMatch = item.clientId?.toLowerCase().includes(term);
      const locationMatch = item.location?.toLowerCase().includes(term);
      return Boolean(
        nameMatch || emailMatch || phoneMatch || clientIdMatch || locationMatch,
      );
    });
  }, [data, search]);

  return {
    clients: filteredClients,
    allClients: data || [],
    loading: isLoading || isFetching,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

/**
 * Hook to fetch single client details by documentId
 */
export const useClientDetail = (docId?: string) => {
  const { data, isLoading, isFetching, error, refetch } =
    useQuery<ClientDetailResponse>({
      queryKey: ["clientDetail", docId],
      queryFn: () => getClientDetailApi(docId!),
      enabled: Boolean(docId),
    });

  return {
    client: data || null,
    loading: isLoading || isFetching,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

/**
 * Hook to update client details
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { setSnackBar } = useSnackBarStore();

  const mutation = useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: UpdateClientPayload;
    }) => updateClientDetailApi(docId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["clientDetail", variables.docId],
      });
      queryClient.invalidateQueries({
        queryKey: ["clientList"],
      });
      setSnackBar("User details updated successfully", "success");
    },
    onError: (error: Error) => {
      setSnackBar(error.message || "Failed to update user", "error");
    },
  });

  return {
    updateClient: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

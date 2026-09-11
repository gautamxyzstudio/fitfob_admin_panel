import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClubTypeApi,
  createFacilityApi,
  deleteClubTypeApi,
  deleteFacilityApi,
  getClubTypesApi,
  getFacilitiesApi,
  updateClubTypeApi,
  updateFacilityApi,
} from "../../api/appSettings/appSettingsApi";
import type {
  FacilityOrClubTypeItem,
  FacilityOrClubTypePayload,
} from "../../api/appSettings/appSettings.types";

// ==================== FACILITIES HOOK ====================

export const useFacilities = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery<
    FacilityOrClubTypeItem[]
  >({
    queryKey: ["facilities"],
    queryFn: getFacilitiesApi,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  const createMutation = useMutation({
    mutationFn: (payload: FacilityOrClubTypePayload) =>
      createFacilityApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: Partial<FacilityOrClubTypePayload>;
    }) => updateFacilityApi(docId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteFacilityApi(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });

  return {
    facilities: data || [],
    isLoading,
    isFetching,
    error: error ? (error as Error).message : null,
    refetch,
    createFacility: (payload: FacilityOrClubTypePayload) =>
      createMutation.mutateAsync(payload),
    updateFacility: (docId: string, payload: Partial<FacilityOrClubTypePayload>) =>
      updateMutation.mutateAsync({ docId, payload }),
    deleteFacility: (docId: string) => deleteMutation.mutateAsync(docId),
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};

// ==================== CLUB TYPES HOOK ====================

export const useClubTypes = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery<
    FacilityOrClubTypeItem[]
  >({
    queryKey: ["clubServices"],
    queryFn: getClubTypesApi,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  const createMutation = useMutation({
    mutationFn: (payload: FacilityOrClubTypePayload) =>
      createClubTypeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubServices"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: Partial<FacilityOrClubTypePayload>;
    }) => updateClubTypeApi(docId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubServices"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteClubTypeApi(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubServices"] });
    },
  });

  return {
    clubTypes: data || [],
    isLoading,
    isFetching,
    error: error ? (error as Error).message : null,
    refetch,
    createClubType: (payload: FacilityOrClubTypePayload) =>
      createMutation.mutateAsync(payload),
    updateClubType: (docId: string, payload: Partial<FacilityOrClubTypePayload>) =>
      updateMutation.mutateAsync({ docId, payload }),
    deleteClubType: (docId: string) => deleteMutation.mutateAsync(docId),
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};

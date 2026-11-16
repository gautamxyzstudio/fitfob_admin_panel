import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTrialSettingsApi,
  updateTrialSettingsApi,
} from "../../api/trialSettings/trialSettingsApi";
import type {
  TrialSettings,
  UpdateTrialSettingsPayload,
} from "../../api/trialSettings/trialSettings.types";
import useSnackBarStore from "../../store/snackBar.store";

export const useTrialSettings = (
  clubOwnerDocumentId?: string,
  enabled = true,
) => {
  const queryClient = useQueryClient();
  const { setSnackBar } = useSnackBarStore();

  const { data, isLoading, isFetching, error, refetch } = useQuery<TrialSettings>({
    queryKey: ["trialSettings", clubOwnerDocumentId],
    queryFn: () => getTrialSettingsApi(clubOwnerDocumentId!),
    enabled: Boolean(enabled && clubOwnerDocumentId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: (payload: UpdateTrialSettingsPayload) =>
      updateTrialSettingsApi(clubOwnerDocumentId!, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["trialSettings", clubOwnerDocumentId], updated);
      queryClient.invalidateQueries({
        queryKey: ["trialSettings", clubOwnerDocumentId],
      });
      setSnackBar("Trial settings updated successfully!", "success");
    },
    onError: (err: Error) => {
      setSnackBar(err.message || "Failed to update trial settings", "error");
    },
  });

  return {
    trialSettings: data || null,
    isLoading: isLoading && Boolean(clubOwnerDocumentId),
    isFetching,
    isUpdating: mutation.isPending,
    error: error ? (error as Error).message : null,
    refetch,
    updateTrialSettings: mutation.mutateAsync,
  };
};

export default useTrialSettings;

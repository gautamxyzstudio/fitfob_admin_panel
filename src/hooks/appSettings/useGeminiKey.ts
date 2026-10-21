import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGeminiKeyApi,
  updateGeminiKeyApi,
  deleteGeminiKeyApi,
} from "../../api/geminiKey/geminiKeyApi";
import type { GeminiKeyData } from "../../api/geminiKey/geminiKey.types";

export const useGeminiKey = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<GeminiKeyData | null>({
      queryKey: ["geminiKey"],
      queryFn: getGeminiKeyApi,
      staleTime: 1000 * 60 * 5,
    });

  const updateMutation = useMutation({
    mutationFn: (payload: { key?: string; isActive?: boolean }) =>
      updateGeminiKeyApi(payload),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["geminiKey"], updatedData);
      queryClient.invalidateQueries({ queryKey: ["geminiKey"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGeminiKeyApi(),
    onSuccess: () => {
      queryClient.setQueryData(["geminiKey"], null);
      queryClient.invalidateQueries({ queryKey: ["geminiKey"] });
    },
  });

  return {
    geminiKeyData: data,
    isLoading,
    isFetching,
    error,
    refetch,
    updateGeminiKey: (payload: { key?: string; isActive?: boolean }) =>
      updateMutation.mutateAsync(payload),
    deleteGeminiKey: () => deleteMutation.mutateAsync(),
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

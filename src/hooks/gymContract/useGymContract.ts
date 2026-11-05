import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGymContractApi,
  updateGymContractApi,
} from "../../api/gymContract/gymContractApi";
import type {
  GymContractPlan,
  GymContractResponseData,
  UpdateGymContractPayload,
  UpdateGymContractPlanPayload,
  UpdateZeroCommissionDealPayload,
} from "../../api/gymContract/gymContract.types";

export interface PlanFormItem {
  duration: string;
  commission: number;
  commissionMode: "default" | "custom";
}

export interface GymContractFormState {
  categoryTier: "basic" | "premium" | "luxury" | string;
  zeroCommissionDeal: {
    enabled: boolean;
    userLimit: number;
  };
  plans: PlanFormItem[];
}

/**
 * Computes partial diff payload for PUT /api/gym-contract/:documentId.
 * Only includes sections and fields that were actually modified compared to original server data.
 */
export const computeGymContractDiff = (
  current: GymContractFormState,
  original: GymContractResponseData | null,
): UpdateGymContractPayload | null => {
  if (!original) {
    // If no initial baseline exists, send full current data
    return {
      data: {
        categoryTier: current.categoryTier,
        zeroCommissionDeal: {
          enabled: current.zeroCommissionDeal.enabled,
          userLimit: current.zeroCommissionDeal.userLimit,
        },
        plans: current.plans.map((p) => ({
          duration: p.duration,
          commissionMode: p.commissionMode,
          ...(p.commissionMode === "custom" ? { customCommission: p.commission } : {}),
        })),
      },
    };
  }

  const payloadData: {
    categoryTier?: string;
    zeroCommissionDeal?: UpdateZeroCommissionDealPayload;
    plans?: UpdateGymContractPlanPayload[];
  } = {};

  let hasChanges = false;

  // 1. Check categoryTier
  if (current.categoryTier !== original.categoryTier) {
    payloadData.categoryTier = current.categoryTier;
    hasChanges = true;
  }

  // 2. Check zeroCommissionDeal
  const origDeal = original.zeroCommissionDeal;
  const dealChanged =
    origDeal.enabled !== current.zeroCommissionDeal.enabled ||
    origDeal.userLimit !== current.zeroCommissionDeal.userLimit;

  if (dealChanged) {
    payloadData.zeroCommissionDeal = {
      enabled: current.zeroCommissionDeal.enabled,
      userLimit: current.zeroCommissionDeal.userLimit,
    };
    hasChanges = true;
  }

  // 3. Check plans
  const modifiedPlans: UpdateGymContractPlanPayload[] = [];

  for (const currentPlan of current.plans) {
    const origPlan: GymContractPlan | undefined = original.plans?.find(
      (p) => p.duration === currentPlan.duration,
    );

    const commChanged = origPlan
      ? currentPlan.commission !== origPlan.fitfobCommission
      : true;
    const modeChanged = origPlan
      ? currentPlan.commissionMode !== origPlan.commissionMode
      : true;

    if (commChanged || modeChanged) {
      const planPayload: UpdateGymContractPlanPayload = {
        duration: currentPlan.duration,
        commissionMode: currentPlan.commissionMode,
      };

      if (currentPlan.commissionMode === "custom") {
        planPayload.customCommission = currentPlan.commission;
      }

      modifiedPlans.push(planPayload);
    }
  }

  if (modifiedPlans.length > 0) {
    payloadData.plans = modifiedPlans;
    hasChanges = true;
  }

  if (!hasChanges) {
    return null;
  }

  return {
    data: payloadData,
  };
};

/**
 * Main hook for fetching and updating gym contract by documentId
 */
export const useGymContract = (documentId?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<GymContractResponseData>({
      queryKey: ["gymContract", documentId],
      queryFn: () => getGymContractApi(documentId!),
      enabled: Boolean(documentId && documentId !== "default"),
      staleTime: 1000 * 60 * 5,
    });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateGymContractPayload) =>
      updateGymContractApi(documentId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gymContract", documentId] });
    },
  });

  return {
    contract: data || null,
    isLoading: isLoading && Boolean(documentId && documentId !== "default"),
    isFetching,
    isUpdating: updateMutation.isPending,
    error: error ? (error as Error).message : null,
    refetch,
    updateContract: updateMutation.mutateAsync,
    computeGymContractDiff,
  };
};

export default useGymContract;

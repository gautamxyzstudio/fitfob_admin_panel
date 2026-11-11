import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getMembershipPlanPricesApi,
  updateMembershipPlanPricesApi,
} from "../../api/membershipPlanPrices/membershipPlanPricesApi";
import type {
  TierItem,
  UpdateMembershipPlanPricesPayload,
  UpdatePlanItemPayload,
  UpdateTierItemPayload,
} from "../../api/membershipPlanPrices/membershipPlanPrices.types";
import { useMembershipPlanPricesStore } from "../../store/membershipPlanPrices.store";
import { formatLocalDateTime } from "../../utility/dayjs";

export interface PlanPricing {
  customerPrice: number;
  defaultComm: number;
}

export interface TierConfig {
  id: string;
  name: string;
  badgeLabel: string;
  badgeStyle: {
    bg: string;
    text: string;
  };
  subtitle: string;
  monthly: PlanPricing;
  biAnnually: PlanPricing;
  annually: PlanPricing;
}

export const DEFAULT_TIERS: TierConfig[] = [
  {
    id: "basic",
    name: "Basic",
    badgeLabel: "BASIC",
    badgeStyle: {
      bg: "bg-[#F3F4F6]",
      text: "text-[#374151]",
    },
    subtitle: "Budget & Local",
    monthly: {
      customerPrice: 1200,
      defaultComm: 200,
    },
    biAnnually: {
      customerPrice: 6000,
      defaultComm: 1000,
    },
    annually: {
      customerPrice: 10000,
      defaultComm: 1500,
    },
  },
  {
    id: "premium",
    name: "Premium",
    badgeLabel: "PREMIUM",
    badgeStyle: {
      bg: "bg-[#FEE2E2]",
      text: "text-[#E23744]",
    },
    subtitle: "Multi-brand Chains",
    monthly: {
      customerPrice: 1800,
      defaultComm: 300,
    },
    biAnnually: {
      customerPrice: 9000,
      defaultComm: 1500,
    },
    annually: {
      customerPrice: 15000,
      defaultComm: 2500,
    },
  },
  {
    id: "luxury",
    name: "Luxury",
    badgeLabel: "LUXURY",
    badgeStyle: {
      bg: "bg-[#FEF3C7]",
      text: "text-[#D97706]",
    },
    subtitle: "Premium Facilities",
    monthly: {
      customerPrice: 2500,
      defaultComm: 400,
    },
    biAnnually: {
      customerPrice: 13000,
      defaultComm: 2000,
    },
    annually: {
      customerPrice: 25000,
      defaultComm: 4000,
    },
  },
];

/**
 * Maps raw backend TierItem[] to frontend TierConfig[] structure
 */
export const mapApiTiersToTierConfigs = (apiTiers: TierItem[]): TierConfig[] => {
  if (!apiTiers || apiTiers.length === 0) {
    return DEFAULT_TIERS;
  }

  const metadataMap: Record<
    string,
    {
      name: string;
      badgeLabel: string;
      badgeStyle: { bg: string; text: string };
      subtitle: string;
    }
  > = {
    basic: {
      name: "Basic",
      badgeLabel: "BASIC",
      badgeStyle: { bg: "bg-[#F3F4F6]", text: "text-[#374151]" },
      subtitle: "Budget & Local",
    },
    premium: {
      name: "Premium",
      badgeLabel: "PREMIUM",
      badgeStyle: { bg: "bg-[#FEE2E2]", text: "text-[#E23744]" },
      subtitle: "Multi-brand Chains",
    },
    luxury: {
      name: "Luxury",
      badgeLabel: "LUXURY",
      badgeStyle: { bg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
      subtitle: "Premium Facilities",
    },
  };

  return apiTiers.map((tierItem) => {
    const tierId = tierItem.tier?.toLowerCase() || "";
    const meta = metadataMap[tierId] || {
      name: tierItem.tier ? tierItem.tier.charAt(0).toUpperCase() + tierItem.tier.slice(1) : "Tier",
      badgeLabel: (tierItem.tier || "TIER").toUpperCase(),
      badgeStyle: { bg: "bg-[#F3F4F6]", text: "text-[#374151]" },
      subtitle: `${tierItem.tier || "Standard"} Facilities`,
    };

    const monthlyPlan = tierItem.plans?.find(
      (p) => p.duration === "monthly" || p.durationMonths === 1,
    );
    const biAnnualPlan = tierItem.plans?.find(
      (p) => p.duration === "six_months" || p.durationMonths === 6,
    );
    const annualPlan = tierItem.plans?.find(
      (p) => p.duration === "twelve_months" || p.durationMonths === 12,
    );

    return {
      id: tierId,
      name: meta.name,
      badgeLabel: meta.badgeLabel,
      badgeStyle: meta.badgeStyle,
      subtitle: meta.subtitle,
      monthly: {
        customerPrice: monthlyPlan?.customerPrice ?? 0,
        defaultComm: monthlyPlan?.defaultCommission ?? 0,
      },
      biAnnually: {
        customerPrice: biAnnualPlan?.customerPrice ?? 0,
        defaultComm: biAnnualPlan?.defaultCommission ?? 0,
      },
      annually: {
        customerPrice: annualPlan?.customerPrice ?? 0,
        defaultComm: annualPlan?.defaultCommission ?? 0,
      },
    };
  });
};

/**
 * Extracts latest published/updated timestamp from API TierItem[]
 */
export const extractLatestTimestamp = (apiTiers: TierItem[]): string | null => {
  if (!apiTiers || apiTiers.length === 0) return null;

  let latestTime = 0;
  for (const tier of apiTiers) {
    for (const plan of tier.plans || []) {
      const dateStr = plan.updatedAt || plan.createdAt;
      if (dateStr) {
        const t = new Date(dateStr).getTime();
        if (!isNaN(t) && t > latestTime) {
          latestTime = t;
        }
      }
    }
  }

  if (latestTime === 0) return null;
  return formatLocalDateTime(latestTime, "D MMM YYYY, hh:mm A");
};

/**
 * Computes partial diff payload for PUT /api/membership-plan-prices.
 * Only includes tiers and plans that were modified.
 * In modified plans, includes `duration` and only the edited properties (`customerPrice` and/or `defaultCommission`).
 */
export const computePricingDiff = (
  currentTiers: TierConfig[],
  initialTiers: TierConfig[],
): UpdateMembershipPlanPricesPayload | null => {
  const updatedTiers: UpdateTierItemPayload[] = [];

  for (const currentTier of currentTiers) {
    const initialTier = initialTiers.find((t) => t.id === currentTier.id);
    const modifiedPlans: UpdatePlanItemPayload[] = [];

    const intervals: Array<{
      key: "monthly" | "biAnnually" | "annually";
      duration: string;
      durationMonths: number;
    }> = [
      { key: "monthly", duration: "monthly", durationMonths: 1 },
      { key: "biAnnually", duration: "six_months", durationMonths: 6 },
      { key: "annually", duration: "twelve_months", durationMonths: 12 },
    ];

    for (const { key, duration } of intervals) {
      const currentPlan = currentTier[key];
      const initialPlan = initialTier ? initialTier[key] : null;

      const priceChanged =
        initialPlan !== null &&
        initialPlan !== undefined &&
        currentPlan.customerPrice !== initialPlan.customerPrice;

      const commChanged =
        initialPlan !== null &&
        initialPlan !== undefined &&
        currentPlan.defaultComm !== initialPlan.defaultComm;

      if (priceChanged || commChanged) {
        const planPayload: UpdatePlanItemPayload = {
          duration,
        };
        if (priceChanged) {
          planPayload.customerPrice = currentPlan.customerPrice;
        }
        if (commChanged) {
          planPayload.defaultCommission = currentPlan.defaultComm;
        }
        modifiedPlans.push(planPayload);
      }
    }

    if (modifiedPlans.length > 0) {
      updatedTiers.push({
        tier: currentTier.id,
        plans: modifiedPlans,
      });
    }
  }

  if (updatedTiers.length === 0) {
    return null;
  }

  return {
    data: {
      tiers: updatedTiers,
    },
  };
};

/**
 * Main React Query hook for Membership Plan Prices
 */
export const useMembershipPlanPrices = () => {
  const queryClient = useQueryClient();
  const { setTiers, setLastPublishedAt, lastPublishedAt: storeLastPublishedAt } =
    useMembershipPlanPricesStore();

  const { data, isLoading, isFetching, error, refetch } = useQuery<TierItem[]>({
    queryKey: ["membershipPlanPrices"],
    queryFn: getMembershipPlanPricesApi,
    staleTime: 1000 * 60 * 5, // 5 mins fresh
  });

  useEffect(() => {
    if (data) {
      setTiers(data);
      const timestamp = extractLatestTimestamp(data);
      if (timestamp && !storeLastPublishedAt) {
        setLastPublishedAt(timestamp);
      }
    }
  }, [data, setTiers, setLastPublishedAt, storeLastPublishedAt]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMembershipPlanPricesPayload) =>
      updateMembershipPlanPricesApi(payload),
    onSuccess: () => {
      const timestamp = formatLocalDateTime(new Date(), "D MMM YYYY, hh:mm A");
      setLastPublishedAt(timestamp);
      queryClient.invalidateQueries({ queryKey: ["membershipPlanPrices"] });
    },
  });

  return {
    tiers: data || [],
    isLoading,
    isFetching,
    isUpdating: updateMutation.isPending,
    error: error ? (error as Error).message : null,
    refetch,
    updatePrices: (payload: UpdateMembershipPlanPricesPayload) =>
      updateMutation.mutateAsync(payload),
    lastPublishedAt: storeLastPublishedAt,
    computePricingDiff,
    mapApiTiersToTierConfigs,
    extractLatestTimestamp,
  };
};

export default useMembershipPlanPrices;

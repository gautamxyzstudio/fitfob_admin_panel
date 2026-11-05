export type PlanDuration = "monthly" | "six_months" | "twelve_months" | string;

export interface PlanItem {
  id?: number;
  duration: PlanDuration;
  durationMonths?: number;
  customerPrice?: number;
  defaultCommission?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TierItem {
  tier: string;
  plans: PlanItem[];
}

export interface MembershipPlanPricesResponse {
  tiers: TierItem[];
}

// Interfaces for PUT update payload (where only modified fields are passed)
export interface UpdatePlanItemPayload {
  duration: PlanDuration;
  durationMonths?: number;
  customerPrice?: number;
  defaultCommission?: number;
}

export interface UpdateTierItemPayload {
  tier: string;
  plans: UpdatePlanItemPayload[];
}

export interface UpdateMembershipPlanPricesPayload {
  data: {
    tiers: UpdateTierItemPayload[];
  };
}

export type PlanDuration = "monthly" | "six_months" | "twelve_months" | string;
export type CommissionMode = "default" | "custom" | string;

export interface ZeroCommissionDeal {
  enabled: boolean;
  userLimit: number;
  usedUserCount?: number;
}

export interface GymContractPlan {
  duration: PlanDuration;
  customerPrice: number;
  fitfobCommission: number;
  commissionMode: CommissionMode;
  clubNetPayout: number;
}

export interface GymContractResponseData {
  categoryTier: "basic" | "premium" | "luxury" | string;
  zeroCommissionDeal: ZeroCommissionDeal;
  plans: GymContractPlan[];
}

export interface GymContractResponse {
  data: GymContractResponseData;
}

// Partial update payload interfaces for PUT /api/gym-contract/:documentId
export interface UpdateZeroCommissionDealPayload {
  enabled?: boolean;
  userLimit?: number;
}

export interface UpdateGymContractPlanPayload {
  duration: PlanDuration;
  commissionMode: CommissionMode;
  customCommission?: number;
}

export interface UpdateGymContractPayloadData {
  categoryTier?: string;
  zeroCommissionDeal?: UpdateZeroCommissionDealPayload;
  plans?: UpdateGymContractPlanPayload[];
}

export interface UpdateGymContractPayload {
  data: UpdateGymContractPayloadData;
}

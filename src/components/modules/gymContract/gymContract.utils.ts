export interface GymContractData {
  assignedTier: "basic" | "premium" | "luxury";
  zeroCommissionDeal: boolean;
  zeroCommissionLimit: number;
  commissions: {
    monthly: number | string;
    biAnnually: number | string;
    annually: number | string;
  };
  lastSavedAt?: string;
}

export const getGymContractStorageKey = (clubId?: number | string) =>
  `fitfob_gym_contract_${clubId || "default"}`;

export const getInitialGymContract = (
  clubId?: number | string,
): GymContractData => {
  try {
    const saved = localStorage.getItem(getGymContractStorageKey(clubId));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    assignedTier: "premium",
    zeroCommissionDeal: true,
    zeroCommissionLimit: 20,
    commissions: {
      monthly: 300,
      biAnnually: 500,
      annually: 800,
    },
  };
};

export const formatCurrency = (val: number | string): string => {
  if (val === "" || val === null || val === undefined) return "0";
  const num =
    typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
};

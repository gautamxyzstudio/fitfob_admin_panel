import React, { useState, useMemo } from "react";
import { Lock, X, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import useSnackBarStore from "../../../store/snackBar.store";
import {
  useGymContract,
  type GymContractFormState,
  computeGymContractDiff,
} from "../../../hooks/gymContract/useGymContract";
import type {
  GymContractResponseData,
  UpdateGymContractPayload,
} from "../../../api/gymContract/gymContract.types";
import {
  formatCurrency,
  getGymContractStorageKey,
  type GymContractData,
} from "./gymContract.utils";

// Re-export for backward compatibility with pages importing from this file
export type { GymContractData };

interface GymContractModalProps {
  open: boolean;
  onClose: () => void;
  clubId?: number | string;
  documentId?: string;
  clubName?: string;
  city?: string;
  onSaveSuccess?: (data: GymContractData) => void;
}

interface TierGlobalPrices {
  customerPrice: number;
  defaultComm: number;
}

interface MasterTier {
  id: string;
  name: string;
  monthly: TierGlobalPrices;
  biAnnually: TierGlobalPrices;
  annually: TierGlobalPrices;
}

const DEFAULT_MASTER_TIERS: Record<string, MasterTier> = {
  basic: {
    id: "basic",
    name: "Basic",
    monthly: { customerPrice: 1200, defaultComm: 200 },
    biAnnually: { customerPrice: 6000, defaultComm: 1000 },
    annually: { customerPrice: 10000, defaultComm: 1500 },
  },
  premium: {
    id: "premium",
    name: "Premium",
    monthly: { customerPrice: 1800, defaultComm: 300 },
    biAnnually: { customerPrice: 9000, defaultComm: 1500 },
    annually: { customerPrice: 15000, defaultComm: 2500 },
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    monthly: { customerPrice: 2500, defaultComm: 400 },
    biAnnually: { customerPrice: 13000, defaultComm: 2000 },
    annually: { customerPrice: 25000, defaultComm: 4000 },
  },
};

interface GymContractContentProps {
  contract: GymContractResponseData | null;
  clubName: string;
  city?: string;
  isUpdating: boolean;
  onSave: (diff: UpdateGymContractPayload) => Promise<void>;
  onClose: () => void;
}

const GymContractContent: React.FC<GymContractContentProps> = ({
  contract,
  clubName,
  city,
  isUpdating,
  onSave,
  onClose,
}) => {
  const { setSnackBar } = useSnackBarStore();

  // Load master tiers from localStorage or fallback
  const masterTiers = useMemo(() => {
    try {
      const saved = localStorage.getItem("fitfob_master_pricing_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        const map: Record<string, MasterTier> = {};
        parsed.forEach((t: MasterTier) => {
          map[t.id] = t;
        });
        return map;
      }
    } catch {
      // ignore
    }
    return DEFAULT_MASTER_TIERS;
  }, []);

  // 1. Initial State from Contract or fallback
  const initialCategoryTier = useMemo(() => {
    const raw = contract?.categoryTier?.toLowerCase();
    if (raw === "basic" || raw === "premium" || raw === "luxury") return raw;
    return "premium";
  }, [contract]);

  const assignedTier = initialCategoryTier

  const zeroCommissionDeal = contract?.zeroCommissionDeal?.enabled ?? true

  const [zeroCommissionLimit, setZeroCommissionLimit] = useState<number | string>(() => {
    return contract?.zeroCommissionDeal?.userLimit ?? 20;
  });

  // Extract initial plans from contract if available
  const initialPlansMap = useMemo(() => {
    const map: Record<
      string,
      { fitfobCommission: number; commissionMode: "default" | "custom"; customerPrice: number }
    > = {};
    contract?.plans?.forEach((p) => {
      map[p.duration] = {
        fitfobCommission: p.fitfobCommission,
        commissionMode: p.commissionMode === "custom" ? "custom" : "default",
        customerPrice: p.customerPrice,
      };
    });
    return map;
  }, [contract]);

  const currentMasterTier = masterTiers[assignedTier] || DEFAULT_MASTER_TIERS[assignedTier];

  const [commissions, setCommissions] = useState<{
    monthly: number | string;
    biAnnually: number | string;
    annually: number | string;
  }>(() => {
    return {
      monthly:
        initialPlansMap["monthly"]?.fitfobCommission ??
        currentMasterTier.monthly.defaultComm,
      biAnnually:
        initialPlansMap["six_months"]?.fitfobCommission ??
        currentMasterTier.biAnnually.defaultComm,
      annually:
        initialPlansMap["twelve_months"]?.fitfobCommission ??
        currentMasterTier.annually.defaultComm,
    };
  });

  const [commissionModes, setCommissionModes] = useState<{
    monthly: "default" | "custom";
    biAnnually: "default" | "custom";
    annually: "default" | "custom";
  }>(() => {
    return {
      monthly: initialPlansMap["monthly"]?.commissionMode ?? "default",
      biAnnually: initialPlansMap["six_months"]?.commissionMode ?? "default",
      annually: initialPlansMap["twelve_months"]?.commissionMode ?? "default",
    };
  });

  // Calculate pricing & net payouts
  const monthlyCustomerPrice =
    initialPlansMap["monthly"]?.customerPrice ??
    currentMasterTier.monthly.customerPrice;
  const monthlyComm =
    commissions.monthly === ""
      ? currentMasterTier.monthly.defaultComm
      : Number(commissions.monthly) || 0;
  const monthlyNet = Math.max(0, monthlyCustomerPrice - monthlyComm);

  const biCustomerPrice =
    initialPlansMap["six_months"]?.customerPrice ??
    currentMasterTier.biAnnually.customerPrice;
  const biComm =
    commissions.biAnnually === ""
      ? currentMasterTier.biAnnually.defaultComm
      : Number(commissions.biAnnually) || 0;
  const biNet = Math.max(0, biCustomerPrice - biComm);

  const annualCustomerPrice =
    initialPlansMap["twelve_months"]?.customerPrice ??
    currentMasterTier.annually.customerPrice;
  const annualComm =
    commissions.annually === ""
      ? currentMasterTier.annually.defaultComm
      : Number(commissions.annually) || 0;
  const annualNet = Math.max(0, annualCustomerPrice - annualComm);

  // Handle commission input change
  const handleCommissionChange = (
    interval: "monthly" | "biAnnually" | "annually",
    value: string,
  ) => {
    const clean = value.replace(/\D/g, "");
    const numericVal = clean === "" ? 0 : parseInt(clean, 10);
    const tierDefaultComm =
      interval === "monthly"
        ? currentMasterTier.monthly.defaultComm
        : interval === "biAnnually"
        ? currentMasterTier.biAnnually.defaultComm
        : currentMasterTier.annually.defaultComm;

    setCommissions((prev) => ({
      ...prev,
      [interval]: clean === "" ? "" : numericVal,
    }));

    // Auto update commissionMode: if matches default commission, set to "default", else "custom"
    setCommissionModes((prev) => ({
      ...prev,
      [interval]: numericVal === tierDefaultComm ? "default" : "custom",
    }));
  };

  // Reset a specific plan commission to global default
  const handleResetCommission = (
    interval: "monthly" | "biAnnually" | "annually",
  ) => {
    const tierDefaultComm =
      interval === "monthly"
        ? currentMasterTier.monthly.defaultComm
        : interval === "biAnnually"
        ? currentMasterTier.biAnnually.defaultComm
        : currentMasterTier.annually.defaultComm;

    setCommissions((prev) => ({
      ...prev,
      [interval]: tierDefaultComm,
    }));
    setCommissionModes((prev) => ({
      ...prev,
      [interval]: "default",
    }));
  };

  // Build current state to evaluate diff
  const currentFormState: GymContractFormState = useMemo(() => {
    return {
      categoryTier: assignedTier,
      zeroCommissionDeal: {
        enabled: zeroCommissionDeal,
        userLimit:
          typeof zeroCommissionLimit === "string"
            ? parseInt(zeroCommissionLimit.replace(/\D/g, ""), 10) || 0
            : zeroCommissionLimit,
      },
      plans: [
        {
          duration: "monthly",
          commission: monthlyComm,
          commissionMode: commissionModes.monthly,
        },
        {
          duration: "six_months",
          commission: biComm,
          commissionMode: commissionModes.biAnnually,
        },
        {
          duration: "twelve_months",
          commission: annualComm,
          commissionMode: commissionModes.annually,
        },
      ],
    };
  }, [
    assignedTier,
    zeroCommissionDeal,
    zeroCommissionLimit,
    monthlyComm,
    commissionModes,
    biComm,
    annualComm,
  ]);

  const pendingDiff = useMemo(() => {
    return computeGymContractDiff(currentFormState, contract);
  }, [currentFormState, contract]);

  const hasChanges = Boolean(
    pendingDiff &&
      (pendingDiff.data.categoryTier ||
        pendingDiff.data.zeroCommissionDeal ||
        (pendingDiff.data.plans && pendingDiff.data.plans.length > 0)),
  );

  const handleSaveContract = async () => {
    if (!hasChanges || !pendingDiff) {
      setSnackBar("No changes detected to save", "info");
      onClose();
      return;
    }

    try {
      await onSave(pendingDiff);
    } catch {
      // Error handled by parent onSave
    }
  };

  const displayName =
    clubName + (city && !clubName.includes(city) ? ` (${city})` : "");

  return (
    <>
      {/* Top Header & Breadcrumb */}
      <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex flex-col gap-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] tracking-tight capitalize">
            Gym Contract: {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-[#787571] max-w-2xl leading-relaxed">
            Assign the category tier (this locks customer prices) and set the negotiated Fitfob commission
            for this partner.
          </p>
        </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
      </div>

      {/* Top Two Cards: Assigned Category Tier & Zero-Commission Deal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Card 1: ASSIGNED CATEGORY TIER */}
        <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white flex flex-col justify-between relative shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                ASSIGNED CATEGORY TIER
              </label>
              {pendingDiff?.data.categoryTier && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  MODIFIED
                </span>
              )}
            </div>

            {/* Tier Selection Dropdown */}
            <div className="relative mt-2.5">
              <div className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center justify-between text-sm font-bold text-[#1C1C1C] hover:border-gray-300 transition cursor-pointer shadow-2xs">
                <span className="tracking-wide uppercase">{assignedTier}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#8E8E93] mt-3">
            Customer pricing is locked to{" "}
            <span className="capitalize font-semibold text-gray-700">
              {assignedTier}
            </span>{" "}
            defaults.
          </p>
        </div>

        {/* Card 2: ZERO-COMMISSION DEAL */}
        <div
          className={`border rounded-2xl p-5 flex flex-col justify-between shadow-2xs transition-colors ${
            zeroCommissionDeal
              ? "border-[#DCFCE7] bg-[#F0FDF4]/60"
              : "border-gray-200 bg-gray-50/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  zeroCommissionDeal ? "text-[#166534]" : "text-gray-500"
                }`}
              >
                ZERO-COMMISSION DEAL
              </span>

              {/* Switch Toggle */}
            </div>

            {/* Active Badge & Usage Info */}
            <div className="mt-2.5 flex items-center gap-2">
              {zeroCommissionDeal ? (
                <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  ACTIVE (By User Count)
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  INACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Limit Input Box */}
          <div
            className={`bg-white border rounded-xl px-3.5 py-2 flex items-center gap-2 mt-3 shadow-2xs ${
              zeroCommissionDeal ? "border-[#BBF7D0]" : "border-gray-200 opacity-60"
            }`}
          >
            <span className="text-xs font-semibold text-[#4B5563]">Limit:</span>
            <input
              type="text"
              disabled={!zeroCommissionDeal}
              value={zeroCommissionLimit}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setZeroCommissionLimit(digits);
              }}
              className="w-5 text-sm font-bold text-[#1C1C1C] focus:outline-none disabled:text-gray-400 disabled:bg-transparent"
              placeholder="20"
            />
            <span className="text-xs font-medium text-[#6B7280]">Users</span>
          </div>
        </div>
      </div>

      {/* Pricing Matrix Table */}
      <div className="mt-6 w-full overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table className="w-full text-left border-collapse min-w-170">
          {/* Header */}
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-sm text-[#4B5563]">
              <th className="py-3.5 px-6 font-medium w-[22%]">Plan Duration</th>
              <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                <div>Customer Price</div>
                <div className="text-[11px] text-[#9CA3AF] font-normal">
                  Locked globally
                </div>
              </th>
              <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                <div>Fitfob Commission</div>
                <div className="text-[11px] text-[#9CA3AF] font-normal">
                  Editable per club
                </div>
              </th>
              <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                <div>Club Net Payout</div>
                <div className="text-[11px] text-[#9CA3AF] font-normal">
                  Auto-calculated
                </div>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-[#E5E7EB] bg-white text-sm">
            {/* Row 1: Monthly */}
            <tr className="hover:bg-gray-50/40 transition-colors">
              <td className="py-5 px-6 font-semibold text-[#1C1C1C]">Monthly</td>
              <td className="p-4 border-l border-[#E5E7EB]">
                <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#374151]">
                  <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>₹ {formatCurrency(monthlyCustomerPrice)}</span>
                </div>
              </td>
              <td className="p-4 border-l border-[#E5E7EB]">
                <div className="flex flex-col gap-1.5">
                  <div
                    className={`bg-white border rounded-lg px-3 py-2 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs transition-all ${
                      commissionModes.monthly === "custom"
                        ? "border-amber-300 bg-amber-50/20"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <span className="text-sm font-semibold text-[#1C1C1C] mr-1">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={commissions.monthly === "" ? "" : commissions.monthly}
                      onChange={(e) =>
                        handleCommissionChange("monthly", e.target.value)
                      }
                      className="w-16 text-sm font-semibold text-[#1C1C1C] focus:outline-none"
                      placeholder={String(currentMasterTier.monthly.defaultComm)}
                    />
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                        commissionModes.monthly === "custom"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {commissionModes.monthly === "custom"
                        ? "Custom"
                        : "Global Default"}
                    </span>
                  </div>

                  {commissionModes.monthly === "custom" && (
                    <button
                      type="button"
                      onClick={() => handleResetCommission("monthly")}
                      className="text-[11px] text-gray-400 hover:text-primary transition flex items-center gap-1 self-start cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to global default (₹{currentMasterTier.monthly.defaultComm})</span>
                    </button>
                  )}
                </div>
              </td>
              <td className="py-5 px-6 border-l border-[#E5E7EB]">
                <span className="text-base font-bold text-[#1C1C1C]">
                  ₹ {formatCurrency(monthlyNet)}
                </span>
              </td>
            </tr>

            {/* Row 2: Bi-Annually (6 months) */}
            <tr className="hover:bg-gray-50/40 transition-colors">
              <td className="py-5 px-6 font-semibold text-[#1C1C1C]">Bi-Annually (6m)</td>
              <td className="p-4 border-l border-[#E5E7EB]">
                <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#374151]">
                  <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>₹ {formatCurrency(biCustomerPrice)}</span>
                </div>
              </td>
              <td className="p-4 border-l border-[#E5E7EB]">
                <div className="flex flex-col gap-1.5">
                  <div
                    className={`bg-white border rounded-lg px-3 py-2 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs transition-all ${
                      commissionModes.biAnnually === "custom"
                        ? "border-amber-300 bg-amber-50/20"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <span className="text-sm font-semibold text-[#1C1C1C] mr-1">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={commissions.biAnnually === "" ? "" : commissions.biAnnually}
                      onChange={(e) =>
                        handleCommissionChange("biAnnually", e.target.value)
                      }
                      className="w-16 text-sm font-semibold text-[#1C1C1C] focus:outline-none"
                      placeholder={String(currentMasterTier.biAnnually.defaultComm)}
                    />
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                        commissionModes.biAnnually === "custom"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {commissionModes.biAnnually === "custom"
                        ? "Custom"
                        : "Global Default"}
                    </span>
                  </div>

                  {commissionModes.biAnnually === "custom" && (
                    <button
                      type="button"
                      onClick={() => handleResetCommission("biAnnually")}
                      className="text-[11px] text-gray-400 hover:text-primary transition flex items-center gap-1 self-start cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to global default (₹{currentMasterTier.biAnnually.defaultComm})</span>
                    </button>
                  )}
                </div>
              </td>
              <td className="py-5 px-6 border-l border-[#E5E7EB]">
                <span className="text-base font-bold text-[#1C1C1C]">
                  ₹ {formatCurrency(biNet)}
                </span>
              </td>
            </tr>

            {/* Row 3: Annually (12 months) */}
            <tr className="hover:bg-gray-50/40 transition-colors">
              <td className="py-5 px-6 font-semibold text-[#1C1C1C]">Annually (12m)</td>
              <td className="p-4 border-l border-[#E5E7EB]">
                <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#374151]">
                  <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>₹ {formatCurrency(annualCustomerPrice)}</span>
                </div>
              </td>
              <td className="p-4 border-l border-[#E5E7EB]">
                <div className="flex flex-col gap-1.5">
                  <div
                    className={`bg-white border rounded-lg px-3 py-2 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs transition-all ${
                      commissionModes.annually === "custom"
                        ? "border-amber-300 bg-amber-50/20"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <span className="text-sm font-semibold text-[#1C1C1C] mr-1">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={commissions.annually === "" ? "" : commissions.annually}
                      onChange={(e) =>
                        handleCommissionChange("annually", e.target.value)
                      }
                      className="w-16 text-sm font-semibold text-[#1C1C1C] focus:outline-none"
                      placeholder={String(currentMasterTier.annually.defaultComm)}
                    />
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                        commissionModes.annually === "custom"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {commissionModes.annually === "custom"
                        ? "Custom"
                        : "Global Default"}
                    </span>
                  </div>

                  {commissionModes.annually === "custom" && (
                    <button
                      type="button"
                      onClick={() => handleResetCommission("annually")}
                      className="text-[11px] text-gray-400 hover:text-primary transition flex items-center gap-1 self-start cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to global default (₹{currentMasterTier.annually.defaultComm})</span>
                    </button>
                  )}
                </div>
              </td>
              <td className="py-5 px-6 border-l border-[#E5E7EB]">
                <span className="text-base font-bold text-[#1C1C1C]">
                  ₹ {formatCurrency(annualNet)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Bar */}
      <div className="mt-6 pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-[#787571] max-w-xl leading-relaxed">
          Net payout = customer price - Fitfob commission. Leave a commission blank or reset to use the
          tier's global default.
        </p>

        <div className="flex items-center gap-3 self-end justify-end w-3/4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUpdating || !hasChanges}
            onClick={handleSaveContract}
            className="bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white px-7 py-3 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Contract...</span>
              </>
            ) : hasChanges ? (
              <span>Save Partner Contract (Edited)</span>
            ) : (
              <span>Save Partner Contract</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

const GymContractModal: React.FC<GymContractModalProps> = ({
  open,
  onClose,
  clubId = "default",
  documentId,
  clubName = "Gold's Gym (Mohali)",
  city,
  onSaveSuccess,
}) => {
  const { setSnackBar } = useSnackBarStore();

  const effectiveDocumentId = useMemo(() => {
    if (documentId && documentId.trim()) return documentId.trim();
    if (clubId && clubId !== "default") return String(clubId).trim();
    return "";
  }, [documentId, clubId]);

  const {
    contract,
    isLoading,
    isUpdating,
    error,
    refetch,
    updateContract,
  } = useGymContract(effectiveDocumentId);

  if (!open) return null;

  const handleSave = async (diffPayload: UpdateGymContractPayload) => {
    try {
      if (effectiveDocumentId) {
        await updateContract(diffPayload);
      }

      // Also persist to localStorage as backup
      const fallbackData: GymContractData = {
        assignedTier:
          (diffPayload.data.categoryTier as "basic" | "premium" | "luxury") ||
          contract?.categoryTier ||
          "premium",
        zeroCommissionDeal:
          diffPayload.data.zeroCommissionDeal?.enabled ??
          contract?.zeroCommissionDeal.enabled ??
          true,
        zeroCommissionLimit:
          diffPayload.data.zeroCommissionDeal?.userLimit ??
          contract?.zeroCommissionDeal.userLimit ??
          20,
        commissions: {
          monthly:
            diffPayload.data.plans?.find((p) => p.duration === "monthly")
              ?.customCommission || 300,
          biAnnually:
            diffPayload.data.plans?.find((p) => p.duration === "six_months")
              ?.customCommission || 500,
          annually:
            diffPayload.data.plans?.find((p) => p.duration === "twelve_months")
              ?.customCommission || 800,
        },
        lastSavedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(
          getGymContractStorageKey(clubId),
          JSON.stringify(fallbackData),
        );
      } catch {
        // ignore
      }

      setSnackBar(
        `Contract for ${clubName} saved successfully!`,
        "success",
      );

      if (onSaveSuccess) {
        onSaveSuccess(fallbackData);
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save gym contract";
      setSnackBar(msg, "error");
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-auto border border-gray-100 min-h-100 flex flex-col justify-between">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-gray-600">
              Loading contract for {clubName}...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-semibold text-gray-800">
              Failed to load partner contract
            </p>
            <p className="text-xs text-gray-500 max-w-md text-center">{error}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <GymContractContent
            key={`${effectiveDocumentId}_${contract ? "loaded" : "default"}`}
            contract={contract}
            clubName={clubName}
            city={city}
            isUpdating={isUpdating}
            onSave={handleSave}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default GymContractModal;

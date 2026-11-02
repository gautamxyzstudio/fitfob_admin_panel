import React, { useState, useEffect, useMemo } from "react";
import { Lock, X, ChevronDown, Check } from "lucide-react";
import useSnackBarStore from "../../../store/snackBar.store";

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

interface GymContractModalProps {
  open: boolean;
  onClose: () => void;
  clubId?: number | string;
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

const formatCurrency = (val: number | string): string => {
  if (val === "" || val === null || val === undefined) return "0";
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
};

export const getGymContractStorageKey = (clubId?: number | string) =>
  `fitfob_gym_contract_${clubId || "default"}`;

export const getInitialGymContract = (clubId?: number | string): GymContractData => {
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

const GymContractModal: React.FC<GymContractModalProps> = ({
  open,
  onClose,
  clubId = "default",
  clubName = "Gold's Gym (Mohali)",
  city,
  onSaveSuccess,
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
  }, [open]);

  const [assignedTier, setAssignedTier] = useState<"basic" | "premium" | "luxury">("premium");
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false);
  const [zeroCommissionDeal, setZeroCommissionDeal] = useState(true);
  const [zeroCommissionLimit, setZeroCommissionLimit] = useState<number | string>(20);

  const [commissions, setCommissions] = useState({
    monthly: 300 as number | string,
    biAnnually: 500 as number | string,
    annually: 800 as number | string,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load existing contract data on mount / open
  useEffect(() => {
    if (open) {
      const data = getInitialGymContract(clubId);
      setAssignedTier(data.assignedTier || "premium");
      setZeroCommissionDeal(data.zeroCommissionDeal ?? true);
      setZeroCommissionLimit(data.zeroCommissionLimit ?? 20);
      setCommissions(
        data.commissions || {
          monthly: 300,
          biAnnually: 500,
          annually: 800,
        }
      );
      setTierDropdownOpen(false);
    }
  }, [open, clubId]);

  if (!open) return null;

  const currentMasterTier = masterTiers[assignedTier] || DEFAULT_MASTER_TIERS[assignedTier];

  // Calculate pricing & net payouts
  const monthlyCustomerPrice = currentMasterTier.monthly.customerPrice;
  const monthlyComm =
    commissions.monthly === ""
      ? currentMasterTier.monthly.defaultComm
      : Number(commissions.monthly) || 0;
  const monthlyNet = Math.max(0, monthlyCustomerPrice - monthlyComm);

  const biCustomerPrice = currentMasterTier.biAnnually.customerPrice;
  const biComm =
    commissions.biAnnually === ""
      ? currentMasterTier.biAnnually.defaultComm
      : Number(commissions.biAnnually) || 0;
  const biNet = Math.max(0, biCustomerPrice - biComm);

  const annualCustomerPrice = currentMasterTier.annually.customerPrice;
  const annualComm =
    commissions.annually === ""
      ? currentMasterTier.annually.defaultComm
      : Number(commissions.annually) || 0;
  const annualNet = Math.max(0, annualCustomerPrice - annualComm);

  const handleCommissionChange = (
    interval: "monthly" | "biAnnually" | "annually",
    value: string
  ) => {
    const clean = value.replace(/\D/g, "");
    setCommissions((prev) => ({
      ...prev,
      [interval]: clean === "" ? "" : parseInt(clean, 10),
    }));
  };

  const handleSaveContract = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        const contractData: GymContractData = {
          assignedTier,
          zeroCommissionDeal,
          zeroCommissionLimit:
            typeof zeroCommissionLimit === "string"
              ? parseInt(zeroCommissionLimit.replace(/\D/g, ""), 10) || 0
              : zeroCommissionLimit,
          commissions,
          lastSavedAt: new Date().toISOString(),
        };

        localStorage.setItem(
          getGymContractStorageKey(clubId),
          JSON.stringify(contractData)
        );

        setSnackBar(
          `Contract for ${clubName} saved successfully!`,
          "success"
        );
        if (onSaveSuccess) {
          onSaveSuccess(contractData);
        }
        setIsSaving(false);
        onClose();
      } catch (err: any) {
        setSnackBar(err.message || "Failed to save contract", "error");
        setIsSaving(false);
      }
    }, 400);
  };

  const displayName = clubName + (city && !clubName.includes(city) ? ` (${city})` : "");

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-auto border border-gray-100">
        {/* Top Header & Breadcrumb */}
        <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex flex-col gap-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] tracking-tight">
              Gym Contract: {displayName}
            </h2>
            <p className="text-xs sm:text-sm text-[#787571] max-w-2xl leading-relaxed">
              Assign the category tier (this locks customer prices) and set the negotiated Fitfob commission
              for this partner.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <div className="bg-[#F4F4F5] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
              <span>Clubs</span>
              <span>›</span>
              <span className="truncate max-w-[120px]">{clubName}</span>
              <span>›</span>
              <span className="text-[#374151] font-semibold">Commissions</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Two Cards: Assigned Category Tier & Zero-Commission Deal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Card 1: ASSIGNED CATEGORY TIER */}
          <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white flex flex-col justify-between relative shadow-2xs">
            <div>
              <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                ASSIGNED CATEGORY TIER
              </label>

              {/* Tier Selection Dropdown */}
              <div className="relative mt-2.5">
                <button
                  type="button"
                  onClick={() => setTierDropdownOpen(!tierDropdownOpen)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center justify-between text-sm font-bold text-[#1C1C1C] hover:border-gray-300 transition cursor-pointer shadow-2xs"
                >
                  <span className="tracking-wide uppercase">{assignedTier}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      tierDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {tierDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1 overflow-hidden animate-in fade-in duration-100">
                    {(["basic", "premium", "luxury"] as const).map((tierKey) => (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => {
                          setAssignedTier(tierKey);
                          setTierDropdownOpen(false);
                          // Auto set commissions to tier defaults if blank
                          const defTier = masterTiers[tierKey] || DEFAULT_MASTER_TIERS[tierKey];
                          setCommissions({
                            monthly: defTier.monthly.defaultComm,
                            biAnnually: defTier.biAnnually.defaultComm,
                            annually: defTier.annually.defaultComm,
                          });
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-bold tracking-wider uppercase flex items-center justify-between transition cursor-pointer ${
                          assignedTier === tierKey
                            ? "bg-red-50 text-primary"
                            : "text-[#374151] hover:bg-gray-50"
                        }`}
                      >
                        <span>{tierKey}</span>
                        {assignedTier === tierKey && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-[#8E8E93] mt-3">
              Customer pricing is locked to{" "}
              <span className="capitalize">{assignedTier}</span> defaults.
            </p>
          </div>

          {/* Card 2: ZERO-COMMISSION DEAL */}
          <div className="border border-[#DCFCE7] bg-[#F0FDF4]/60 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wider">
                  ZERO-COMMISSION DEAL
                </span>

                {/* Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={zeroCommissionDeal}
                  onClick={() => setZeroCommissionDeal(!zeroCommissionDeal)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    zeroCommissionDeal ? "bg-[#22C55E]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      zeroCommissionDeal ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Active Badge */}
              <div className="mt-2.5">
                {zeroCommissionDeal ? (
                  <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    ACTIVE (By User Count)
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-500 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    INACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Limit Input Box */}
            <div className="bg-white border border-[#BBF7D0] rounded-xl px-3.5 py-2 flex items-center gap-2 mt-3 shadow-2xs">
              <span className="text-xs font-semibold text-[#4B5563]">Limit:</span>
              <input
                type="text"
                disabled={!zeroCommissionDeal}
                value={zeroCommissionLimit}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setZeroCommissionLimit(digits);
                }}
                className="w-14 text-sm font-bold text-[#1C1C1C] focus:outline-none disabled:text-gray-400 disabled:bg-transparent"
                placeholder="20"
              />
              <span className="text-xs font-medium text-[#6B7280]">Users</span>
            </div>
          </div>
        </div>

        {/* Pricing Matrix Table */}
        <div className="mt-6 w-full overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left border-collapse min-w-[680px]">
            {/* Header */}
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-sm text-[#4B5563]">
                <th className="py-3.5 px-6 font-medium w-[22%]">Plan Duration</th>
                <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                  <div>Customer Price</div>
                  <div className="text-[11px] text-[#9CA3AF] font-normal">Locked globally</div>
                </th>
                <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                  <div>Fitfob Commission</div>
                  <div className="text-[11px] text-[#9CA3AF] font-normal">Editable per club</div>
                </th>
                <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                  <div>Club Net Payout</div>
                  <div className="text-[11px] text-[#9CA3AF] font-normal">Auto-calculated</div>
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
                  <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs transition-all">
                    <span className="text-sm font-semibold text-[#1C1C1C] mr-1">₹</span>
                    <input
                      type="text"
                      value={commissions.monthly === "" ? "" : commissions.monthly}
                      onChange={(e) => handleCommissionChange("monthly", e.target.value)}
                      className="w-16 text-sm font-semibold text-[#1C1C1C] focus:outline-none"
                      placeholder={String(currentMasterTier.monthly.defaultComm)}
                    />
                    {Number(commissions.monthly) === currentMasterTier.monthly.defaultComm && (
                      <span className="text-[11px] text-[#9CA3AF] font-normal ml-1 whitespace-nowrap">
                        (Global Default)
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-5 px-6 border-l border-[#E5E7EB]">
                  <span className="text-base font-bold text-[#1C1C1C]">
                    ₹ {formatCurrency(monthlyNet)}
                  </span>
                </td>
              </tr>

              {/* Row 2: Bi-Annually */}
              <tr className="hover:bg-gray-50/40 transition-colors">
                <td className="py-5 px-6 font-semibold text-[#1C1C1C]">Bi-Annually</td>
                <td className="p-4 border-l border-[#E5E7EB]">
                  <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#374151]">
                    <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>₹ {formatCurrency(biCustomerPrice)}</span>
                  </div>
                </td>
                <td className="p-4 border-l border-[#E5E7EB]">
                  <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs transition-all">
                    <span className="text-sm font-semibold text-[#1C1C1C] mr-1">₹</span>
                    <input
                      type="text"
                      value={commissions.biAnnually === "" ? "" : commissions.biAnnually}
                      onChange={(e) => handleCommissionChange("biAnnually", e.target.value)}
                      className="w-16 text-sm font-semibold text-[#1C1C1C] focus:outline-none"
                      placeholder={String(currentMasterTier.biAnnually.defaultComm)}
                    />
                    {Number(commissions.biAnnually) === currentMasterTier.biAnnually.defaultComm && (
                      <span className="text-[11px] text-[#9CA3AF] font-normal ml-1 whitespace-nowrap">
                        (Global Default)
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-5 px-6 border-l border-[#E5E7EB]">
                  <span className="text-base font-bold text-[#1C1C1C]">
                    ₹ {formatCurrency(biNet)}
                  </span>
                </td>
              </tr>

              {/* Row 3: Annually */}
              <tr className="hover:bg-gray-50/40 transition-colors">
                <td className="py-5 px-6 font-semibold text-[#1C1C1C]">Annually</td>
                <td className="p-4 border-l border-[#E5E7EB]">
                  <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#374151]">
                    <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>₹ {formatCurrency(annualCustomerPrice)}</span>
                  </div>
                </td>
                <td className="p-4 border-l border-[#E5E7EB]">
                  <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs transition-all">
                    <span className="text-sm font-semibold text-[#1C1C1C] mr-1">₹</span>
                    <input
                      type="text"
                      value={commissions.annually === "" ? "" : commissions.annually}
                      onChange={(e) => handleCommissionChange("annually", e.target.value)}
                      className="w-16 text-sm font-semibold text-[#1C1C1C] focus:outline-none"
                      placeholder={String(currentMasterTier.annually.defaultComm)}
                    />
                    {Number(commissions.annually) === currentMasterTier.annually.defaultComm && (
                      <span className="text-[11px] text-[#9CA3AF] font-normal ml-1 whitespace-nowrap">
                        (Global Default)
                      </span>
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
            Net payout = customer price - Fitfob commission. Leave a commission blank to use the tier's global
            default.
          </p>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveContract}
            className="bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white px-7 py-3 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isSaving ? "Saving Contract..." : "Save Partner Contract"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GymContractModal;


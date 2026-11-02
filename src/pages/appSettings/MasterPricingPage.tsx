import React, { useState } from "react";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import useSnackBarStore from "../../store/snackBar.store";
import { Lock, CheckCircle2, AlertTriangle, X } from "lucide-react";

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

const DEFAULT_TIERS: TierConfig[] = [
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

const STORAGE_KEY = "fitfob_master_pricing_config";

// Format currency with commas (Indian number format)
const formatCurrency = (val: number | string): string => {
  if (val === "" || val === null || val === undefined) return "";
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
};

const MasterPricingPage: React.FC = () => {
  const { setSnackBar } = useSnackBarStore();
  const [tiers, setTiers] = useState<TierConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TIERS;
  });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingComm, setEditingComm] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_published_at`);
  });

  const handlePriceChange = (
    tierId: string,
    interval: "monthly" | "biAnnually" | "annually",
    rawVal: string
  ) => {
    const cleanDigits = rawVal.replace(/\D/g, "");
    const numericVal = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);

    setTiers((prev) =>
      prev.map((t) => {
        if (t.id === tierId) {
          return {
            ...t,
            [interval]: {
              ...t[interval],
              customerPrice: numericVal,
            },
          };
        }
        return t;
      })
    );
  };

  const handleCommChange = (
    tierId: string,
    interval: "monthly" | "biAnnually" | "annually",
    rawVal: string
  ) => {
    const cleanDigits = rawVal.replace(/\D/g, "");
    const numericVal = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);

    setTiers((prev) =>
      prev.map((t) => {
        if (t.id === tierId) {
          return {
            ...t,
            [interval]: {
              ...t[interval],
              defaultComm: numericVal,
            },
          };
        }
        return t;
      })
    );
  };

  const handlePublishConfirm = () => {
    setIsPublishing(true);
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
        const timestamp = new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        localStorage.setItem(`${STORAGE_KEY}_published_at`, timestamp);
        setLastPublishedAt(timestamp);
        setConfirmModalOpen(false);
        setSnackBar(
          "Global membership pricing successfully locked & published across the network!",
          "success"
        );
      } catch (err: any) {
        setSnackBar(err.message || "Failed to publish pricing", "error");
      } finally {
        setIsPublishing(false);
      }
    }, 600);
  };

  return (
    <div className="w-full flex flex-col gap-y-4">
      <CustomBox customClasses="p-7 w-full flex flex-col justify-between shadow-xs">
        {/* Top Header & Breadcrumb */}
        <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] tracking-tight">
              Global Membership Plans Configurator
            </h1>
            <p className="text-sm text-[#787571] max-w-3xl leading-relaxed">
              Fixed customer-facing prices for the whole network. Club owners can't change these. Default
              commissions are set per tier and can be negotiated per club.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start">
            <div className="bg-[#F4F4F5] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
              <span className="text-[#9CA3AF]">App Settings</span>
              <span className="text-[#9CA3AF]">›</span>
              <span className="text-[#374151] font-semibold">Master Pricing</span>
            </div>
          </div>
        </div>

        {/* Pricing Matrix / Grid Table */}
        <div className="mt-8 w-full overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left border-collapse min-w-[760px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-sm text-[#4B5563]">
                <th className="py-3.5 px-6 font-medium w-[22%]">Category Tier</th>
                <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                  <span>Monthly</span>{" "}
                  <span className="text-xs text-[#9CA3AF] font-normal">(1 month)</span>
                </th>
                <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                  <span>Bi-Annually</span>{" "}
                  <span className="text-xs text-[#9CA3AF] font-normal">(6 months)</span>
                </th>
                <th className="py-3.5 px-6 font-medium w-[26%] border-l border-[#E5E7EB]">
                  <span>Annually</span>{" "}
                  <span className="text-xs text-[#9CA3AF] font-normal">(12 months)</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#E5E7EB] bg-white text-sm">
              {tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50/40 transition-colors">
                  {/* Category Tier Column */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col items-start gap-y-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase ${tier.badgeStyle.bg} ${tier.badgeStyle.text}`}
                      >
                        {tier.badgeLabel}
                      </span>
                      <span className="text-xs font-medium text-[#6B7280]">
                        {tier.subtitle}
                      </span>
                    </div>
                  </td>

                  {/* Monthly (1 month) */}
                  <td className="p-5 align-top border-l border-[#E5E7EB]">
                    <div className="flex flex-col gap-y-1">
                      <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                        CUSTOMER PRICE
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm font-semibold text-[#1C1C1C] pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={formatCurrency(tier.monthly.customerPrice)}
                          onChange={(e) =>
                            handlePriceChange(tier.id, "monthly", e.target.value)
                          }
                          className="w-full pl-7 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2.5 px-0.5 min-h-[28px]">
                        <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          DEFAULT COMM.
                        </span>
                        {editingComm === `${tier.id}-monthly` ? (
                          <div className="relative flex items-center">
                            <span className="text-xs font-bold text-[#1C1C1C] mr-0.5">₹</span>
                            <input
                              type="text"
                              autoFocus
                              value={formatCurrency(tier.monthly.defaultComm)}
                              onChange={(e) =>
                                handleCommChange(tier.id, "monthly", e.target.value)
                              }
                              onBlur={() => setEditingComm(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingComm(null);
                              }}
                              className="w-16 px-1 py-0.5 text-xs font-bold text-[#1C1C1C] border border-primary rounded focus:outline-none text-right"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingComm(`${tier.id}-monthly`)}
                            className="group flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded transition"
                            title="Click to edit commission"
                          >
                            <span className="text-xs font-bold text-[#1C1C1C]">
                              ₹ {formatCurrency(tier.monthly.defaultComm)}
                            </span>
                            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                              ✎
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Bi-Annually (6 months) */}
                  <td className="p-5 align-top border-l border-[#E5E7EB]">
                    <div className="flex flex-col gap-y-1">
                      <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                        CUSTOMER PRICE
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm font-semibold text-[#1C1C1C] pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={formatCurrency(tier.biAnnually.customerPrice)}
                          onChange={(e) =>
                            handlePriceChange(tier.id, "biAnnually", e.target.value)
                          }
                          className="w-full pl-7 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2.5 px-0.5 min-h-[28px]">
                        <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          DEFAULT COMM.
                        </span>
                        {editingComm === `${tier.id}-biAnnually` ? (
                          <div className="relative flex items-center">
                            <span className="text-xs font-bold text-[#1C1C1C] mr-0.5">₹</span>
                            <input
                              type="text"
                              autoFocus
                              value={formatCurrency(tier.biAnnually.defaultComm)}
                              onChange={(e) =>
                                handleCommChange(tier.id, "biAnnually", e.target.value)
                              }
                              onBlur={() => setEditingComm(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingComm(null);
                              }}
                              className="w-16 px-1 py-0.5 text-xs font-bold text-[#1C1C1C] border border-primary rounded focus:outline-none text-right"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingComm(`${tier.id}-biAnnually`)}
                            className="group flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded transition"
                            title="Click to edit commission"
                          >
                            <span className="text-xs font-bold text-[#1C1C1C]">
                              ₹ {formatCurrency(tier.biAnnually.defaultComm)}
                            </span>
                            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                              ✎
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Annually (12 months) */}
                  <td className="p-5 align-top border-l border-[#E5E7EB]">
                    <div className="flex flex-col gap-y-1">
                      <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                        CUSTOMER PRICE
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm font-semibold text-[#1C1C1C] pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={formatCurrency(tier.annually.customerPrice)}
                          onChange={(e) =>
                            handlePriceChange(tier.id, "annually", e.target.value)
                          }
                          className="w-full pl-7 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2.5 px-0.5 min-h-[28px]">
                        <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          DEFAULT COMM.
                        </span>
                        {editingComm === `${tier.id}-annually` ? (
                          <div className="relative flex items-center">
                            <span className="text-xs font-bold text-[#1C1C1C] mr-0.5">₹</span>
                            <input
                              type="text"
                              autoFocus
                              value={formatCurrency(tier.annually.defaultComm)}
                              onChange={(e) =>
                                handleCommChange(tier.id, "annually", e.target.value)
                              }
                              onBlur={() => setEditingComm(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingComm(null);
                              }}
                              className="w-16 px-1 py-0.5 text-xs font-bold text-[#1C1C1C] border border-primary rounded focus:outline-none text-right"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingComm(`${tier.id}-annually`)}
                            className="group flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded transition"
                            title="Click to edit commission"
                          >
                            <span className="text-xs font-bold text-[#1C1C1C]">
                              ₹ {formatCurrency(tier.annually.defaultComm)}
                            </span>
                            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                              ✎
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="mt-8 pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="text-xs text-[#787571] max-w-xl leading-relaxed">
              Publishing updates every club on a tier at once. Existing subscriptions keep the price they
              were bought at.
            </p>
            {lastPublishedAt && (
              <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Last published: <span className="font-medium text-[#6B7280]">{lastPublishedAt}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
           

            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              className="bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-x-2 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Lock className="w-4 h-4 stroke-[2.2]" />
              <span>Lock & Publish Global Prices</span>
            </button>
          </div>
        </div>
      </CustomBox>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1C1C]">
                    Lock & Publish Global Prices?
                  </h3>
                  <p className="text-xs text-[#787571]">
                    Network-wide price update
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-[#F8F9FA] p-3 rounded-xl border border-gray-100">
              Publishing will update customer-facing prices immediately across all gyms and clubs on
              these tiers. Existing active subscriptions will remain unaffected.
            </p>

            {/* Quick summary */}
            <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-y-2 text-xs">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Summary of Monthly Prices
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-gray-700">Basic Tier:</span>
                <span className="font-bold text-gray-900">
                  ₹ {formatCurrency(tiers.find((t) => t.id === "basic")?.monthly.customerPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-gray-700">Premium Tier:</span>
                <span className="font-bold text-gray-900">
                  ₹ {formatCurrency(tiers.find((t) => t.id === "premium")?.monthly.customerPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-gray-700">Luxury Tier:</span>
                <span className="font-bold text-gray-900">
                  ₹ {formatCurrency(tiers.find((t) => t.id === "luxury")?.monthly.customerPrice || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishConfirm}
                className="bg-primary hover:bg-[#c82333] text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {isPublishing ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm & Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPricingPage;

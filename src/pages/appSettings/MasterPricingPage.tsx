import React, { useState, useMemo } from "react";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import useSnackBarStore from "../../store/snackBar.store";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import {
  useMembershipPlanPrices,
} from "../../hooks/appSettings/useMembershipPlanPrices";
import { formatLocalDateTime } from "../../utility/dayjs";
import type {
  UpdateMembershipPlanPricesPayload,
  UpdatePlanItemPayload,
  UpdateTierItemPayload,
} from "../../api/membershipPlanPrices/membershipPlanPrices.types";

// Re-export TierConfig and PlanPricing for backward compatibility
export type { TierConfig, PlanPricing } from "../../hooks/appSettings/useMembershipPlanPrices";

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

  const {
    tiers: apiTiers,
    isLoading,
    isFetching,
    isUpdating,
    updatePrices,
    refetch,
    mapApiTiersToTierConfigs,
    extractLatestTimestamp,
    lastPublishedAt: hookLastPublishedAt,
  } = useMembershipPlanPrices();

  // 1. Derive base tiers directly from API or default fallback (no useEffect needed)
  const baseTiers = useMemo(() => {
    return mapApiTiersToTierConfigs(apiTiers);
  }, [apiTiers, mapApiTiersToTierConfigs]);

  // 2. Track only user-edited values as overrides: key is `${tierId}.${interval}.${field}`
  const [edits, setEdits] = useState<Record<string, number>>({});

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editingComm, setEditingComm] = useState<string | null>(null);

  // 3. Last published timestamp stored locally on publish
  const [localPublishedAt, setLocalPublishedAt] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_published_at`);
  });

  // 4. Derive effective lastPublishedAt without an effect
  const lastPublishedAt = useMemo(() => {
    return (
      localPublishedAt ||
      hookLastPublishedAt ||
      extractLatestTimestamp(apiTiers) ||
      null
    );
  }, [localPublishedAt, hookLastPublishedAt, apiTiers, extractLatestTimestamp]);

  // 5. Derive current display tiers by merging base tiers with user edits
  const currentTiers = useMemo(() => {
    return baseTiers.map((tier) => ({
      ...tier,
      monthly: {
        customerPrice:
          edits[`${tier.id}.monthly.customerPrice`] ??
          tier.monthly.customerPrice,
        defaultComm:
          edits[`${tier.id}.monthly.defaultCommission`] ??
          tier.monthly.defaultComm,
      },
      biAnnually: {
        customerPrice:
          edits[`${tier.id}.biAnnually.customerPrice`] ??
          tier.biAnnually.customerPrice,
        defaultComm:
          edits[`${tier.id}.biAnnually.defaultCommission`] ??
          tier.biAnnually.defaultComm,
      },
      annually: {
        customerPrice:
          edits[`${tier.id}.annually.customerPrice`] ??
          tier.annually.customerPrice,
        defaultComm:
          edits[`${tier.id}.annually.defaultCommission`] ??
          tier.annually.defaultComm,
      },
    }));
  }, [baseTiers, edits]);

  // 6. Compute partial diff payload containing ONLY edited fields
  const pendingDiff = useMemo((): UpdateMembershipPlanPricesPayload | null => {
    const editKeys = Object.keys(edits);
    if (editKeys.length === 0) return null;

    // Group edits by tierId and interval
    const tierMap: Record<
      string,
      Record<string, { customerPrice?: number; defaultCommission?: number }>
    > = {};

    for (const [key, val] of Object.entries(edits)) {
      const [tierId, interval, field] = key.split(".");
      if (!tierMap[tierId]) tierMap[tierId] = {};
      if (!tierMap[tierId][interval]) tierMap[tierId][interval] = {};

      if (field === "customerPrice") {
        tierMap[tierId][interval].customerPrice = val;
      } else if (field === "defaultCommission") {
        tierMap[tierId][interval].defaultCommission = val;
      }
    }

    const intervalToDurationMap: Record<string, string> = {
      monthly: "monthly",
      biAnnually: "six_months",
      annually: "twelve_months",
    };

    const updatedTiers: UpdateTierItemPayload[] = [];

    for (const [tierId, intervals] of Object.entries(tierMap)) {
      const modifiedPlans: UpdatePlanItemPayload[] = [];
      for (const [interval, fields] of Object.entries(intervals)) {
        modifiedPlans.push({
          duration: intervalToDurationMap[interval] || interval,
          ...fields,
        });
      }
      if (modifiedPlans.length > 0) {
        updatedTiers.push({
          tier: tierId,
          plans: modifiedPlans,
        });
      }
    }

    if (updatedTiers.length === 0) return null;

    return {
      data: {
        tiers: updatedTiers,
      },
    };
  }, [edits]);

  const hasChanges = Boolean(
    pendingDiff && pendingDiff.data.tiers && pendingDiff.data.tiers.length > 0,
  );

  const totalChangesCount = useMemo(() => {
    if (!pendingDiff?.data.tiers) return 0;
    return pendingDiff.data.tiers.reduce(
      (sum, tier) => sum + (tier.plans?.length || 0),
      0,
    );
  }, [pendingDiff]);

  const handlePriceChange = (
    tierId: string,
    interval: "monthly" | "biAnnually" | "annually",
    rawVal: string,
  ) => {
    const cleanDigits = rawVal.replace(/\D/g, "");
    const numericVal = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);
    const key = `${tierId}.${interval}.customerPrice`;
    const originalVal =
      baseTiers.find((t) => t.id === tierId)?.[interval].customerPrice ?? 0;

    setEdits((prev) => {
      if (numericVal === originalVal) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: numericVal };
    });
  };

  const handleCommChange = (
    tierId: string,
    interval: "monthly" | "biAnnually" | "annually",
    rawVal: string,
  ) => {
    const cleanDigits = rawVal.replace(/\D/g, "");
    const numericVal = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);
    const key = `${tierId}.${interval}.defaultCommission`;
    const originalVal =
      baseTiers.find((t) => t.id === tierId)?.[interval].defaultComm ?? 0;

    setEdits((prev) => {
      if (numericVal === originalVal) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: numericVal };
    });
  };

  // Reset unsaved changes back to initial server state
  const handleResetChanges = () => {
    setEdits({});
    setSnackBar("Reverted changes to original saved prices", "info");
  };

  // Publish confirmed: send only modified fields to PUT /api/membership-plan-prices
  const handlePublishConfirm = async () => {
    if (!pendingDiff || pendingDiff.data.tiers.length === 0) {
      setSnackBar("No price changes detected to publish", "warning");
      setConfirmModalOpen(false);
      return;
    }

    try {
      await updatePrices(pendingDiff);

      const timestamp = formatLocalDateTime(new Date(), "D MMM YYYY, hh:mm A");
      localStorage.setItem(`${STORAGE_KEY}_published_at`, timestamp);
      setLocalPublishedAt(timestamp);

      // Clear pending edits since server now has the updated data
      setEdits({});
      setConfirmModalOpen(false);
      setSnackBar(
        "Global membership pricing successfully locked & published across the network!",
        "success",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish pricing";
      setSnackBar(msg, "error");
    }
  };

  // Check if a specific plan field has been edited
  const isFieldEdited = (
    tierId: string,
    interval: "monthly" | "biAnnually" | "annually",
    field: "customerPrice" | "defaultCommission",
  ): boolean => {
    return `${tierId}.${interval}.${field}` in edits;
  };

  return (
    <div className="w-full flex flex-col gap-y-4">
      <CustomBox customClasses="p-7 w-full flex flex-col justify-between shadow-xs">
        {/* Top Header & Breadcrumb */}
        <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] tracking-tight">
                Global Membership Plans Configurator
              </h1>
              {isFetching && !isLoading && (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            <p className="text-sm text-[#787571] max-w-3xl leading-relaxed">
              Fixed customer-facing prices for the whole network. Club owners can't change these. Default
              commissions are set per tier and can be negotiated per club.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh pricing data from server"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <div className="bg-[#F4F4F5] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
              <span className="text-[#9CA3AF]">App Settings</span>
              <span className="text-[#9CA3AF]">›</span>
              <span className="text-[#374151] font-semibold">Master Pricing</span>
            </div>
          </div>
        </div>

        {/* Changes Alert Banner */}
        {hasChanges && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                You have unsaved pricing edits in <strong>{totalChangesCount}</strong> plan
                {totalChangesCount > 1 ? "s" : ""}. Click <strong>Lock & Publish</strong> to save to the network.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetChanges}
              className="flex items-center gap-1 px-2.5 py-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100/60 rounded-lg font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Discard Changes</span>
            </button>
          </div>
        )}

        {/* Pricing Matrix / Grid Table */}
        <div className="mt-8 w-full overflow-x-auto rounded-xl border border-[#E5E7EB] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span>Loading latest membership pricing...</span>
              </div>
            </div>
          )}

          <table className="w-full text-left border-collapse min-w-190">
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
              {currentTiers.map((tier) => (
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
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          CUSTOMER PRICE
                        </label>
                        {isFieldEdited(tier.id, "monthly", "customerPrice") && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            EDITED
                          </span>
                        )}
                      </div>
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
                          className={`w-full pl-7 pr-3 py-2 bg-white border rounded-lg text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all ${
                            isFieldEdited(tier.id, "monthly", "customerPrice")
                              ? "border-amber-400 bg-amber-50/30"
                              : "border-[#E5E7EB]"
                          }`}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2.5 px-0.5 min-h-7">
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
                            className={`group flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded transition ${
                              isFieldEdited(tier.id, "monthly", "defaultCommission")
                                ? "bg-amber-100/70 border border-amber-300"
                                : ""
                            }`}
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
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          CUSTOMER PRICE
                        </label>
                        {isFieldEdited(tier.id, "biAnnually", "customerPrice") && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            EDITED
                          </span>
                        )}
                      </div>
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
                          className={`w-full pl-7 pr-3 py-2 bg-white border rounded-lg text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all ${
                            isFieldEdited(tier.id, "biAnnually", "customerPrice")
                              ? "border-amber-400 bg-amber-50/30"
                              : "border-[#E5E7EB]"
                          }`}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2.5 px-0.5 min-h-7">
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
                            className={`group flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded transition ${
                              isFieldEdited(tier.id, "biAnnually", "defaultCommission")
                                ? "bg-amber-100/70 border border-amber-300"
                                : ""
                            }`}
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
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          CUSTOMER PRICE
                        </label>
                        {isFieldEdited(tier.id, "annually", "customerPrice") && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            EDITED
                          </span>
                        )}
                      </div>
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
                          className={`w-full pl-7 pr-3 py-2 bg-white border rounded-lg text-sm font-semibold text-[#1C1C1C] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all ${
                            isFieldEdited(tier.id, "annually", "customerPrice")
                              ? "border-amber-400 bg-amber-50/30"
                              : "border-[#E5E7EB]"
                          }`}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2.5 px-0.5 min-h-7">
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
                            className={`group flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded transition ${
                              isFieldEdited(tier.id, "annually", "defaultCommission")
                                ? "bg-amber-100/70 border border-amber-300"
                                : ""
                            }`}
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
            {hasChanges && (
              <button
                type="button"
                onClick={handleResetChanges}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              disabled={!hasChanges || isUpdating}
              onClick={() => setConfirmModalOpen(true)}
              className="bg-primary hover:bg-[#c82333] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-x-2 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Lock className="w-4 h-4 stroke-[2.2]" />
              <span>
                {hasChanges
                  ? `Lock & Publish (${totalChangesCount} change${totalChangesCount > 1 ? "s" : ""})`
                  : "Lock & Publish Global Prices"}
              </span>
            </button>
          </div>
        </div>
      </CustomBox>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl flex flex-col gap-y-4 max-h-[90vh] overflow-y-auto">
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
                    Network-wide price update • Only edited plans will be updated
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

            {/* Changes Summary Preview */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3.5 flex flex-col gap-y-2 text-xs">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                <span>Summary of Changes to Publish</span>
                <span className="font-semibold text-amber-700">
                  {totalChangesCount} modified plan{totalChangesCount > 1 ? "s" : ""}
                </span>
              </div>

              {pendingDiff?.data.tiers.map((tierDiff) => {
                const baseTier = baseTiers.find((t) => t.id === tierDiff.tier);

                return (
                  <div
                    key={tierDiff.tier}
                    className="flex flex-col gap-1 py-1.5 border-b border-amber-200/50 last:border-b-0"
                  >
                    <span className="font-bold text-gray-900 capitalize">
                      {baseTier?.name || tierDiff.tier} Tier
                    </span>
                    <div className="flex flex-col gap-1 pl-2">
                      {tierDiff.plans.map((p) => {
                        const intervalKey =
                          p.duration === "monthly"
                            ? "monthly"
                            : p.duration === "six_months"
                            ? "biAnnually"
                            : "annually";
                        const intervalLabel =
                          p.duration === "monthly"
                            ? "Monthly (1m)"
                            : p.duration === "six_months"
                            ? "Bi-Annually (6m)"
                            : "Annually (12m)";
                        const oldPlan = baseTier ? baseTier[intervalKey] : null;

                        return (
                          <div
                            key={p.duration}
                            className="bg-white/80 p-2 rounded-lg border border-amber-200/60 flex flex-col gap-0.5 text-[11px]"
                          >
                            <span className="font-semibold text-gray-700">
                              {intervalLabel}
                            </span>
                            {p.customerPrice !== undefined && (
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <span className="text-gray-500">Price:</span>
                                <span className="line-through text-gray-400">
                                  ₹{formatCurrency(oldPlan?.customerPrice ?? 0)}
                                </span>
                                <span>→</span>
                                <span className="text-emerald-700 font-bold">
                                  ₹{formatCurrency(p.customerPrice)}
                                </span>
                              </div>
                            )}
                            {p.defaultCommission !== undefined && (
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <span className="text-gray-500">Commission:</span>
                                <span className="line-through text-gray-400">
                                  ₹{formatCurrency(oldPlan?.defaultComm ?? 0)}
                                </span>
                                <span>→</span>
                                <span className="text-blue-700 font-bold">
                                  ₹{formatCurrency(p.defaultCommission)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                disabled={isUpdating}
                onClick={handlePublishConfirm}
                className="bg-primary hover:bg-[#c82333] text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
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

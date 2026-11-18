/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
  XCircle,
} from "lucide-react";
import { Dialog } from "@mui/material";
import CustomBox from "../../atoms/customBox/CustomBox";
import ActivityIndicator from "../../atoms/activityIndicator/ActivityIndicator";
import DateRangeFilterPopover from "../../atoms/dateFilter/DateRangeFilterPopover";
import { getHumanReadableDateRangeLabel } from "../../atoms/dateFilter/dateFilter.utils";
import {
  useClubCheckins,
  useClubMemberships,
  useClubOwnerTrials,
} from "../../../hooks/clubOwner/useClubOwner";
import type {
  ClubCheckinRecord,
  ClubMembershipRecord,
  ClubTrialRecord,
} from "../../../api/clubRequest/clubRequest.types";
import {
  formatLocalDate,
  formatLocalDateTime,
  toLocalDate,
} from "../../../utility/dayjs";

export interface ClubRecordsTabsProps {
  clubOwnerDocumentId: string;
  clubName?: string;
  className?: string;
}

type TabType = "memberships" | "checkins" | "trials";

const ITEMS_PER_PAGE = 10;

// Format plan label helper
const formatPlanName = (plan?: string): string => {
  if (!plan) return "Standard Plan";
  const p = plan.toLowerCase().trim();
  if (p === "twelve_months" || p === "12months" || p === "annual" || p === "one_year") {
    return "12 Months (Annual)";
  }
  if (p === "six_months" || p === "sixmonths" || p === "6months") {
    return "6 Months";
  }
  if (p === "monthly" || p === "one_month" || p === "1month") {
    return "Monthly";
  }
  if (p === "three_months" || p === "quarterly" || p === "3months") {
    return "3 Months";
  }
  return plan.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Format currency amount helper
const formatAmount = (amount?: number | string): string => {
  if (amount === undefined || amount === null) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString("en-IN")}`;
};

// Date range checker (YYYY-MM-DD format)
const isWithinDateRange = (
  dateStr?: string,
  start?: string,
  end?: string,
): boolean => {
  if (!start && !end) return true;
  if (!dateStr) return false;
  const target = toLocalDate(dateStr).format("YYYY-MM-DD");
  if (!target || target === "Invalid Date") return false;
  if (start && target < start) return false;
  if (end && target > end) return false;
  return true;
};

// Status badge helper for Memberships
const getMembershipStatusBadge = (status?: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "active") {
    return {
      label: "Active",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  if (s === "expired") {
    return {
      label: "Expired",
      bg: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
      icon: Clock,
    };
  }
  if (s === "cancelled" || s === "canceled") {
    return {
      label: "Cancelled",
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      icon: XCircle,
    };
  }
  return {
    label: status ? status.replace(/_/g, " ").toUpperCase() : "UNKNOWN",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  };
};

// Badge helper for Checkin pass types
const getCheckinTypeBadge = (checkinType?: string | null) => {
  const t = (checkinType || "").toLowerCase().trim();
  if (t === "trial") {
    return {
      label: "Trial Pass",
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    };
  }
  if (t === "membership") {
    return {
      label: "Membership Pass",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  }
  return {
    label: checkinType ? checkinType.toUpperCase() : "GENERAL PASS",
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
  };
};

// Badge helper for Trial status
const getTrialStatusBadge = (status?: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "no-show" || s === "noshow") {
    return {
      label: "No-Show",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertCircle,
    };
  }
  if (s === "cancelled" || s === "canceled") {
    return {
      label: "Cancelled",
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      icon: XCircle,
    };
  }
  if (s === "completed" || s === "attended") {
    return {
      label: "Completed",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      icon: CheckCircle2,
    };
  }
  if (s === "active" || s === "booked" || s === "confirmed") {
    return {
      label: "Booked",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  return {
    label: status ? status.replace(/_/g, " ").toUpperCase() : "TRIAL PASS",
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
    icon: Sparkles,
  };
};

// Client avatar helper with image error fallback
const ClientAvatar: React.FC<{
  name?: string;
  url?: string;
  onClick?: () => void;
}> = ({ name, url, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const initial = (name || "C").trim().charAt(0).toUpperCase();

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={name || "Client"}
        onError={() => setImgError(true)}
        onClick={onClick}
        className={`w-9 h-9 rounded-full object-cover border border-gray-200 bg-gray-100 shrink-0 ${
          onClick ? "cursor-pointer hover:ring-2 hover:ring-primary/40 transition" : ""
        }`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={`w-9 h-9 rounded-full bg-linear-to-br from-red-100 to-rose-200 text-primary font-bold text-xs flex items-center justify-center border border-red-200 shrink-0 ${
        onClick ? "cursor-pointer hover:ring-2 hover:ring-primary/40 transition" : ""
      }`}
    >
      {initial}
    </div>
  );
};

const ClubRecordsTabs: React.FC<ClubRecordsTabsProps> = ({
  clubOwnerDocumentId,
  clubName,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("memberships");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Per-tab pagination states (0-indexed)
  const [membershipsPage, setMembershipsPage] = useState(0);
  const [checkinsPage, setCheckinsPage] = useState(0);
  const [trialsPage, setTrialsPage] = useState(0);

  // Lightbox preview for client selfie
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Queries
  const {
    memberships,
    loading: loadingMemberships,
    isFetching: isFetchingMemberships,
    refetch: refetchMemberships,
  } = useClubMemberships(clubOwnerDocumentId);

  const {
    checkins,
    loading: loadingCheckins,
    isFetching: isFetchingCheckins,
    refetch: refetchCheckins,
  } = useClubCheckins(clubOwnerDocumentId);

  const {
    trials,
    loading: loadingTrials,
    isFetching: isFetchingTrials,
    refetch: refetchTrials,
  } = useClubOwnerTrials(clubOwnerDocumentId);

  // Active date filter label
  const activeDateLabel = getHumanReadableDateRangeLabel(startDate, endDate);

  // Filtered Gym Memberships
  const filteredMemberships = (memberships || []).filter((item: ClubMembershipRecord) => {
    // Date filter matches either startDate or endDate
    const matchesDate =
      isWithinDateRange(item.startDate, startDate, endDate) ||
      isWithinDateRange(item.endDate, startDate, endDate);
    if (!matchesDate) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (item.clientName || "").toLowerCase().includes(q);
    const idMatch = (item.membershipId || "").toLowerCase().includes(q);
    const planMatch = (item.plan || "").toLowerCase().includes(q);
    const statusMatch = (item.membershipStatus || "").toLowerCase().includes(q);
    return nameMatch || idMatch || planMatch || statusMatch;
  });

  // Filtered Checkins
  const filteredCheckins = (checkins || []).filter((item: ClubCheckinRecord) => {
    const rawCheckinDate = item.checkinTime || item.createdAt;
    const matchesDate = isWithinDateRange(rawCheckinDate, startDate, endDate);
    if (!matchesDate) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (item.clientName || "").toLowerCase().includes(q);
    const typeMatch = (item.checkintype || (item as any).checkinType || "")
      .toLowerCase()
      .includes(q);
    return nameMatch || typeMatch;
  });

  // Filtered Trials
  const filteredTrials = (trials || []).filter((item: ClubTrialRecord) => {
    const rawTrialDate = item.trialDate || item.createdAt;
    const matchesDate = isWithinDateRange(rawTrialDate, startDate, endDate);
    if (!matchesDate) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (item.clientName || "").toLowerCase().includes(q);
    const clientIdMatch = (item.clientId || "").toLowerCase().includes(q);
    const statusMatch = (item.trialstatus || (item as any).trialStatus || "")
      .toLowerCase()
      .includes(q);
    const genderMatch = (item.gender || "").toLowerCase().includes(q);
    return nameMatch || clientIdMatch || statusMatch || genderMatch;
  });

  // Refresh handler
  const isCurrentTabFetching =
    activeTab === "memberships"
      ? isFetchingMemberships
      : activeTab === "checkins"
        ? isFetchingCheckins
        : isFetchingTrials;

  const handleRefresh = () => {
    if (activeTab === "memberships") refetchMemberships();
    else if (activeTab === "checkins") refetchCheckins();
    else refetchTrials();
  };

  const handleApplyDateFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setMembershipsPage(0);
    setCheckinsPage(0);
    setTrialsPage(0);
  };

  const handleResetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setMembershipsPage(0);
    setCheckinsPage(0);
    setTrialsPage(0);
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    handleResetDateFilter();
  };

  // Pagination slice for Active Tab
  const totalItems =
    activeTab === "memberships"
      ? filteredMemberships.length
      : activeTab === "checkins"
        ? filteredCheckins.length
        : filteredTrials.length;

  const currentPage =
    activeTab === "memberships"
      ? membershipsPage
      : activeTab === "checkins"
        ? checkinsPage
        : trialsPage;

  const setCurrentPage = (page: number) => {
    if (activeTab === "memberships") setMembershipsPage(page);
    else if (activeTab === "checkins") setCheckinsPage(page);
    else setTrialsPage(page);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const paginatedMemberships = filteredMemberships.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const paginatedCheckins = filteredCheckins.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const paginatedTrials = filteredTrials.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <CustomBox customClasses={`p-5 flex flex-col gap-y-4 ${className}`}>
      {/* Top Header Row: Title, Club Subtitle, Refresh & Date Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-divider">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl w-fit flex-wrap">
          {/* Tab 1: Gym Memberships */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("memberships");
              setMembershipsPage(0);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "memberships"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary-text hover:text-black"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Gym Memberships</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "memberships"
                  ? "bg-red-50 text-primary"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {filteredMemberships.length}
            </span>
          </button>

          {/* Tab 2: Check-in Details */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("checkins");
              setCheckinsPage(0);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "checkins"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary-text hover:text-black"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Check-in History</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "checkins"
                  ? "bg-red-50 text-primary"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {filteredCheckins.length}
            </span>
          </button>

          {/* Tab 3: Trial Details */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("trials");
              setTrialsPage(0);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "trials"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary-text hover:text-black"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trial Passes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "trials"
                  ? "bg-red-50 text-primary"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {filteredTrials.length}
            </span>
          </button>
        </div>

        {/* Action Controls: Search, Date Filter Popover, Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "memberships"
                  ? "Search by client, ID, plan..."
                  : activeTab === "checkins"
                    ? "Search by client, pass type..."
                    : "Search by client, client ID, status..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-8.5 pr-7 py-1.5 text-xs bg-white border border-divider rounded-lg focus:outline-none focus:border-primary w-52 sm:w-64 text-black placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(0);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reusable Date Range Filter Popover */}
          <DateRangeFilterPopover
            startDate={startDate}
            endDate={endDate}
            onApply={handleApplyDateFilter}
            onReset={handleResetDateFilter}
          />

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isCurrentTabFetching}
            title="Refresh records"
            className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 text-secondary-text hover:text-black transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium bg-white"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isCurrentTabFetching ? "animate-spin text-primary" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Filter Indicator Bar */}
      {(activeDateLabel || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <span className="font-semibold text-gray-600">Active Filters:</span>
          {activeDateLabel && (
            <span className="inline-flex items-center gap-1 bg-red-50 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
              <Calendar className="w-3 h-3" />
              Date: <strong>{activeDateLabel}</strong>
              <button
                type="button"
                onClick={handleResetDateFilter}
                className="hover:text-red-700 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full font-medium">
              Search: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-black ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="text-primary hover:underline text-[11px] font-semibold ml-auto cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* TAB 1: MEMBERSHIPS CONTENT */}
      {activeTab === "memberships" && (
        <div className="w-full flex flex-col gap-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black">
                Gym Memberships ({filteredMemberships.length})
              </h4>
              <p className="text-xs text-secondary-text mt-0.5">
                Active and historical membership subscriptions purchased at{" "}
                {clubName || "this club"}.
              </p>
            </div>
          </div>

          {loadingMemberships && (memberships || []).length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
              <ActivityIndicator size={36} />
              <p className="text-xs text-secondary-text mt-3">
                Loading club gym memberships...
              </p>
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-primary mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-black">
                No Gym Memberships Found
              </p>
              <p className="text-xs text-secondary-text mt-1 max-w-sm">
                {searchQuery || startDate || endDate
                  ? "No memberships match your filter criteria. Try clearing search or date filters."
                  : "No client memberships have been purchased for this club yet."}
              </p>
              {(searchQuery || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-divider bg-white">
              <table className="w-full text-left text-sm border-collapse min-w-175">
                <thead>
                  <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider font-semibold">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Membership ID</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedMemberships.map(
                    (sub: ClubMembershipRecord, idx: number) => {
                      const badge = getMembershipStatusBadge(
                        sub.membershipStatus,
                      );
                      const BadgeIcon = badge.icon;
                      const planLabel = formatPlanName(sub.plan);
                      const amountStr = formatAmount(sub.amount);
                      const startStr = sub.startDate
                        ? formatLocalDate(sub.startDate, "DD/MM/YYYY")
                        : "-";
                      const endStr = sub.endDate
                        ? formatLocalDate(sub.endDate, "DD/MM/YYYY")
                        : "-";

                      return (
                        <tr
                          key={sub.membershipId || idx}
                          className="hover:bg-gray-50/70 transition"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <ClientAvatar
                                name={sub.clientName}
                                url={sub.selfieUrl}
                                onClick={
                                  sub.selfieUrl
                                    ? () =>
                                        setPreviewPhoto({
                                          url: sub.selfieUrl!,
                                          name: sub.clientName || "Client Photo",
                                        })
                                    : undefined
                                }
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-black text-xs sm:text-sm capitalize">
                                  {sub.clientName || "Unknown Client"}
                                </span>
                                {/* {sub.selfieUrl && (
                                  <span className="text-[10px] text-primary hover:underline cursor-pointer">
                                    View Selfie
                                  </span>
                                )} */}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs font-semibold bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md text-gray-800">
                              {sub.membershipId || "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-black">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-secondary-text" />
                              <span>{planLabel}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {amountStr}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-secondary-text">
                            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {startStr} – {endStr}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                              />
                              <BadgeIcon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHECK-IN DETAILS CONTENT */}
      {activeTab === "checkins" && (
        <div className="w-full flex flex-col gap-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black">
                Check-in History ({filteredCheckins.length})
              </h4>
              <p className="text-xs text-secondary-text mt-0.5">
                Attendance and entry pass scans verified at{" "}
                {clubName || "this club"}.
              </p>
            </div>
          </div>

          {loadingCheckins && (checkins || []).length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
              <ActivityIndicator size={36} />
              <p className="text-xs text-secondary-text mt-3">
                Loading club check-in logs...
              </p>
            </div>
          ) : filteredCheckins.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-black">
                No Check-in Records Found
              </p>
              <p className="text-xs text-secondary-text mt-1 max-w-sm">
                {searchQuery || startDate || endDate
                  ? "No check-ins match your filter criteria. Try clearing search or date filters."
                  : "No check-in actions have been recorded at this club yet."}
              </p>
              {(searchQuery || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-divider bg-white">
              <table className="w-full text-left text-sm border-collapse min-w-160">
                <thead>
                  <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider font-semibold">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Pass Type</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedCheckins.map(
                    (chk: ClubCheckinRecord, idx: number) => {
                      const typeBadge = getCheckinTypeBadge(
                        chk.checkintype || (chk as any).checkinType,
                      );
                      const checkinTimeFormatted = chk.checkinTime
                        ? formatLocalDateTime(
                            chk.checkinTime,
                            "DD MMM YYYY • hh:mm A",
                          )
                        : "-";
                      const createdAtFormatted = chk.createdAt
                        ? formatLocalDateTime(
                            chk.createdAt,
                            "DD MMM YYYY • hh:mm A",
                          )
                        : "-";

                      return (
                        <tr
                          key={chk.createdAt + idx}
                          className="hover:bg-gray-50/70 transition"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <ClientAvatar
                                name={chk.clientName}
                                url={chk.selfieUrl}
                                onClick={
                                  chk.selfieUrl
                                    ? () =>
                                        setPreviewPhoto({
                                          url: chk.selfieUrl!,
                                          name: chk.clientName || "Client Photo",
                                        })
                                    : undefined
                                }
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-black text-xs sm:text-sm capitalize">
                                  {chk.clientName || "Unknown Client"}
                                </span>
                                {/* {chk.selfieUrl && (
                                  <span className="text-[10px] text-primary hover:underline cursor-pointer">
                                    View Selfie
                                  </span>
                                )} */}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeBadge.bg}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${typeBadge.dot}`}
                              />
                              {typeBadge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{checkinTimeFormatted}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-secondary-text">
                            {createdAtFormatted}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRIAL DETAILS CONTENT */}
      {activeTab === "trials" && (
        <div className="w-full flex flex-col gap-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black">
                Trial Passes ({filteredTrials.length})
              </h4>
              <p className="text-xs text-secondary-text mt-0.5">
                Free trial bookings, attendance statuses, and visitor passes for{" "}
                {clubName || "this club"}.
              </p>
            </div>
          </div>

          {loadingTrials && (trials || []).length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
              <ActivityIndicator size={36} />
              <p className="text-xs text-secondary-text mt-3">
                Loading club trial bookings...
              </p>
            </div>
          ) : filteredTrials.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-black">
                No Trial Passes Found
              </p>
              <p className="text-xs text-secondary-text mt-1 max-w-sm">
                {searchQuery || startDate || endDate
                  ? "No trials match your filter criteria. Try clearing search or date filters."
                  : "No free trials have been booked for this club yet."}
              </p>
              {(searchQuery || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-divider bg-white">
              <table className="w-full text-left text-sm border-collapse min-w-185">
                <thead>
                  <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider font-semibold">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Client ID</th>
                    <th className="py-3 px-4">Trial Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Booked On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedTrials.map((tr: ClubTrialRecord, idx: number) => {
                    const badge = getTrialStatusBadge(
                      tr.trialstatus || (tr as any).trialStatus,
                    );
                    const BadgeIcon = badge.icon;
                    const trialDateFormatted = tr.trialDate
                      ? formatLocalDate(tr.trialDate, "DD MMM YYYY")
                      : "-";
                    const bookedOnFormatted = tr.createdAt
                      ? formatLocalDateTime(tr.createdAt, "DD MMM YYYY • hh:mm A")
                      : "-";

                    return (
                      <tr
                        key={tr.documentId || tr.id || idx}
                        className="hover:bg-gray-50/70 transition"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <ClientAvatar
                              name={tr.clientName}
                              url={tr.selfieUrl}
                              onClick={
                                tr.selfieUrl
                                  ? () =>
                                      setPreviewPhoto({
                                        url: tr.selfieUrl!,
                                        name: tr.clientName || "Client Photo",
                                      })
                                  : undefined
                              }
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-black text-xs sm:text-sm capitalize">
                                {tr.clientName || "Unknown Client"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md text-gray-800">
                            {tr.clientId || "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-xs">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{trialDateFormatted}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                            />
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-secondary-text">
                          {bookedOnFormatted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-divider pt-3 text-xs text-secondary-text">
          <span>
            Showing <strong>{startIndex + 1}</strong> to{" "}
            <strong>{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong>{" "}
            of <strong>{totalItems}</strong> records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1.5 rounded-md border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-black px-2">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1.5 rounded-md border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Selfie Preview Modal */}
      <Dialog
        open={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            padding: 2.5,
          },
        }}
      >
        {previewPhoto && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-black">
                  {previewPhoto.name}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={previewPhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition"
                  title="Open original"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="w-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden p-2 border border-gray-200">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.name}
                className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </Dialog>
    </CustomBox>
  );
};

export default ClubRecordsTabs;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import {
  toLocalDate,
  formatLocalDateTime,
  formatLocalFromNow,
  formatLocalDate,
} from "../../../utility/dayjs";
import {
  Clock,
  Filter,
  Search,
  Table as TableIcon,
  ListFilter,
  Edit3,
  Building,
  User,
  Info,
  ArrowRight,
  MinusCircle,
  PlusCircle,
  Minus,
  Plus,
  Calendar,
  MapPin,
  FileCheck2,
  Dumbbell,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Popover } from "@mui/material";
import CustomBox from "../../atoms/customBox/CustomBox";
import ActivityIndicator from "../../atoms/activityIndicator/ActivityIndicator";
import { keepPreviousData } from "@tanstack/react-query";
import type {
  ClubOwnerActivityLog,
  ClubResponse,
} from "../../../api/clubRequest/clubRequest.types";
import { useClubOwnerActivityLogs } from "../../../hooks/clubOwner/useClubOwner";
import { computeItemizedDiff, isListField, matchesLogCategory, parseLogDescription, renderNewValueDiff, renderOldValueDiff } from "./clubOwerLog";

interface ClubOwnerLogsProps {
  owner?: ClubResponse | null;
  customLogs?: ClubOwnerActivityLog[];
}

export const ClubOwnerLogs: React.FC<ClubOwnerLogsProps> = ({
  owner,
  customLogs,
}) => {
  const documentId =
    owner?.documentId || (owner as any)?.clubOwnerDocumentId || "";
  const {
    activityLogs: apiLogs,
    loading: apiLoading,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useClubOwnerActivityLogs(documentId, {
    placeholderData: keepPreviousData,
  });

  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Date range filter state (applied)
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // Temporary date filter state (in popover before applying)
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDateFilter = (event: React.MouseEvent<HTMLElement>) => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setDateFilterAnchorEl(event.currentTarget);
  };

  const handleCloseDateFilter = () => {
    setDateFilterAnchorEl(null);
  };

  const handleApplyDateFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
    setDateFilterAnchorEl(null);
  };

  const handleResetDateFilter = () => {
    setTempStartDate("");
    setTempEndDate("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setDateFilterAnchorEl(null);
  };

  // Human-readable active date filter label
  const activeDateFilterLabel = useMemo(() => {
    if (!startDate && !endDate) return null;
    const todayStr = toLocalDate().format("YYYY-MM-DD");
    if (startDate === todayStr && endDate === todayStr) {
      return "Today";
    }
    const yesterdayStr = toLocalDate().subtract(1, "day").format("YYYY-MM-DD");
    if (startDate === yesterdayStr && endDate === yesterdayStr) {
      return "Yesterday";
    }
    if (
      startDate === toLocalDate().subtract(6, "day").format("YYYY-MM-DD") &&
      endDate === todayStr
    ) {
      return "Last 7 Days";
    }
    if (
      startDate === toLocalDate().subtract(29, "day").format("YYYY-MM-DD") &&
      endDate === todayStr
    ) {
      return "Last 30 Days";
    }
    if (
      startDate === toLocalDate().startOf("month").format("YYYY-MM-DD") &&
      endDate === toLocalDate().endOf("month").format("YYYY-MM-DD")
    ) {
      return "This Month";
    }
    if (startDate && endDate) {
      return `${formatLocalDate(startDate, "DD/MM/YY")} - ${formatLocalDate(endDate, "DD/MM/YY")}`;
    }
    if (startDate) return `From ${formatLocalDate(startDate, "DD/MM/YY")}`;
    if (endDate) return `Until ${formatLocalDate(endDate, "DD/MM/YY")}`;
    return null;
  }, [startDate, endDate]);

  // Determine which logs to display - Real API response ONLY
  const logs: ClubOwnerActivityLog[] = useMemo(() => {
    // 1. Explicit props passed
    if (customLogs && customLogs.length > 0) {
      return customLogs;
    }

    // 2. Real API response only (no dummy fallback logs)
    if (apiLogs && apiLogs.length > 0) {
      return [...apiLogs].sort(
        (a, b) =>
          toLocalDate(b.createdAt).valueOf() - toLocalDate(a.createdAt).valueOf()
      );
    }

    return [];
  }, [customLogs, apiLogs]);

  // Filter logs by createdAt date range
  const dateFilteredLogs = useMemo(() => {
    if (!startDate && !endDate) return logs;

    return logs.filter((log) => {
      if (!log.createdAt) return false;
      const logDate = toLocalDate(log.createdAt);
      if (!logDate.isValid()) return false;

      if (startDate && endDate) {
        const start = toLocalDate(startDate).startOf("day");
        const end = toLocalDate(endDate).endOf("day");
        return (
          (logDate.isAfter(start) || logDate.isSame(start)) &&
          (logDate.isBefore(end) || logDate.isSame(end))
        );
      }

      if (startDate) {
        const start = toLocalDate(startDate).startOf("day");
        return logDate.isAfter(start) || logDate.isSame(start);
      }

      if (endDate) {
        const end = toLocalDate(endDate).endOf("day");
        return logDate.isBefore(end) || logDate.isSame(end);
      }

      return true;
    });
  }, [logs, startDate, endDate]);

  // Filter logs by search & category
  const filteredLogs = useMemo(() => {
    return dateFilteredLogs.filter((log) => {
      // If the log description has (Changed: ...), make sure there is at least 1 actual changed field!
      const parsed = parseLogDescription(log.description);
      if (
        log.description.includes("(Changed:") &&
        parsed.fieldChanges.length === 0
      ) {
        return false;
      }

      const matchesCategory = matchesLogCategory(log, selectedFilter);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.description.toLowerCase().includes(q) ||
        log.entityName.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        parsed.fieldChanges.some(
          (fc) =>
            fc.fieldName.toLowerCase().includes(q) ||
            fc.oldValue.toLowerCase().includes(q) ||
            fc.newValue.toLowerCase().includes(q)
        );

      return matchesCategory && matchesSearch;
    });
  }, [dateFilteredLogs, selectedFilter, searchQuery]);

  // Pagination calculations
  const totalLogs = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safePage, pageSize]);

  // Entity config helper
  const getEntityIcon = (entityName: string) => {
    const e = entityName.toLowerCase();
    if (e.includes("schedul") || e.includes("timing")) return Calendar;
    if (e.includes("locat") || e.includes("address")) return MapPin;
    if (e.includes("doc")) return FileCheck2;
    if (e.includes("facilit") || e.includes("amenit")) return Dumbbell;
    return Building;
  };

  const filterOptions = [
    { key: "ALL", label: "All Updates" },
    { key: "Profile", label: "Profile" },
    { key: "Location", label: "Location" },
    { key: "Facilities", label: "Facilities/Amenities" },
  ];

  return (
    <CustomBox customClasses="p-4 sm:p-5 border border-divider shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
                Club Update Activity Logs
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {filteredLogs.length}{" "}
                {filteredLogs.length === 1 ? "Update" : "Updates"}
              </span>
              {(isFetching || isPlaceholderData) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Updating...</span>
                </span>
              )}
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              Clear visual breakdown showing previous values and new additions made by the owner.
            </p>
          </div>
        </div>

        {/* View toggle, Search, Date Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search updates..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-bg border border-divider rounded-lg focus:outline-none focus:border-primary text-black placeholder:text-secondary-text w-full sm:w-48 transition"
            />
          </div>

          {/* Date Range Filter Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenDateFilter}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${activeDateFilterLabel
                ? "bg-red-50 text-primary border-primary font-semibold shadow-2xs"
                : "bg-bg text-secondary-text border-divider hover:bg-white hover:text-black"
                }`}
            >
              <Calendar
                className={`w-3.5 h-3.5 ${activeDateFilterLabel ? "text-primary" : "text-secondary-text"
                  }`}
              />
              <span>
                {activeDateFilterLabel
                  ? `Date: ${activeDateFilterLabel}`
                  : "Date Filter"}
              </span>
            </button>
            {activeDateFilterLabel && (
              <button
                type="button"
                onClick={handleResetDateFilter}
                title="Clear date filter"
                className="p-1.5 rounded-lg border border-divider bg-bg hover:bg-red-50 hover:text-primary text-secondary-text transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh logs"
            className="p-1.5 rounded-lg border border-divider bg-bg hover:bg-white text-secondary-text hover:text-black transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
          </button>

          <div className="flex items-center bg-bg p-1 rounded-lg border border-divider">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${viewMode === "timeline"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary-text hover:text-black"
                }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${viewMode === "table"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary-text hover:text-black"
                }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
        <span className="text-xs font-medium text-secondary-text flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {filterOptions.map((opt) => {
          const isActive = selectedFilter === opt.key;
          const count =
            opt.key === "ALL"
              ? dateFilteredLogs.length
              : dateFilteredLogs.filter((l) => matchesLogCategory(l, opt.key)).length;

          return (
            <button
              key={opt.key}
              onClick={() => {
                setSelectedFilter(opt.key);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition shrink-0 cursor-pointer border ${isActive
                ? "bg-black text-white border-black shadow-xs"
                : "bg-white text-secondary-text border-divider hover:border-gray-400 hover:text-black"
                }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isActive
                  ? "bg-white/20 text-white"
                  : "bg-bg text-secondary-text"
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {activeDateFilterLabel && (
          <div className="flex items-center gap-1.5 ml-auto shrink-0 bg-red-50 text-primary border border-primary/20 px-2.5 py-1 rounded-full text-xs">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-primary" />
              <span>
                Date: <strong>{activeDateFilterLabel}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={handleResetDateFilter}
              title="Clear date filter"
              className="p-0.5 rounded-full hover:bg-primary/10 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Loading & Empty State */}
      {(apiLoading || isFetching) && logs.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider my-2 p-4">
          <ActivityIndicator size={40} />
          <p className="text-xs text-secondary-text mt-3">Loading club logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider my-2 p-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
            <Info className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-black">
            No Update Logs Found
          </p>
          <p className="text-xs text-secondary-text max-w-sm mt-1">
            {searchQuery || selectedFilter !== "ALL" || startDate || endDate
              ? "No updates match your selected search or filter criteria. Try resetting the filters."
              : "No update actions have been recorded for this club owner yet."}
          </p>
          {(selectedFilter !== "ALL" || searchQuery || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedFilter("ALL");
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
                setTempStartDate("");
                setTempEndDate("");
                setCurrentPage(1);
              }}
              className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          className={`relative transition-opacity duration-200 ${
            isPlaceholderData ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {viewMode === "timeline" ? (
            /* TIMELINE VIEW */
            <div className="relative pl-5 sm:pl-7 mt-3 space-y-5 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-divider">
          {paginatedLogs.map((log, index) => {
            const parsed = parseLogDescription(log.description);
            const EntityIcon = getEntityIcon(log.entityName);
            const formattedDate = formatLocalDateTime(
              log.createdAt,
              "DD MMM YYYY • hh:mm A"
            );
            const relativeTimeStr = formatLocalFromNow(log.createdAt);

            return (
              <div key={log.createdAt + index} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-5 sm:-left-7 top-2 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ring-4 ring-white z-10">
                  <Edit3 className="w-3 h-3" />
                </div>

                {/* Card Container */}
                <div className="bg-bg/60 hover:bg-bg border border-divider rounded-xl p-3.5 sm:p-4 transition-all duration-200 hover:shadow-xs">
                  {/* Card Header Row: actionType, entityName, and createdAt */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Actor Role & Name Badge */}
                      {log.actorRole && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wider ${
                            log.actorType === "admin"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : log.actorType === "client"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <User className="w-3 h-3" />
                          <span>{log.actorRole}</span>
                          {log.actorName && (
                            <span className="font-normal opacity-85">({log.actorName})</span>
                          )}
                        </span>
                      )}

                      {/* actionType */}
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wider bg-blue-50 text-blue-700 border-blue-200">
                        {log.actionType}
                      </span>

                      {/* entityName */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border bg-white border-divider text-black">
                        <EntityIcon className="w-3.5 h-3.5 text-secondary-text" />
                        {log.entityName}
                      </span>
                    </div>

                    {/* createdAt */}
                    <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                      <Clock className="w-3.5 h-3.5 text-secondary-text" />
                      <span className="font-medium text-black">
                        {formattedDate}
                      </span>
                      <span className="text-secondary-text/80 text-[11px] hidden sm:inline">
                        ({relativeTimeStr})
                      </span>
                    </div>
                  </div>

                  {/* Main Description */}
                  <p className="text-xs sm:text-sm font-medium text-black leading-relaxed">
                    {parsed.mainText}
                  </p>

                  {/* RENDER FIELD CHANGES */}
                  {parsed.fieldChanges && parsed.fieldChanges.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {parsed.fieldChanges.map((change, cIdx) => {
                        const isList = isListField(change.fieldName);
                        const itemizedDiff = computeItemizedDiff(
                          change.oldValue,
                          change.newValue,
                          change.fieldName
                        );
                        // Check if ANY item was actually removed
                        const hasActualRemovals =
                          isList && itemizedDiff.removedItems.length > 0;

                        return (
                          <div
                            key={change.fieldName + cIdx}
                            className="p-3 sm:p-3.5 rounded-xl bg-white border border-divider shadow-2xs"
                          >
                            <div className="flex items-center gap-2 mb-2.5">
                              {change.fieldName.toLowerCase().includes("address") ? (
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <SlidersHorizontal className="w-3.5 h-3.5 text-secondary-text" />
                              )}
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
                                Modified Field:
                              </span>
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {change.fieldName}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-2.5 sm:gap-3">
                              {/* LEFT BOX: If items removed -> "Removed (-)" in red. If nothing removed -> "Previous" in neutral slate! */}
                              <div
                                className={`p-3 rounded-lg flex flex-col justify-between ${hasActualRemovals
                                  ? "bg-rose-50/80 border border-rose-200"
                                  : "bg-slate-50/90 border border-slate-200"
                                  }`}
                              >
                                <div
                                  className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-1.5 ${hasActualRemovals
                                    ? "text-rose-700"
                                    : "text-slate-700"
                                    }`}
                                >
                                  {hasActualRemovals ? (
                                    <>
                                      <MinusCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span>Removed (-)</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>Previous</span>
                                    </>
                                  )}
                                </div>
                                <div
                                  className={`p-2.5 rounded ${hasActualRemovals
                                    ? "bg-white/80 border border-rose-200/60"
                                    : "bg-white border border-slate-200/80"
                                    }`}
                                >
                                  {renderOldValueDiff(
                                    change.oldValue,
                                    change.newValue,
                                    change.fieldName
                                  )}
                                </div>
                              </div>

                              {/* Arrow separator */}
                              <div className="flex justify-center text-secondary-text py-1 md:py-0">
                                <div className="w-7 h-7 rounded-full bg-bg border border-divider flex items-center justify-center text-secondary-text shadow-2xs">
                                  <ArrowRight className="w-4 h-4 text-primary" />
                                </div>
                              </div>

                              {/* RIGHT BOX: "Added (+)" if additions, otherwise "Updated" */}
                              <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5">
                                  {isList && itemizedDiff.addedItems.length > 0 ? (
                                    <>
                                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Added (+)</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Updated</span>
                                    </>
                                  )}
                                </div>
                                <div className="bg-white/80 p-2.5 rounded border border-emerald-200/60">
                                  {renderNewValueDiff(
                                    change.oldValue,
                                    change.newValue,
                                    change.fieldName
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Itemized tags ONLY for list fields (like facilities/amenities) */}
                            {itemizedDiff.hasListDiff && (
                              <div className="mt-3 pt-2.5 border-t border-divider flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold text-secondary-text">
                                  Item Details:
                                </span>
                                {itemizedDiff.removedItems.map((item) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-medium border border-rose-300"
                                  >
                                    <Minus className="w-3 h-3 text-rose-600" />
                                    Removed: {item}
                                  </span>
                                ))}
                                {itemizedDiff.addedItems.map((item) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-300"
                                  >
                                    <Plus className="w-3 h-3 text-emerald-600" />
                                    Added: {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW WITH PROPER BEFORE & NOW COLUMNS */
        <div className="mt-3 overflow-x-auto rounded-xl border border-divider">
          <table className="w-full text-left text-sm min-w-175">
            <thead className="bg-bg text-secondary-text font-semibold text-xs uppercase border-b border-divider">
              <tr>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity & Field</th>
                <th className="py-3 px-4 min-w-47.5">Before</th>
                <th className="py-3 px-4 min-w-47.5">Now</th>
                <th className="py-3 px-4 min-w-40">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider bg-white">
              {paginatedLogs.map((log, index) => {
                const parsed = parseLogDescription(log.description);
                const EntityIcon = getEntityIcon(log.entityName);
                const formattedDate = formatLocalDateTime(
                  log.createdAt,
                  "DD MMM YYYY, hh:mm A"
                );
                const relativeTimeStr = formatLocalFromNow(log.createdAt);

                return (
                  <tr
                    key={log.createdAt + index}
                    className="hover:bg-bg/40 transition-colors"
                  >
                    {/* Actor */}
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border tracking-wider ${
                          log.actorType === "admin"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : log.actorType === "client"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <User className="w-3 h-3" />
                        <span>{log.actorRole || "Club Owner"}</span>
                      </span>
                      {log.actorName && (
                        <div className="text-[11px] text-secondary-text mt-1 truncate max-w-[120px]">
                          {log.actorName}
                        </div>
                      )}
                    </td>

                    {/* Action Type */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border tracking-wider bg-blue-50 text-blue-700 border-blue-200">
                        {log.actionType}
                      </span>
                    </td>

                    {/* Entity & Field Name */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg border border-divider text-xs font-medium text-black mb-1">
                        <EntityIcon className="w-3 h-3 text-secondary-text" />
                        {log.entityName}
                      </div>
                      {parsed.fieldChanges.map((fc) => (
                        <div
                          key={fc.fieldName}
                          className="text-[11px] font-mono text-secondary-text"
                        >
                          Field:{" "}
                          <span className="text-black font-semibold">
                            {fc.fieldName}
                          </span>
                        </div>
                      ))}
                    </td>

                    {/* Before */}
                    <td className="py-3.5 px-4 align-top">
                      {parsed.fieldChanges.length > 0 ? (
                        <div className="space-y-1.5">
                          {parsed.fieldChanges.map((fc) => {
                            const isList = isListField(fc.fieldName);
                            const itemDiff = computeItemizedDiff(
                              fc.oldValue,
                              fc.newValue,
                              fc.fieldName
                            );
                            const hasActualRemovals =
                              isList && itemDiff.removedItems.length > 0;

                            return (
                              <div key={fc.fieldName}>
                                {parsed.fieldChanges.length > 1 && (
                                  <span className="text-[10px] uppercase font-mono font-bold text-secondary-text block mb-0.5">
                                    {fc.fieldName}:
                                  </span>
                                )}
                                <div
                                  className={`p-2 rounded text-xs wrap-break-word leading-snug ${hasActualRemovals
                                    ? "bg-rose-50/80 border border-rose-200"
                                    : "bg-slate-50 border border-slate-200"
                                    }`}
                                >
                                  {renderOldValueDiff(
                                    fc.oldValue,
                                    fc.newValue,
                                    fc.fieldName
                                  )}
                                </div>
                                {itemDiff.hasListDiff &&
                                  itemDiff.removedItems.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {itemDiff.removedItems.map((item) => (
                                        <span
                                          key={item}
                                          className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded border border-rose-300"
                                        >
                                          - {item}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-secondary-text italic">
                          -
                        </span>
                      )}
                    </td>

                    {/* Now */}
                    <td className="py-3.5 px-4 align-top">
                      {parsed.fieldChanges.length > 0 ? (
                        <div className="space-y-1.5">
                          {parsed.fieldChanges.map((fc) => {
                            const itemDiff = computeItemizedDiff(
                              fc.oldValue,
                              fc.newValue,
                              fc.fieldName
                            );
                            return (
                              <div key={fc.fieldName}>
                                {parsed.fieldChanges.length > 1 && (
                                  <span className="text-[10px] uppercase font-mono font-bold text-secondary-text block mb-0.5">
                                    {fc.fieldName}:
                                  </span>
                                )}
                                <div className="p-2 rounded bg-emerald-50/80 border border-emerald-200 text-xs wrap-break-word leading-snug">
                                  {renderNewValueDiff(
                                    fc.oldValue,
                                    fc.newValue,
                                    fc.fieldName
                                  )}
                                </div>
                                {itemDiff.hasListDiff &&
                                  itemDiff.addedItems.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {itemDiff.addedItems.map((item) => (
                                        <span
                                          key={item}
                                          className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300"
                                        >
                                          + {item}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-black">
                          {log.description}
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="text-xs font-medium text-black">
                        {formattedDate}
                      </div>
                      <div className="text-[11px] text-secondary-text mt-0.5">
                        {relativeTimeStr}
                      </div>
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
      {totalLogs > 0 && (
        <div className="mt-4 pt-3.5 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Summary & Per-Page Selector */}
          <div className="flex flex-wrap items-center gap-3 text-secondary-text">
            <span>
              Showing{" "}
              <strong className="text-black font-semibold">
                {(safePage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-black font-semibold">
                {Math.min(safePage * pageSize, totalLogs)}
              </strong>{" "}
              of{" "}
              <strong className="text-black font-semibold">{totalLogs}</strong>{" "}
              {totalLogs === 1 ? "update" : "updates"}
            </span>

            {totalLogs > 5 && (
              <div className="flex items-center gap-1.5 pl-2.5 border-l border-divider">
                <span className="text-[11px] text-secondary-text">Per page:</span>
                {[5, 10, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${pageSize === size
                      ? "bg-primary text-white"
                      : "bg-bg text-secondary-text hover:text-black hover:bg-slate-200"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-divider text-xs font-medium text-black bg-white hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1
                  )
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((pageItem, idx) => {
                    if (pageItem === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-secondary-text"
                        >
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(pageItem);
                    const isCurrent = safePage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${isCurrent
                          ? "bg-primary text-white shadow-2xs"
                          : "text-secondary-text hover:text-black hover:bg-bg border border-transparent hover:border-divider"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-divider text-xs font-medium text-black bg-white hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
      {/* Date Range Filter Popover */}
      <Popover
        open={Boolean(dateFilterAnchorEl)}
        anchorEl={dateFilterAnchorEl}
        onClose={handleCloseDateFilter}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              mt: 1.5,
              width: 320,
              p: 2.5,
              border: "1px solid #E5E7EB",
            },
          },
        }}
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-gray-900">
                Filter by Log Date
              </span>
            </div>
            {(tempStartDate || tempEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setTempStartDate("");
                  setTempEndDate("");
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                {
                  label: "Today",
                  getRange: () => ({
                    start: toLocalDate().format("YYYY-MM-DD"),
                    end: toLocalDate().format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "Yesterday",
                  getRange: () => ({
                    start: toLocalDate().subtract(1, "day").format("YYYY-MM-DD"),
                    end: toLocalDate().subtract(1, "day").format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "Last 7 Days",
                  getRange: () => ({
                    start: toLocalDate().subtract(6, "day").format("YYYY-MM-DD"),
                    end: toLocalDate().format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "Last 30 Days",
                  getRange: () => ({
                    start: toLocalDate().subtract(29, "day").format("YYYY-MM-DD"),
                    end: toLocalDate().format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "This Month",
                  getRange: () => ({
                    start: toLocalDate().startOf("month").format("YYYY-MM-DD"),
                    end: toLocalDate().endOf("month").format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "All Time",
                  getRange: () => ({
                    start: "",
                    end: "",
                  }),
                },
              ].map((preset) => {
                const range = preset.getRange();
                const isSelected =
                  tempStartDate === range.start && tempEndDate === range.end;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTempStartDate(range.start);
                      setTempEndDate(range.end);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border text-left ${isSelected
                      ? "bg-red-50 text-primary border-primary font-semibold"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Custom Range
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-600 font-medium">
                  From:
                </span>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-600 font-medium">To:</span>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCloseDateFilter}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyDateFilter}
              className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Popover>
    </CustomBox>
  );
};

export default ClubOwnerLogs;

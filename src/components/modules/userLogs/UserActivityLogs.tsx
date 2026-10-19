/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Clock,
  Filter,
  Search,
  Table as TableIcon,
  ListFilter,
  Building,
  Info,
  RefreshCw,
  MapPin,
  CreditCard,
  User,
  Activity,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import CustomBox from "../../atoms/customBox/CustomBox";
import ActivityIndicator from "../../atoms/activityIndicator/ActivityIndicator";
import type { ClientActivityLog } from "../../../api/client/client.types";
import { useClientActivityLogs } from "../../../hooks/client/useClient";

dayjs.extend(relativeTime);

export interface UserActivityLogsProps {
  docId?: string;
  clientName?: string;
  customLogs?: ClientActivityLog[];
}

// Category detection helpers
export const isCheckinLog = (log: ClientActivityLog): boolean => {
  const entity = (log.entityName || "").toLowerCase();
  const action = (log.actionType || "").toLowerCase();
  const desc = (log.description || "").toLowerCase();
  return (
    entity.includes("checkin") ||
    entity.includes("check-in") ||
    action.includes("checkin") ||
    action.includes("check-in") ||
    desc.includes("checked in") ||
    desc.includes("checkin") ||
    desc.includes("check-in")
  );
};

export const isMembershipLog = (log: ClientActivityLog): boolean => {
  const entity = (log.entityName || "").toLowerCase();
  const action = (log.actionType || "").toLowerCase();
  const desc = (log.description || "").toLowerCase();
  return (
    entity.includes("member") ||
    entity.includes("subscri") ||
    entity.includes("plan") ||
    action.includes("member") ||
    action.includes("subscri") ||
    action.includes("plan") ||
    desc.includes("member") ||
    desc.includes("subscri") ||
    desc.includes("plan")
  );
};

// Category matching helper
const matchesCategory = (log: ClientActivityLog, category: string): boolean => {
  if (category === "ALL") return true;
  if (category === "checkin") return isCheckinLog(log);
  if (category === "membership") return isMembershipLog(log);
  return true;
};

// Action badge styling helper
const getActionBadge = (actionType: string) => {
  const a = (actionType || "").toLowerCase();
  if (a.includes("checkin") || a.includes("in")) {
    return {
      label: actionType.toUpperCase(),
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  if (a.includes("checkout") || a.includes("out")) {
    return {
      label: actionType.toUpperCase(),
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: LogOut,
    };
  }
  if (a.includes("subscri") || a.includes("plan")) {
    return {
      label: actionType.toUpperCase(),
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      icon: CreditCard,
    };
  }
  if (a.includes("update") || a.includes("edit")) {
    return {
      label: actionType.toUpperCase(),
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      icon: SlidersHorizontal,
    };
  }
  return {
    label: actionType.toUpperCase() || "ACTIVITY",
    bg: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: Activity,
  };
};

// Entity icon helper
const getEntityIcon = (entityName: string) => {
  const e = (entityName || "").toLowerCase();
  if (e.includes("checkin")) return MapPin;
  if (e.includes("subscri") || e.includes("plan")) return CreditCard;
  if (e.includes("profile") || e.includes("user")) return User;
  if (e.includes("club")) return Building;
  return Activity;
};

// Parse changed block if present in description (e.g. "(Changed: field: 'old' -> 'new')")
const parseDescriptionDetails = (desc: string) => {
  if (!desc) return { mainText: "", fieldChanges: [] };

  const changedBlockMatch = desc.match(/\(Changed:\s*(.+)\)$/is);
  if (changedBlockMatch) {
    const mainText = desc.replace(changedBlockMatch[0], "").trim();
    const changedContent = changedBlockMatch[1];
    const quotedPattern = /([\w]+):\s*'([^']*)'\s*->\s*'([^']*)'/g;
    const matches = [...changedContent.matchAll(quotedPattern)];

    if (matches.length > 0) {
      const fieldChanges = matches.map((m) => ({
        fieldName: m[1].trim(),
        oldValue: m[2].trim(),
        newValue: m[3].trim(),
      }));
      return { mainText: mainText || "Updated details", fieldChanges };
    }
  }

  return { mainText: desc, fieldChanges: [] };
};

export const UserActivityLogs: React.FC<UserActivityLogsProps> = ({
  docId,
  clientName: _clientName,
  customLogs,
}) => {
  const documentId = docId || "";
  const { activityLogs: apiLogs, loading: apiLoading, refetch } =
    useClientActivityLogs(documentId);

  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Only include Check-ins and Membership changes
  const logs: ClientActivityLog[] = useMemo(() => {
    const raw =
      customLogs && customLogs.length > 0 ? customLogs : apiLogs || [];

    const filtered = raw.filter(
      (log) => isCheckinLog(log) || isMembershipLog(log)
    );

    return [...filtered].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
  }, [customLogs, apiLogs]);

  // Filter logs by category and search
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesCat = matchesCategory(log, selectedFilter);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.description || "").toLowerCase().includes(q) ||
        (log.entityName || "").toLowerCase().includes(q) ||
        (log.actionType || "").toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [logs, selectedFilter, searchQuery]);

  // Pagination calculations
  const totalLogs = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safePage, pageSize]);

  const filterOptions = [
    { key: "ALL", label: "All Logs" },
    { key: "checkin", label: "Check-in Times" },
    { key: "membership", label: "Membership Changes" },
  ];

  return (
    <CustomBox customClasses="p-4 sm:p-5 border border-divider shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
                User Activity Logs
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {filteredLogs.length}{" "}
                {filteredLogs.length === 1 ? "Record" : "Records"}
              </span>
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              Live tracking for user check-in times and membership changes.
            </p>
          </div>
        </div>

        {/* View toggle, Search, & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-bg border border-divider rounded-lg focus:outline-none focus:border-primary text-black placeholder:text-secondary-text w-full sm:w-48 transition"
            />
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh logs"
            className="p-1.5 rounded-lg border border-divider bg-bg hover:bg-white text-secondary-text hover:text-black transition cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${apiLoading ? "animate-spin text-primary" : ""}`}
            />
          </button>

          <div className="flex items-center bg-bg p-1 rounded-lg border border-divider">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-white text-primary shadow-xs"
                  : "text-secondary-text hover:text-black"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === "table"
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
              ? logs.length
              : logs.filter((l) => matchesCategory(l, opt.key)).length;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSelectedFilter(opt.key);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition shrink-0 cursor-pointer border ${
                isActive
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-white text-secondary-text border-divider hover:border-gray-400 hover:text-black"
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-bg text-secondary-text"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading & Empty State */}
      {apiLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider my-2 p-4">
          <ActivityIndicator size={40} />
          <p className="text-xs text-secondary-text mt-3">Loading user activity logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider my-2 p-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
            <Info className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-black">
            No User Activity Logs Found
          </p>
          <p className="text-xs text-secondary-text max-w-sm mt-1">
            {searchQuery || selectedFilter !== "ALL"
              ? "No activities match your selected search or filter criteria. Try resetting the filters."
              : "No activity logs have been recorded for this user yet."}
          </p>
        </div>
      ) : viewMode === "timeline" ? (
        /* TIMELINE VIEW */
        <div className="relative pl-5 sm:pl-7 mt-3 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-divider">
          {paginatedLogs.map((log, index) => {
            const badge = getActionBadge(log.actionType);
            const EntityIcon = getEntityIcon(log.entityName);
            const formattedDate = dayjs(log.createdAt).format(
              "DD MMM YYYY • hh:mm A"
            );
            const relativeTimeStr = dayjs(log.createdAt).fromNow();
            const parsed = parseDescriptionDetails(log.description);

            return (
              <div key={log.createdAt + index} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-5 sm:-left-7 top-2 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ring-4 ring-white z-10">
                  <badge.icon className="w-3 h-3" />
                </div>

                {/* Card Container */}
                <div className="bg-bg/60 hover:bg-bg border border-divider rounded-xl p-3.5 sm:p-4 transition-all duration-200 hover:shadow-xs">
                  {/* Card Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Action Type Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wider ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>

                      {/* Entity Name Badge */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border bg-white border-divider text-black">
                        <EntityIcon className="w-3.5 h-3.5 text-secondary-text" />
                        {log.entityName}
                      </span>
                    </div>

                    {/* Date & Time */}
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
                  <div className="text-xs sm:text-sm font-semibold text-black leading-relaxed">
                    {parsed.mainText}
                  </div>

                  {/* Prominent Check-in Time tag if check-in */}
                  {isCheckinLog(log) && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Check-in Time:</span>
                      <strong className="font-semibold text-emerald-900">
                        {dayjs(log.createdAt).format("hh:mm A, DD MMM YYYY")}
                      </strong>
                    </div>
                  )}

                  {/* If there are field diffs in description */}
                  {parsed.fieldChanges && parsed.fieldChanges.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {parsed.fieldChanges.map((change, cIdx) => (
                        <div
                          key={change.fieldName + cIdx}
                          className="p-3 rounded-lg bg-white border border-divider"
                        >
                          <div className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider mb-2">
                            Field:{" "}
                            <span className="text-black font-mono">
                              {change.fieldName}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
                            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-800">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                                Previous
                              </span>
                              {change.oldValue}
                            </div>
                            <div className="flex justify-center text-secondary-text">
                              <ArrowRight className="w-4 h-4 text-primary" />
                            </div>
                            <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                              <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">
                                Updated
                              </span>
                              {change.newValue}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="mt-3 overflow-x-auto rounded-xl border border-divider">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-bg text-secondary-text font-semibold text-xs uppercase border-b border-divider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 min-w-[220px]">Description</th>
                <th className="py-3 px-4 min-w-[160px]">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider bg-white">
              {paginatedLogs.map((log, index) => {
                const badge = getActionBadge(log.actionType);
                const EntityIcon = getEntityIcon(log.entityName);
                const formattedDate = dayjs(log.createdAt).format(
                  "DD MMM YYYY, hh:mm A"
                );
                const relativeTimeStr = dayjs(log.createdAt).fromNow();

                return (
                  <tr
                    key={log.createdAt + index}
                    className="hover:bg-bg/40 transition-colors"
                  >
                    {/* Action */}
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border tracking-wider ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg border border-divider text-xs font-medium text-black">
                        <EntityIcon className="w-3 h-3 text-secondary-text" />
                        {log.entityName}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="text-xs font-medium text-black break-words leading-relaxed">
                        {log.description}
                      </div>
                      {isCheckinLog(log) && (
                        <div className="text-[11px] font-medium text-emerald-700 mt-1 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> Check-in:{" "}
                          <strong className="font-semibold">
                            {dayjs(log.createdAt).format("hh:mm A, DD MMM YYYY")}
                          </strong>
                        </div>
                      )}
                    </td>

                    {/* Date & Time */}
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
              {totalLogs === 1 ? "activity" : "activities"}
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
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                      pageSize === size
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
                        className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                          isCurrent
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
    </CustomBox>
  );
};

export default UserActivityLogs;

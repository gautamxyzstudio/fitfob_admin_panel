import React, { useState } from "react";
import { Popover } from "@mui/material";
import { Calendar, X } from "lucide-react";
import { toLocalDate } from "../../../utility/dayjs";
import { getHumanReadableDateRangeLabel } from "./dateFilter.utils";

export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
  onReset: () => void;
  className?: string;
  buttonLabel?: string;
}

const DateRangeFilterPopover: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onApply,
  onReset,
  className = "",
  buttonLabel = "Date Filter",
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const activeLabel = getHumanReadableDateRangeLabel(startDate, endDate);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onApply(tempStart, tempEnd);
    setAnchorEl(null);
  };

  const handleReset = () => {
    setTempStart("");
    setTempEnd("");
    onReset();
    setAnchorEl(null);
  };

  const PRESETS = [
    {
      label: "Today",
      getRange: () => {
        const d = toLocalDate().format("YYYY-MM-DD");
        return { start: d, end: d };
      },
    },
    {
      label: "Yesterday",
      getRange: () => {
        const d = toLocalDate().subtract(1, "day").format("YYYY-MM-DD");
        return { start: d, end: d };
      },
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
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
          activeLabel
            ? "bg-red-50 text-primary border-primary font-semibold shadow-2xs"
            : "bg-white text-secondary-text border-divider hover:bg-gray-50 hover:text-black"
        }`}
      >
        <Calendar
          className={`w-3.5 h-3.5 ${activeLabel ? "text-primary" : "text-secondary-text"}`}
        />
        <span>{activeLabel ? `Date: ${activeLabel}` : buttonLabel}</span>
      </button>

      {activeLabel && (
        <button
          type="button"
          onClick={handleReset}
          title="Clear date filter"
          className="p-1.5 rounded-lg border border-divider bg-white hover:bg-red-50 hover:text-primary text-secondary-text transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 3,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #E5E7EB",
            marginTop: 1,
            overflow: "hidden",
          },
        }}
      >
        <div className="p-4 w-72 flex flex-col gap-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Filter by Date</span>
            </div>
            {(tempStart || tempEnd) && (
              <button
                type="button"
                onClick={() => {
                  setTempStart("");
                  setTempEnd("");
                }}
                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((preset) => {
                const range = preset.getRange();
                const isSelected =
                  tempStart === range.start && tempEnd === range.end;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTempStart(range.start);
                      setTempEnd(range.end);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border text-left ${
                      isSelected
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
                <span className="text-[11px] text-gray-600 font-medium">From:</span>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-600 font-medium">To:</span>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default DateRangeFilterPopover;

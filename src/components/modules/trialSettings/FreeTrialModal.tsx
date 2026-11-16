import React, { useState, useMemo } from "react";
import {
  Dialog,
  Switch,
} from "@mui/material";
import {
  X,
  Minus,
  Plus,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { ParsedScheduling } from "../../../utility/utili";
import type { TrialSettings } from "../../../api/trialSettings/trialSettings.types";
import { useTrialSettings } from "../../../hooks/trialSettings/useTrialSettings";

interface FreeTrialModalProps {
  open: boolean;
  onClose: () => void;
  clubOwnerDocumentId: string;
  clubName?: string;
  schedulingData?: ParsedScheduling;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon", full: "Monday" },
  { key: "tuesday", label: "Tue", full: "Tuesday" },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday", label: "Thu", full: "Thursday" },
  { key: "friday", label: "Fri", full: "Friday" },
  { key: "saturday", label: "Sat", full: "Saturday" },
  { key: "sunday", label: "Sun", full: "Sunday" },
];

/**
 * Pure helper to extract the club's closing time from scheduling data without manual useMemo.
 */
const getClosingTime = (schedulingData?: ParsedScheduling): string => {
  if (schedulingData?.scheduleItems) {
    for (const item of schedulingData.scheduleItems) {
      if (item.isOpen) {
        if (item.closingTime) {
          return item.closingTime;
        }
        if (item.timeStr && item.timeStr.includes("-")) {
          const parts = item.timeStr.split("-");
          return parts[parts.length - 1].trim();
        }
      }
    }
  }
  return "10:00 PM";
};

interface FreeTrialContentProps {
  initialSettings: TrialSettings;
  clubName?: string;
  schedulingData?: ParsedScheduling;
  isUpdating: boolean;
  onSave: (payload: TrialSettings) => Promise<void>;
  onClose: () => void;
}

const FreeTrialContent: React.FC<FreeTrialContentProps> = ({
  initialSettings,
  clubName,
  schedulingData,
  isUpdating,
  onSave,
  onClose,
}) => {
  // Initialize state directly from props - no useEffect with setState required!
  const [isTrialEnabled, setIsTrialEnabled] = useState<boolean>(
    Boolean(initialSettings.isTrialEnabled),
  );
  const [dailyTrialLimit, setDailyTrialLimit] = useState<number>(
    typeof initialSettings.dailyTrialLimit === "number"
      ? initialSettings.dailyTrialLimit
      : 6,
  );
  const [advanceBookingWindow, setAdvanceBookingWindow] = useState<string>(
    "Today and tomorrow",
  );

  // Check if form has unsaved modifications
  const hasChanges = useMemo(() => {
    const origEnabled = Boolean(initialSettings.isTrialEnabled);
    const origLimit =
      typeof initialSettings.dailyTrialLimit === "number"
        ? initialSettings.dailyTrialLimit
        : 6;
    return isTrialEnabled !== origEnabled || dailyTrialLimit !== origLimit;
  }, [initialSettings, isTrialEnabled, dailyTrialLimit]);

  // Stepper handlers
  const handleDecrement = () => {
    setDailyTrialLimit((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setDailyTrialLimit((prev) => prev + 1);
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setDailyTrialLimit(1);
    } else {
      setDailyTrialLimit(Math.max(1, val));
    }
  };

  // Extract closing time string directly via pure helper
  const closingTimeStr = getClosingTime(schedulingData);

  // Discard changes
  const handleDiscard = () => {
    setIsTrialEnabled(Boolean(initialSettings.isTrialEnabled));
    setDailyTrialLimit(
      typeof initialSettings.dailyTrialLimit === "number"
        ? initialSettings.dailyTrialLimit
        : 6,
    );
    onClose();
  };

  // Submit changes
  const handleSubmit = async () => {
    await onSave({
      isTrialEnabled,
      dailyTrialLimit,
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Free Trial Configuration
              </h3>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  isTrialEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {isTrialEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              {clubName
                ? `Manage 1-day free pass program and capacity limits for ${clubName}`
                : "Manage 1-day free pass program and capacity limits"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Trial program */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-6 shadow-xs">
            <div>
              <h4 className="text-base font-bold text-gray-900 tracking-tight">
                Trial program
              </h4>

              {/* Allow Free Trials Toggle */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">
                    Allow free trials at this club
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    When off, the trial banner is hidden for this club in the
                    customer app.
                  </p>
                </div>
                <Switch
                  checked={isTrialEnabled}
                  onChange={(e) => setIsTrialEnabled(e.target.checked)}
                  sx={{
                    width: 48,
                    height: 28,
                    padding: 0,
                    display: "flex",
                    "& .MuiSwitch-switchBase": {
                      padding: "3px",
                      "&.Mui-checked": {
                        transform: "translateX(20px)",
                        color: "#fff",
                        "& + .MuiSwitch-track": {
                          backgroundColor: "#e23744 !important",
                          opacity: 1,
                        },
                      },
                    },
                    "& .MuiSwitch-thumb": {
                      width: 22,
                      height: 22,
                      boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.15)",
                    },
                    "& .MuiSwitch-track": {
                      borderRadius: 14,
                      backgroundColor: "#D1D5DB",
                      opacity: 1,
                    },
                  }}
                />
              </div>
            </div>

            {/* Maximum daily trial capacity */}
            <div className="pt-5 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900 block">
                Maximum daily trial capacity
              </span>

              <div className="flex items-center gap-3 mt-3">
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50/50 p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={dailyTrialLimit <= 1 || !isTrialEnabled}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={dailyTrialLimit}
                    disabled={!isTrialEnabled}
                    onChange={handleCapacityChange}
                    className="w-12 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={!isTrialEnabled}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  guests per day
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 mt-2.5 leading-relaxed">
                Keeps the floor from getting crowded. Once today is full, new
                bookings roll over to the next available day.
              </p>
            </div>
          </div>

          {/* Card 2: Availability */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-6 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-gray-900 tracking-tight">
                  Availability
                </h4>
                <span className="text-[11px] text-gray-400 font-medium">
                  From club schedule
                </span>
              </div>

              {/* Days open for trials */}
              <div className="mt-4">
                <span className="text-sm font-semibold text-gray-900 block">
                  Days open for trials
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
                  {DAYS_OF_WEEK.map((d) => {
                    const scheduleItem = schedulingData?.scheduleItems?.find(
                      (i) => i.day.toLowerCase() === d.key,
                    );
                    const isOpen = scheduleItem ? scheduleItem.isOpen : true;
                    return (
                      <div
                        key={d.key}
                        title={`${d.full}: ${
                          scheduleItem?.timeStr || (isOpen ? "Open" : "Closed")
                        }`}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition select-none ${
                          isOpen && isTrialEnabled
                            ? "border-[#e23744] text-[#e23744] bg-red-50/40 shadow-2xs"
                            : "border-gray-200 text-gray-400 bg-gray-50/70 opacity-60"
                        }`}
                      >
                        {d.label}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] sm:text-xs text-gray-500 mt-2.5 leading-relaxed">
                  Switch off peak days (e.g. weekends) to keep regulars
                  comfortable.
                </p>
              </div>
            </div>

            {/* Advance booking window */}
            <div className="pt-5 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900 block">
                Advance booking window
              </span>

              <div className="relative mt-2.5">
                <select
                  value={advanceBookingWindow}
                  disabled={!isTrialEnabled}
                  onChange={(e) => setAdvanceBookingWindow(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
                >
                  <option value="Today and tomorrow">Today and tomorrow</option>
                  <option value="Today only">Today only</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-[11px] sm:text-xs text-gray-600 mt-3">
                <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span>
                  Unused passes expire automatically at closing time (
                  {closingTimeStr}) on the booked date.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleDiscard}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          Discard changes
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isUpdating || !hasChanges}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#c82333] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save trial settings</span>
        </button>
      </div>
    </>
  );
};

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({
  open,
  onClose,
  clubOwnerDocumentId,
  clubName,
  schedulingData,
}) => {
  const {
    trialSettings,
    isLoading,
    isFetching,
    isUpdating,
    error,
    refetch,
    updateTrialSettings,
  } = useTrialSettings(clubOwnerDocumentId, open);

  const handleSave = async (payload: TrialSettings) => {
    if (!clubOwnerDocumentId) return;
    try {
      await updateTrialSettings(payload);
      onClose();
    } catch {
      // Error handled by mutation onError in useTrialSettings
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className:
          "!rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 bg-white max-w-4xl relative overflow-hidden",
      }}
    >
      {isLoading || (!trialSettings && isFetching) ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-gray-500 font-medium">
            Loading free trial settings...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm font-semibold text-gray-800">
            Failed to load trial settings
          </p>
          <p className="text-xs text-gray-500 max-w-sm">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : trialSettings ? (
        <FreeTrialContent
          key={`${clubOwnerDocumentId}_${trialSettings.isTrialEnabled}_${trialSettings.dailyTrialLimit}`}
          initialSettings={trialSettings}
          clubName={clubName}
          schedulingData={schedulingData}
          isUpdating={isUpdating}
          onSave={handleSave}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
};

export default FreeTrialModal;

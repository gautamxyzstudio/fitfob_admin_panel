import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const getTimeShort = (givenDate: string): string => {
  const now = dayjs();
  const target = dayjs(givenDate);

  const minutes = now.diff(target, "minute");
  const hours = now.diff(target, "hour");
  const days = now.diff(target, "day");

  if (minutes < 60) {
    return `${minutes}min`;
  }

  if (hours < 24) {
    return `${hours}H`;
  }

  return `${days}D`;
};

export const formatTo12Hour = (time?: string | null): string => {
  if (!time) return "";
  const trimmed = time.trim();
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }
  const parsed = dayjs(trimmed, [
    "HH:mm:ss",
    "HH:mm",
    "H:mm:ss",
    "H:mm",
  ]);
  if (!parsed.isValid()) return trimmed;
  return parsed.format("hh:mm A");
};

const getProp = (obj: any, ...keys: string[]): string => {
  if (!obj || typeof obj !== "object") return "";
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return String(obj[k]);
    const lowerKey = k.toLowerCase();
    for (const actualKey of Object.keys(obj)) {
      if (
        actualKey.toLowerCase() === lowerKey &&
        obj[actualKey] !== undefined &&
        obj[actualKey] !== null &&
        obj[actualKey] !== ""
      ) {
        return String(obj[actualKey]);
      }
    }
  }
  return "";
};

const getOpenTime = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.toLowerCase().includes("close") ? "" : item;
  return getProp(
    item,
    "openingTime",
    "opening_time",
    "openTime",
    "open_time",
    "startTime",
    "start_time",
    "open",
    "from",
    "opens",
    "start",
  );
};

const getCloseTime = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item.toLowerCase().includes("close") ? "" : item;
  return getProp(
    item,
    "closingTime",
    "closing_time",
    "closeTime",
    "close_time",
    "endTime",
    "end_time",
    "close",
    "to",
    "closes",
    "end",
  );
};

export const formatRawTime = (time?: string | null): string => {
  if (!time) return "";
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.slice(0, 5);
  return time;
};

export const formatTimeRange = (
  openingTime?: string | null,
  closingTime?: string | null,
): string => {
  if (!openingTime && !closingTime) return "";
  const open = formatTo12Hour(openingTime);
  const close = formatTo12Hour(closingTime);
  if (open && close) return `${open} - ${close}`;
  return open || close;
};

export interface ScheduleItem {
  day: string;
  label: string;
  isWeekend: boolean;
  isOpen: boolean;
  openingTime?: string;
  closingTime?: string;
  timeStr: string;
}

export interface ParsedScheduling {
  timingsSummary: string;
  weekdaySummary: string;
  weekendSummary: string;
  scheduleItems: ScheduleItem[];
  isEveryday: boolean;
}

const parseObj = (val: any): any => {
  if (!val) return null;
  let curr = val;
  if (typeof curr === "string") {
    curr = curr.trim();
    try {
      curr = JSON.parse(curr);
    } catch {
      try {
        const formatted = curr
          .replace(/'/g, '"')
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        curr = JSON.parse(formatted);
      } catch {
        return null;
      }
    }
    // Unwrap if stringified multiple times
    if (typeof curr === "string") {
      try {
        curr = JSON.parse(curr);
      } catch {
        // keep as is
      }
    }
  }

  if (Array.isArray(curr)) {
    const map: Record<string, any> = {};
    for (const item of curr) {
      if (item && typeof item === "object") {
        const dayKey = item.day || item.name || item.key;
        if (dayKey) map[dayKey] = item;
      }
    }
    return map;
  }

  if (typeof curr === "object" && curr !== null) return curr;
  return null;
};

const findFieldDeep = (obj: any, ...candidates: string[]): any => {
  if (!obj || typeof obj !== "object") return null;

  // Search inside arrays
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findFieldDeep(item, ...candidates);
      if (found !== undefined && found !== null) return found;
    }
    return null;
  }

  // 1. Direct candidate keys
  for (const c of candidates) {
    const direct = obj[c];
    if (direct !== undefined && direct !== null) return direct;
  }

  // 2. Case-insensitive / normalized search
  const candSet = new Set(
    candidates.map((c) => c.toLowerCase().replace(/[\s_-]/g, "")),
  );
  for (const k of Object.keys(obj)) {
    const cleanK = k.toLowerCase().replace(/[\s_-]/g, "");
    if (candSet.has(cleanK) && obj[k] !== undefined && obj[k] !== null) {
      return obj[k];
    }
  }

  // 3. Search common nested roots
  const nestedRoots = [
    obj.attributes,
    obj.club,
    obj.clubOwner,
    obj.club_owner,
    obj.pendingClubOwner,
    obj.pending_club_owner,
    obj.clubDetails,
    obj.club_details,
    obj.data,
    obj.details,
    obj.user,
  ];

  for (const root of nestedRoots) {
    if (root && typeof root === "object") {
      const found = findFieldDeep(root, ...candidates);
      if (found !== undefined && found !== null) return found;
    }
  }

  return null;
};

const isEverydayKey = (k: string): boolean => {
  const clean = k.toLowerCase().replace(/[\s_-]/g, "");
  return (
    clean === "everyday" ||
    clean === "every" ||
    clean.startsWith("every") ||
    clean === "daily" ||
    clean === "all" ||
    clean === "alldays" ||
    clean === "allweek" ||
    clean === "fullweek" ||
    clean === "7days" ||
    clean === "sevendays" ||
    clean === "monsun" ||
    clean === "mondaysunday" ||
    clean === "mondaytosunday"
  );
};

export const parseSchedulingData = (owner: any): ParsedScheduling => {
  const standardDays = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  if (!owner) {
    return {
      timingsSummary: "No Timings",
      weekdaySummary: "-",
      weekendSummary: "-",
      scheduleItems: standardDays.map((d) => ({
        day: d.key,
        label: d.label,
        isWeekend: d.key === "saturday" || d.key === "sunday",
        isOpen: false,
        timeStr: "Closed",
      })),
      isEveryday: false,
    };
  }

  // Check direct 'everyday' property anywhere on owner
  const directEveryday = parseObj(
    findFieldDeep(
      owner,
      "everyday",
      "everyDay",
      "every_day",
      "allDays",
      "all_days",
      "alldays",
      "daily",
    ),
  );

  const weekdaySched = parseObj(
    findFieldDeep(
      owner,
      "weekdayScheduling",
      "weekday_scheduling",
      "weekdaySchedule",
      "weekdayscheduling",
      "weeklyScheduling",
      "weekly_scheduling",
      "weeklySchedule",
      "weekly_schedule",
    ),
  );

  const weekendSched = parseObj(
    findFieldDeep(
      owner,
      "weekendScheduling",
      "weekend_scheduling",
      "weekendSchedule",
      "weekendscheduling",
    ),
  );

  const generalSched = parseObj(
    findFieldDeep(
      owner,
      "scheduling",
      "schedule",
      "timings",
      "timing",
      "workingHours",
      "working_hours",
      "operatingHours",
    ),
  );

  const combined: Record<string, any> = {
    ...(generalSched || {}),
    ...(weekdaySched || {}),
    ...(weekendSched || {}),
    ...(directEveryday ? { everyday: directEveryday } : {}),
  };

  // If weekdaySched itself contains opening/closing timing directly
  if (
    weekdaySched &&
    (getOpenTime(weekdaySched) || getCloseTime(weekdaySched))
  ) {
    combined.everyday = combined.everyday || weekdaySched;
  }

  const lowerMap: Record<string, any> = {};
  for (const k of Object.keys(combined)) {
    if (combined[k] !== undefined && combined[k] !== null) {
      const cleanKey = k.toLowerCase().replace(/[\s_-]/g, "");
      lowerMap[cleanKey] = combined[k];
      lowerMap[k.toLowerCase()] = combined[k];
    }
  }

  const keys = Object.keys(lowerMap);

  // Check if all explicit days in lowerMap are marked closed
  const standardPresent = standardDays.filter(
    (d) => lowerMap[d.key] !== undefined,
  );
  const allExplicitClosed =
    standardPresent.length > 0 &&
    standardPresent.every((d) => {
      const item = lowerMap[d.key];
      if (typeof item === "string" && item.toLowerCase().includes("close"))
        return true;
      if (item && (item.isClosed === true || item.isOpen === false)) return true;
      return false;
    });

  // Root fallback timings
  const rootOpen = getOpenTime(owner);
  const rootClose = getCloseTime(owner);
  const rootWeekday = String(
    findFieldDeep(owner, "weekday") || "",
  ).toLowerCase();

  const everydayKey = Object.keys(lowerMap).find((k) => isEverydayKey(k));

  const isEverydaySchedule =
    Boolean(everydayKey) ||
    Boolean(directEveryday) ||
    Boolean(weekdaySched?.everyday) ||
    Boolean(lowerMap["everyday"]) ||
    (keys.length === 1 && !standardDays.some((d) => d.key === keys[0])) ||
    rootWeekday.includes("every") ||
    rootWeekday.includes("all") ||
    rootWeekday.includes("daily") ||
    // If all standard days were set to "closed" BUT root has openingTime & closingTime,
    // it means owner chose Everyday timing and backend set day keys to closed or default!
    (allExplicitClosed && Boolean(rootOpen || rootClose));

  if (isEverydaySchedule) {
    const everydayItem =
      (everydayKey ? lowerMap[everydayKey] : null) ||
      directEveryday ||
      weekdaySched?.everyday ||
      (keys.length === 1 ? lowerMap[keys[0]] : null) ||
      {};

    const openTime =
      getOpenTime(everydayItem) ||
      getOpenTime(directEveryday) ||
      getOpenTime(weekdaySched?.everyday) ||
      getOpenTime(weekdaySched) ||
      rootOpen;

    const closeTime =
      getCloseTime(everydayItem) ||
      getCloseTime(directEveryday) ||
      getCloseTime(weekdaySched?.everyday) ||
      getCloseTime(weekdaySched) ||
      rootClose;

    const timeStr = formatTimeRange(openTime, closeTime) || "Open";

    const scheduleItems: ScheduleItem[] = standardDays.map((d) => ({
      day: d.key,
      label: d.label,
      isWeekend: d.key === "saturday" || d.key === "sunday",
      isOpen: true,
      openingTime: openTime,
      closingTime: closeTime,
      timeStr,
    }));

    return {
      timingsSummary: timeStr,
      weekdaySummary: "Everyday",
      weekendSummary: timeStr,
      scheduleItems,
      isEveryday: true,
    };
  }

  // Case 2: Individual days in scheduling object
  if (keys.length > 0) {
    const scheduleItems: ScheduleItem[] = standardDays.map((d) => {
      const item =
        lowerMap[d.key] ||
        lowerMap[d.key.replace(/[\s_-]/g, "")] ||
        lowerMap[d.key.slice(0, 3)];
      const openTime = getOpenTime(item);
      const closeTime = getCloseTime(item);
      const isClosedVal =
        typeof item === "string" && item.toLowerCase().includes("close");
      const isOpen = Boolean(
        item &&
        !isClosedVal &&
        (openTime || closeTime) &&
        !item.isClosed &&
        item.isOpen !== false,
      );
      const timeStr = isOpen
        ? formatTimeRange(openTime, closeTime)
        : "Closed";
      return {
        day: d.key,
        label: d.label,
        isWeekend: d.key === "saturday" || d.key === "sunday",
        isOpen,
        openingTime: openTime,
        closingTime: closeTime,
        timeStr,
      };
    });

    const openDays = scheduleItems.filter((s) => s.isOpen);
    const openTimes = Array.from(new Set(openDays.map((s) => s.timeStr)));
    let timingsSummary = "No Timings";
    if (openTimes.length === 1) {
      timingsSummary = openTimes[0];
    } else if (openTimes.length > 1) {
      timingsSummary = "Varies by day";
    }

    return {
      timingsSummary,
      weekdaySummary:
        findFieldDeep(owner, "weekday") ||
        (openDays.length > 0 ? "Monday - Saturday" : "-"),
      weekendSummary:
        findFieldDeep(owner, "weekend") ||
        (lowerMap["sunday"]
          ? formatTimeRange(
            getOpenTime(lowerMap["sunday"]),
            getCloseTime(lowerMap["sunday"]),
          )
          : "Closed"),
      scheduleItems,
      isEveryday: false,
    };
  }

  // Case 3: Legacy openingTime / closingTime or fallback
  const legacyOpen = rootOpen;
  const legacyClose = rootClose;
  const hasLegacy = Boolean(legacyOpen || legacyClose);
  const timeStr = hasLegacy
    ? formatTimeRange(legacyOpen, legacyClose)
    : "No Timings";

  const weekdayStr = rootWeekday;
  const weekendStr = String(
    findFieldDeep(owner, "weekend") || "",
  ).toLowerCase();

  const isMonSat =
    weekdayStr.includes("sat") || !weekendStr || weekendStr.includes("sun");
  const isMonFri = weekdayStr.includes("fri");

  const scheduleItems: ScheduleItem[] = standardDays.map((d) => {
    if (!hasLegacy) {
      return {
        day: d.key,
        label: d.label,
        isWeekend: d.key === "saturday" || d.key === "sunday",
        isOpen: false,
        timeStr: "Closed",
      };
    }

    if (d.key === "sunday") {
      const isSunOpen =
        weekendStr &&
        !weekendStr.includes("closed") &&
        !weekendStr.includes("close");
      return {
        day: d.key,
        label: d.label,
        isWeekend: true,
        isOpen: Boolean(isSunOpen),
        timeStr: isSunOpen ? timeStr : "Closed",
      };
    }

    if (d.key === "saturday") {
      const isSatClosed = isMonFri && !isMonSat;
      return {
        day: d.key,
        label: d.label,
        isWeekend: true,
        isOpen: !isSatClosed,
        timeStr: !isSatClosed ? timeStr : "Closed",
      };
    }

    return {
      day: d.key,
      label: d.label,
      isWeekend: false,
      isOpen: true,
      timeStr,
    };
  });

  return {
    timingsSummary: timeStr,
    weekdaySummary: findFieldDeep(owner, "weekday") || "-",
    weekendSummary: findFieldDeep(owner, "weekend") || "-",
    scheduleItems,
    isEveryday: false,
  };
};


export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

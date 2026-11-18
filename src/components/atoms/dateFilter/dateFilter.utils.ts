import { formatLocalDate, toLocalDate } from "../../../utility/dayjs";

export const getHumanReadableDateRangeLabel = (
  start: string,
  end: string,
): string | null => {
  if (!start && !end) return null;
  const todayStr = toLocalDate().format("YYYY-MM-DD");
  if (start === todayStr && end === todayStr) {
    return "Today";
  }
  const yesterdayStr = toLocalDate().subtract(1, "day").format("YYYY-MM-DD");
  if (start === yesterdayStr && end === yesterdayStr) {
    return "Yesterday";
  }
  if (
    start === toLocalDate().subtract(6, "day").format("YYYY-MM-DD") &&
    end === todayStr
  ) {
    return "Last 7 Days";
  }
  if (
    start === toLocalDate().subtract(29, "day").format("YYYY-MM-DD") &&
    end === todayStr
  ) {
    return "Last 30 Days";
  }
  if (
    start === toLocalDate().startOf("month").format("YYYY-MM-DD") &&
    end === toLocalDate().endOf("month").format("YYYY-MM-DD")
  ) {
    return "This Month";
  }
  if (start && end) {
    return `${formatLocalDate(start, "DD/MM/YY")} - ${formatLocalDate(end, "DD/MM/YY")}`;
  }
  if (start) return `From ${formatLocalDate(start, "DD/MM/YY")}`;
  if (end) return `Until ${formatLocalDate(end, "DD/MM/YY")}`;
  return null;
};

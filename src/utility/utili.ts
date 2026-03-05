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

export const formatTo12Hour = (time: string): string => {
  return dayjs(time, "HH:mm:ss").format("hh A");
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

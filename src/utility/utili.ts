import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const getDaysShort = (givenDate: string): string => {
  const today = dayjs();
  const target = dayjs(givenDate, "DD/MM/YYYY");

  const diff = today.diff(target, "day");

  return `${Math.abs(diff)}`;
};
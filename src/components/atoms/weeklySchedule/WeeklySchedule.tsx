import type { ScheduleItem } from "../../../utility/utili";
import { Pencil } from "lucide-react";

interface WeeklyScheduleProps {
  scheduleItems: ScheduleItem[];
  isEveryday?: boolean;
  onEdit?: () => void;
}

export const WeeklySchedule = ({
  scheduleItems,
  isEveryday,
  onEdit,
}: WeeklyScheduleProps) => {
  if (!scheduleItems || scheduleItems.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#E5E7EB] w-full">
      <div className="flex flex-row items-center justify-between mb-3">
        <span className="text-sm font-medium text-secondary-text">
          Club Timings & Weekly Schedule
        </span>
        <div className="flex items-center gap-2">
          {isEveryday && (
            <span className="text-xs bg-lightGreen text-green font-semibold px-2.5 py-0.5 rounded-full">
              Open Everyday
            </span>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 cursor-pointer bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md transition"
            >
              <Pencil size={12} />
              <span>Edit Schedule</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 w-full">
        {scheduleItems.map((item) => (
          <div
            key={item.day}
            className={`flex flex-col p-2.5 rounded-lg border transition-all ${item.isOpen
                ? "bg-[#F9FAFB] border-[#E5E7EB]"
                : "bg-[#F3F4F6]/60 border-dashed border-[#D1D5DB]"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black capitalize">
                {item.label}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.isOpen
                    ? "bg-lightGreen text-green"
                    : "bg-lightRed text-red"
                  }`}
              >
                {item.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <span
              className={`text-[11px] xl:text-xs mt-1.5 font-medium whitespace-nowrap ${item.isOpen ? "text-black" : "text-secondary-text"
                }`}
            >
              {item.isOpen ? item.timeStr : "Closed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySchedule;

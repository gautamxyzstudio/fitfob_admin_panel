import { MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
import { ICONS } from "../../../assets/exports";
import { formatFileSize } from "../../../utility/utili";

type FileCardProps = {
  fileName: string;
  fileSize: number;
  uploadDate: string;
  onMenuClick?: () => void;
  onClick?: () => void;
};

export const FileCard = ({
  fileName,
  fileSize,
  uploadDate,
  onMenuClick,
  onClick,
}: FileCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`w-[32%] min-w-70 rounded-[10px] border border-divider bg-white py-1.75 pl-4 pr-2.5 flex items-center justify-between ${
        onClick
          ? "cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
          : ""
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-x-1.5 overflow-hidden">
        {/* File Icon */}
        <div className="w-8 h-8 rounded-md bg-lightRed flex items-center justify-center p-1.5 shrink-0">
          <img src={ICONS.Doc} alt="doc" className="w-full h-full" />
        </div>

        {/* File Info */}
        <div className="flex flex-col truncate">
          <span className="text-sm text-black truncate" title={fileName}>
            {fileName}
          </span>
          <span className="text-[10px] leading-3.5 text-black">
            {dayjs(uploadDate).format("MMMM DD, YYYY")} |{" "}
            {formatFileSize(fileSize)}
          </span>
        </div>
      </div>

      {/* Right Menu Button */}
      <button
        onClick={(e) => {
          if (onMenuClick) {
            e.stopPropagation();
            onMenuClick();
          } else if (onClick) {
            e.stopPropagation();
            onClick();
          }
        }}
        className="w-8 h-8 rounded-md flex items-center justify-center p-1.5 bg-background hover:bg-gray-300 transition shrink-0 cursor-pointer"
        title="View Document"
        type="button"
      >
        <MoreHorizontal className="w-full h-full text-secondary-text" />
      </button>
    </div>
  );
};

import React from "react";
import type { IEmptyScreenViewProps } from "./EmptyScreenView.types";
import { IMAGES } from "../../../assets/exports";

const EmptyScreenView: React.FC<IEmptyScreenViewProps> = ({
  isDataEmpty = true,
  error,
  emptyViewTitle = "No Data Found",
  emptyViewSubTitle = "There is currently no data available to display.",
  illustration = IMAGES.NoData,
  illustrationStyes = "w-[200px] sm:w-[240px] md:w-[260px] h-auto object-contain",
  actionButtonLabel,
  actionButtonHandler,
  retryHandler,
  customClasses = "",
}) => {
  if (error) {
    return (
      <div
        className={`flex flex-col justify-center items-center p-6 text-center w-full ${customClasses}`}
      >
        <img
          src={illustration}
          alt="Error"
          className={`${illustrationStyes} select-none pointer-events-none drop-shadow-2xs mb-4`}
        />
        <h3 className="text-lg sm:text-xl font-bold text-[#1C1C1C]">
          Something went wrong
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[#787571] max-w-md leading-relaxed">
          {error.message || "An unexpected error occurred while fetching data."}
        </p>
        {retryHandler && (
          <button
            type="button"
            onClick={retryHandler}
            className="mt-4 bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white px-6 py-2 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!isDataEmpty) {
    return null;
  }

  return (
    <div
      className={`flex flex-col justify-center items-center p-6 sm:p-8 text-center w-full ${customClasses}`}
    >
      <img
        src={illustration}
        alt="No Data"
        className={`${illustrationStyes} select-none pointer-events-none drop-shadow-2xs mb-4 animate-in fade-in zoom-in-95 duration-200`}
      />
      <h3 className="text-lg sm:text-xl font-extrabold text-[#1C1C1C] tracking-tight">
        {emptyViewTitle}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-[#787571] max-w-md leading-relaxed">
        {emptyViewSubTitle}
      </p>

      {actionButtonLabel && actionButtonHandler && (
        <button
          type="button"
          onClick={actionButtonHandler}
          className="mt-5 bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          {actionButtonLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyScreenView;

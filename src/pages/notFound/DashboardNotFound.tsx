import React from "react";
import { useNavigate } from "react-router";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import { IMAGES } from "../../assets/exports";

const DashboardNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CustomBox customClasses="w-full h-full min-h-[580px] p-6 sm:p-10 flex flex-col items-center justify-center shadow-xs">
      {/* Centered Graphic with Soft Circular Pink Background */}
      <div className="relative flex items-center justify-center">
        {/* Soft Pink Circle Backdrop */}
        <div className="w-[280px] sm:w-[340px] md:w-[380px] h-[280px] sm:h-[340px] md:h-[380px] rounded-full bg-[#FFECEE]/70 absolute -z-0" />

        {/* 404 Kettlebell Illustration */}
        <img
          src={IMAGES.NotFound404}
          alt="404 - Page Not Found"
          className="w-[240px] sm:w-[300px] md:w-[350px] h-auto object-contain relative z-10 select-none pointer-events-none drop-shadow-2xs animate-in fade-in zoom-in-95 duration-200"
        />
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1C] mt-6 tracking-tight text-center">
        Page Not Found
      </h2>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-[#787571] text-center max-w-md mt-2 leading-relaxed font-normal">
        The page you’re trying to open doesn’t exist or you don’t have permission to view it. Check the
        URL or head back to the dashboard.
      </p>

      {/* Action Buttons: Go Back & Back to Dashboard */}
      <div className="flex flex-row items-center justify-center gap-3.5 mt-7">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-7 py-2.5 rounded-lg border border-primary text-primary hover:bg-[#FFECEE]/50 font-semibold text-sm transition-all duration-150 cursor-pointer shadow-2xs"
        >
          Go Back
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-7 py-2.5 rounded-lg bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    </CustomBox>
  );
};

export default DashboardNotFound;


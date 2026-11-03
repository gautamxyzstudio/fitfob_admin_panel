import React from "react";
import { Link } from "react-router";
import { ICONS, IMAGES } from "../../assets/exports";

// SVG 1: Soft rotated cross / X
const DecorativeCross = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 187 210"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <g opacity="0.1">
      <rect
        x="31.0811"
        y="11.6118"
        width="206.018"
        height="47.5514"
        rx="17"
        transform="rotate(40.8151 31.0811 11.6118)"
        fill="#E23744"
      />
      <rect
        x="163.435"
        y="23.8993"
        width="214.779"
        height="47.5484"
        rx="23.7742"
        transform="rotate(120.174 163.435 23.8993)"
        fill="#E23744"
      />
    </g>
  </svg>
);

// SVG 2: Large half-circle arc ring on the right edge
const DecorativeRightArc = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 80 221"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      opacity="0.1"
      d="M110.483 220.609C49.5638 220.707 0.0990153 171.402 0.000469365 110.483C-0.0980766 49.5635 49.207 0.0986955 110.126 0.000149562C171.046 -0.0983964 220.511 49.2066 220.609 110.126C220.708 171.045 171.403 220.51 110.483 220.609ZM110.168 25.5346C63.3506 25.6103 25.4592 63.6245 25.5349 110.442C25.6107 157.259 63.6248 195.15 110.442 195.074C157.259 194.999 195.15 156.984 195.075 110.167C194.999 63.3502 156.985 25.4589 110.168 25.5346Z"
      fill="#E23744"
    />
  </svg>
);

// SVG 3: Smaller complete circle ring on bottom-left
const DecorativeCircle = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 83 83"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      opacity="0.1"
      d="M41.0849 82.0372C18.4309 82.0738 0.0365864 63.7389 -5.9638e-05 41.085C-0.0367057 18.431 18.2982 0.0367001 40.9521 5.40388e-05C63.6061 -0.036592 82.0004 18.2983 82.0371 40.9523C82.0737 63.6062 63.7388 82.0005 41.0849 82.0372ZM40.9675 9.49548C23.5578 9.52365 9.46721 23.6599 9.49537 41.0696C9.52354 58.4793 23.6597 72.5699 41.0695 72.5417C58.4792 72.5136 72.5698 58.3774 72.5416 40.9676C72.5135 23.5579 58.3772 9.46732 40.9675 9.49548Z"
      fill="#E23744"
    />
  </svg>
);

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* ================= Background Decorative Elements ================= */}
      {/* 1. Middle-left soft rotated cross */}
      <DecorativeCross className="absolute -left-10 sm:left-4 md:left-12 top-[38%] -translate-y-1/2 w-28 sm:w-36 md:w-44 pointer-events-none" />

      {/* 2. Top-right large circle arc along the edge */}
      <DecorativeRightArc className="absolute right-0 top-[18%] w-16 sm:w-20 md:w-24 h-auto pointer-events-none" />

      {/* 3. Bottom-left circle ring */}
      <DecorativeCircle className="absolute left-[14%] sm:left-[18%] bottom-[18%] sm:bottom-[22%] w-12 sm:w-16 md:w-20 pointer-events-none" />

      {/* 4. Bottom-right soft rotated cross */}
      <DecorativeCross className="absolute right-[6%] sm:right-[10%] bottom-[10%] sm:bottom-[12%] w-28 sm:w-36 md:w-44 pointer-events-none" />

      {/* ================= Main Content Container ================= */}
      <div className="z-10 flex flex-col items-center max-w-xl w-full text-center">
        {/* Fitfob Logo */}
        <Link to="/" className="flex items-center gap-2 mb-6 sm:mb-8 group cursor-pointer">
          <img src={ICONS.FITFOB} alt="Fitfob" className="w-8 h-8 object-contain" />
          <span className="text-black font-extrabold text-2xl tracking-tight">
            Fitfob
          </span>
        </Link>

        {/* 404 Kettlebell Character Illustration */}
        <div className="w-full flex justify-center mb-6">
          <img
            src={IMAGES.NotFound404}
            alt="404 - Page Not Found"
            className="w-[320px] sm:w-[420px] md:w-[480px] h-auto object-contain select-none pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight">
          Page Not Found
        </h1>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm text-[#787571] max-w-md mt-2.5 leading-relaxed font-normal">
          We're sorry, the page you requested could no be found
          <br className="hidden sm:inline" /> Please go back to the home page
        </p>

        {/* Back to Home Button */}
        <Link to="/" className="mt-6">
          <button
            type="button"
            className="bg-primary hover:bg-[#c82333] active:scale-[0.98] text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
          >
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;


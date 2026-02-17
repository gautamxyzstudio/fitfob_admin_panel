import type React from "react";
import { ICONS } from "../../assets/exports";
import CustomBox from "../atoms/customBox/CustomBox";

const AuthLayout = ({
  children,
  customClasses,
}: {
  children: React.ReactNode;
  customClasses?: string;
}) => {
  return (
    <div className="max-w-screen-2xl mx-auto w-full flex justify-center items-center h-full relative overflow-hidden">
      <img
        className="w-full h-full absolute -left-[55%] top-0%"
        alt="Fit fob"
        src={ICONS.FITFOB_BG}
      />

      <CustomBox
        customClasses={`shadow-[0_0_52px_0_rgba(0,0,0,0.12)] rounded-2xl p-9 flex flex-col ${customClasses || "items-center"} z-10 w-136 `}
      >
        {children}
      </CustomBox>
      <img
        className="w-full h-full absolute -right-[55%] top-0%"
        alt="Fit fob"
        src={ICONS.FITFOB_BG}
      />
    </div>
  );
};

export default AuthLayout;

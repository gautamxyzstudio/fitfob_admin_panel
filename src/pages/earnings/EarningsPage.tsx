import React from "react";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import EmptyScreenView from "../../components/atoms/emptyScreenView/EmptyScreenView";

const EarningsPage: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col gap-y-4">
      <CustomBox customClasses="w-full h-full min-h-[580px] p-6 flex flex-col items-center justify-center shadow-xs">
        <EmptyScreenView
          emptyViewTitle="No Earnings Found"
          emptyViewSubTitle="There are currently no earnings or revenue records available to display."
        />
      </CustomBox>
    </div>
  );
};

export default EarningsPage;


import React from "react";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import EmptyScreenView from "../../components/atoms/emptyScreenView/EmptyScreenView";

const PayoutsPage: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col gap-y-4">
      <CustomBox customClasses="w-full h-full min-h-[580px] p-6 flex flex-col items-center justify-center shadow-xs">
        <EmptyScreenView
          emptyViewTitle="No Payouts Found"
          emptyViewSubTitle="There are currently no club payout transactions available to display."
        />
      </CustomBox>
    </div>
  );
};

export default PayoutsPage;


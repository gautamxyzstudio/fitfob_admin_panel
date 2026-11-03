import React from "react";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import EmptyScreenView from "../../components/atoms/emptyScreenView/EmptyScreenView";
import { useClientCheckins } from "../../hooks/client/useClient";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";

const CheckInPage: React.FC = () => {
  const { checkins, loading, error, refetch } = useClientCheckins();

  if (loading) {
    return (
      <CustomBox customClasses="w-full h-full min-h-[580px] p-6 flex items-center justify-center shadow-xs">
        <ActivityIndicator size={60} />
      </CustomBox>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-y-4">
      <CustomBox customClasses="w-full h-full min-h-[580px] p-6 flex flex-col items-center justify-center shadow-xs">
        <EmptyScreenView
          isDataEmpty={checkins.length === 0}
          error={error ? { message: error, statusCode: 500 } : undefined}
          retryHandler={refetch}
          emptyViewTitle="No Check-In Records"
          emptyViewSubTitle="There are currently no member check-in activities recorded."
        />
      </CustomBox>
    </div>
  );
};

export default CheckInPage;


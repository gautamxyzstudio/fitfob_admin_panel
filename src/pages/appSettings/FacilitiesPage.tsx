import React from "react";
import AppSettingsListing from "../../components/modules/appSettings/AppSettingsListing";
import { useFacilities } from "../../hooks/appSettings/useAppSettings";

const FacilitiesPage: React.FC = () => {
  const {
    facilities,
    isLoading,
    createFacility,
    updateFacility,
    deleteFacility,
  } = useFacilities();

  return (
    <AppSettingsListing
      title="Facilities/Amenities"
      nameColumnHeader="Name"
      nameLabel="Facilities/Amenities"
      modalTitleAdd="Add Club Facility/Amenities"
      modalTitleEdit="Edit Club Facility/Amenities"
      maxFileSizeMB={10}
      items={facilities}
      isLoading={isLoading}
      onCreate={createFacility}
      onUpdate={updateFacility}
      onDelete={deleteFacility}
    />
  );
};

export default FacilitiesPage;

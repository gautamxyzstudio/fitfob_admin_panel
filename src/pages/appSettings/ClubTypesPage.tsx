import React from "react";
import AppSettingsListing from "../../components/modules/appSettings/AppSettingsListing";
import { useClubTypes } from "../../hooks/appSettings/useAppSettings";

const ClubTypesPage: React.FC = () => {
  const {
    clubTypes,
    isLoading,
    createClubType,
    updateClubType,
    deleteClubType,
  } = useClubTypes();

  return (
    <AppSettingsListing
      title="Club Types"
      nameColumnHeader="Club type"
      nameLabel="Club Type"
      modalTitleAdd="Define Club Type"
      modalTitleEdit="Edit Club Type"
      maxFileSizeMB={2}
      items={clubTypes}
      isLoading={isLoading}
      onCreate={createClubType}
      onUpdate={updateClubType}
      onDelete={deleteClubType}
    />
  );
};

export default ClubTypesPage;

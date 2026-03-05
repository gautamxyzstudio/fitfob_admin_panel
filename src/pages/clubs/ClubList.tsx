import { useState } from "react";
import CustomDataTable from "../../components/atoms/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomSearch from "../../components/atoms/customSearch/CustomSearch";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FilterList, Visibility } from "@mui/icons-material";
import { Box } from "@mui/material";
import { ICONS } from "../../assets/exports";
import { useNavigate } from "react-router";
import { useVerifiedOwners } from "../../hooks/clubOwner/useClubOwner";

const ClubList = () => {
  const navigate = useNavigate();
  const { verifiedOwners, loading, fetchVerifiedOwners } = useVerifiedOwners();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const columns: GridColDef[] = [
    {
      field: "clubName",
      headerName: "Club Name",
      width: 180,
      renderCell: (params) => {
        const logoSrc = params.row.logo
          ? params.row.logo.formats
            ? params.row.logo.formats?.thumbnail?.url
            : params.row.logo.url
          : ICONS.DummyClubProfile;
        const styles = params.row.logo ? "" : "p-2";
        return (
          <div className="flex flex-row gap-x-2.5 items-center">
            <img
              className={`w-10.5 h-10.5 ${styles} rounded-md bg-bg group-hover:bg-white`}
              src={logoSrc}
            />
            <span className="text-base">{params.row.clubName}</span>
          </div>
        );
      },
    },
    {
      field: "ownerName",
      headerName: "Owner’s name",
      width: 160,
    },
    {
      field: "phoneNumber",
      headerName: "Phone No.",
      width: 100,
      renderCell: (params) =>
        params.row.phoneNumber
          ? `*****${params.row.phoneNumber?.slice(5)}`
          : "Na",
    },
    {
      field: "clubId",
      headerName: "Id No.",
      width: 100,
      renderCell: (params) => `*****${params.row.clubId?.slice(8)}`,
    },
    {
      field: "location",
      headerName: "Location",
      width: 160,
      renderCell: (params) => `${params.row.city}, ${params.row.state}`,
    },

    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => {
        return (
          <div className="relative px-6.25 py-2 text-xs rounded-[52px] capitalize bg-lightGreen text-green">
            {params.row.user.verification_status}
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: (params) => {
        return (
          <button
            onClick={() => navigate(`/clubs/view/${params.row.id}`)}
            className="bg-bg p-1 rounded text-secondary-text cursor-pointer group-hover:bg-white"
          >
            <Visibility className="w-5 h-5 opacity-50" />
          </button>
        );
      },
    },
  ];

  if (!verifiedOwners) return;

  const totalPages = Math.ceil(verifiedOwners.length / rowsPerPage);

  const paginatedRows = verifiedOwners?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  return (
    <CustomBox customClasses="p-4 h-full flex flex-col gap-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Recently Add Clubs</h2>
        <div className="flex flex-row gap-x-3">
          <CustomSearch
            placeholder="Search Clubs"
            sx={{
              "& .MuiOutlinedInput-input": {
                paddingY: "12px !important",
              },
            }}
            onSearch={(term) => fetchVerifiedOwners(term)}
          />
          <CustomButton
            buttonStyle="white"
            label="Filter"
            icon={<FilterList />}
          />
        </div>
      </div>
      <CustomDataTable
        columns={columns}
        rows={paginatedRows}
        className="w-full h-full"
        isLoading={loading}
        isDataEmpty={paginatedRows?.length === 0}
        emptyViewTitle="No Club Request found"
        emptyViewSubTitle="There are not any Club Request"
        withPagination={true}
        onRowClick={(row) => navigate(`/clubs/view/${row.id}`)}
        paginationControls={
          <Box display="flex" justifyContent="space-between" mt={2}>
            <span className="text-secondary-text text-sm">
              {verifiedOwners.length > 0
                ? `${page * rowsPerPage + 1} - ${Math.min(
                    (page + 1) * rowsPerPage,
                    verifiedOwners.length,
                  )} of ${verifiedOwners.length} items`
                : "No items"}
            </span>
            <Box display="flex" gap={1}>
              <CustomButton
                buttonStyle={page === 0 ? "disabled" : "outlined"}
                label=" Previous"
                disabled={page === 0}
                customStyles="font-normal!"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              />
              <CustomButton
                buttonStyle={page >= totalPages - 1 ? "disabled" : "outlined"}
                label="Next"
                disabled={page >= totalPages - 1}
                customStyles="font-normal!"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
              />
            </Box>
          </Box>
        }
      />
    </CustomBox>
  );
};

export default ClubList;

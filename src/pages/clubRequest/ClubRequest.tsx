import { useState } from "react";
import CustomDataTable from "../../components/atoms/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomSearch from "../../components/atoms/customSearch/CustomSearch";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FilterList, Visibility } from "@mui/icons-material";
import { Box } from "@mui/material";
import { getTimeShort } from "../../utility/utili";
import { ICONS } from "../../assets/exports";
import { useNavigate } from "react-router";
import { useUnverifiedOwners } from "../../hooks/clubOwner/useClubOwner";
import dayjs from "dayjs";

const ClubRequest = () => {
  const navigate = useNavigate();
  const { unverifiedOwners, loading, fetchUnverifiedOwners } =
    useUnverifiedOwners();
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
      field: "createdAt",
      headerName: "Date",
      width: 100,
      renderCell: (params) => dayjs(params.row.createdAt).format("DD/MM/YYYY"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => {
        const time = getTimeShort(params.row.createdAt);

        const value = parseInt(time, 10);
        const unit = time.replace(/[0-9]/g, "");

        let bgColor = "";
        let borderColor = "";

        if (unit === "min" || unit === "H" || (unit === "D" && value <= 2)) {
          bgColor = "bg-[#22C55E]";
          borderColor = "border-[#22C55E]";
        } else if (unit === "D" && value <= 6) {
          bgColor = "bg-[#FCD92B]";
          borderColor = "border-[#FCD92B]";
        } else {
          bgColor = "bg-[#FF0000]";
          borderColor = "border-[#FF0000]";
        }

        return (
          <div
            className={`relative px-6.25 py-2 text-xs text-white rounded-[52px] ${bgColor} capitalize`}
          >
            {params.row.user.verification_status}
            <span
              className={`absolute -top-1.5 -right-1.5 bg-white px-2 py-1 rounded-full text-secondary-text border ${borderColor}`}
            >
              {time}
            </span>
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
            onClick={() => navigate(`/club-request/view/${params.row.id}`)}
            className="bg-bg p-1 rounded text-secondary-text cursor-pointer group-hover:bg-white"
          >
            <Visibility className="w-5 h-5 opacity-50" />
          </button>
        );
      },
    },
  ];

  if (!unverifiedOwners) return;

  const totalPages = Math.ceil(unverifiedOwners.length / rowsPerPage);

  const paginatedRows = unverifiedOwners?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  return (
    <CustomBox customClasses="p-4 h-full flex flex-col gap-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">All Club Requests</h2>
        <div className="flex flex-row gap-x-3">
          <CustomSearch
            placeholder="Search Clubs"
            sx={{
              "& .MuiOutlinedInput-input": {
                paddingY: "12px !important",
              },
            }}
            onSearch={(term) => fetchUnverifiedOwners(term)}
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
        onRowClick={(row) => navigate(`/club-request/view/${row.id}`)}
        paginationControls={
          <Box display="flex" justifyContent="space-between" mt={2}>
            <span className="text-secondary-text text-sm">
              {unverifiedOwners.length > 0
                ? `${page * rowsPerPage + 1} - ${Math.min(
                    (page + 1) * rowsPerPage,
                    unverifiedOwners.length,
                  )} of ${unverifiedOwners.length} items`
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

export default ClubRequest;

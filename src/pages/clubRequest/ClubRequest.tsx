import { useEffect, useState } from "react";
import CustomDataTable from "../../components/atoms/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomSearch from "../../components/atoms/customSearch/CustomSearch";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FilterList, Visibility } from "@mui/icons-material";
import { Box } from "@mui/material";
import { getDaysShort } from "../../utility/utili";
import { ICONS } from "../../assets/exports";

const ClubRequest = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);
  const columns: GridColDef[] = [
    {
      field: "clubName",
      headerName: "Club Name",
      width: 180,
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-x-2.5 items-center">
            <img
              className="w-10.5 h-10.5 p-2 rounded-md bg-bg group-hover:bg-white"
              src={ICONS.DummyClubProfile}
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
      field: "idNo",
      headerName: "Id No.",
      width: 100,
    },
    {
      field: "location",
      headerName: "Location",
      width: 160,
    },
    {
      field: "date",
      headerName: "Date",
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => {
        const days = getDaysShort(params.row.date);
        const numericDays = parseInt(days, 10);

        let bgColor = "";
        let borderColor = "";

        if (numericDays <= 2) {
          bgColor = "bg-[#22C55E]";
          borderColor = "border-[#22C55E]";
        } else if (numericDays <= 6) {
          bgColor = "bg-[#FCD92B]";
          borderColor = "border-[#FCD92B]";
        } else {
          bgColor = "bg-[#FF0000]";
          borderColor = "border-[#FF0000]";
        }

        return (
          <div
            className={`relative px-6.25 py-2 text-xs text-white rounded-[52px] ${bgColor}`}
          >
            {params.row.status}
            <span
              className={`absolute -top-1.5 -right-1.5 bg-white px-2 py-1 rounded-full text-secondary-text border ${borderColor}`}
            >
              {getDaysShort(params.row.date)}D
            </span>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: () => {
        return (
          <button className="bg-bg p-1 rounded text-secondary-text cursor-pointer group-hover:bg-white">
            <Visibility className="w-5 h-5 opacity-50" />
          </button>
        );
      },
    },
  ];

  const rows = [
    {
      clubName: "Fit Club",
      ownerName: "John Doe",
      idNo: "FC1001",
      location: "New York",
      date: "27/02/2026",
      status: "Pending",
    },
    {
      clubName: "Power Gym",
      ownerName: "Michael Smith",
      idNo: "PG1002",
      location: "Los Angeles",
      date: "26/02/2026",
      status: "Pending",
    },
    {
      clubName: "Elite Fitness",
      ownerName: "Sarah Johnson",
      idNo: "EF1003",
      location: "Chicago",
      date: "25/02/2026",
      status: "Pending",
    },
    {
      clubName: "Iron Paradise",
      ownerName: "David Brown",
      idNo: "IP1004",
      location: "Houston",
      date: "24/02/2026",
      status: "Pending",
    },
    {
      clubName: "Flex Zone",
      ownerName: "Emily Davis",
      idNo: "FZ1005",
      location: "Phoenix",
      date: "24/02/2026",
      status: "Pending",
    },
    {
      clubName: "Muscle Factory",
      ownerName: "Chris Wilson",
      idNo: "MF1006",
      location: "Philadelphia",
      date: "22/02/2026",
      status: "Pending",
    },
    {
      clubName: "Urban Fitness",
      ownerName: "Jessica Martinez",
      idNo: "UF1007",
      location: "San Antonio",
      date: "22/02/2026",
      status: "Pending",
    },
    {
      clubName: "Peak Performance",
      ownerName: "Daniel Anderson",
      idNo: "PP1008",
      location: "San Diego",
      date: "20/02/2026",
      status: "Pending",
    },
    {
      clubName: "Bodyline Gym",
      ownerName: "Laura Thomas",
      idNo: "BG1009",
      location: "Dallas",
      date: "19/02/2026",
      status: "Pending",
    },
    {
      clubName: "Titan Fitness",
      ownerName: "James Taylor",
      idNo: "TF1010",
      location: "San Jose",
      date: "18/02/2026",
      status: "Pending",
    },
    {
      clubName: "Core Strength",
      ownerName: "Olivia White",
      idNo: "CS1011",
      location: "Austin",
      date: "16/02/2026",
      status: "Pending",
    },
    {
      clubName: "Pro Active Gym",
      ownerName: "William Harris",
      idNo: "PA1012",
      location: "Jacksonville",
      date: "16/02/2026",
      status: "Pending",
    },
    {
      clubName: "Next Level Fitness",
      ownerName: "Benjamin Clark",
      idNo: "NL1013",
      location: "Columbus",
      date: "15/02/2026",
      status: "Pending",
    },
    {
      clubName: "Prime Gym",
      ownerName: "Sophia Lewis",
      idNo: "PG1014",
      location: "Charlotte",
      date: "14/02/2026",
      status: "Pending",
    },
    {
      clubName: "Infinity Fitness",
      ownerName: "Alexander Walker",
      idNo: "IF1015",
      location: "San Francisco",
      date: "13/02/2026",
      status: "Pending",
    },
    {
      clubName: "Stronghold Gym",
      ownerName: "Mia Hall",
      idNo: "SG1016",
      location: "Indianapolis",
      date: "12/02/2026",
      status: "Pending",
    },
    {
      clubName: "Dynamic Fitness",
      ownerName: "Ethan Allen",
      idNo: "DF1017",
      location: "Seattle",
      date: "11/02/2026",
      status: "Pending",
    },
    {
      clubName: "Victory Gym",
      ownerName: "Ava Young",
      idNo: "VG1018",
      location: "Denver",
      date: "10/02/2026",
      status: "Pending",
    },
    {
      clubName: "Fusion Fitness",
      ownerName: "Matthew King",
      idNo: "FF1019",
      location: "Washington",
      date: "09/02/2026",
      status: "Pending",
    },
    {
      clubName: "Champion Club",
      ownerName: "Isabella Scott",
      idNo: "CC1020",
      location: "Boston",
      date: "08/02/2026",
      status: "Pending",
    },
    {
      clubName: "Momentum Gym",
      ownerName: "Lucas Green",
      idNo: "MG1021",
      location: "El Paso",
      date: "07/02/2026",
      status: "Pending",
    },
    {
      clubName: "Apex Fitness",
      ownerName: "Harper Adams",
      idNo: "AF1022",
      location: "Nashville",
      date: "06/02/2026",
      status: "Pending",
    },
  ];

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const paginatedRows = rows.slice(
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
        isLoading={isLoading}
        isDataEmpty={paginatedRows?.length === 0}
        emptyViewTitle="No Club Request found"
        emptyViewSubTitle="There are not any Club Request"
        withPagination={true}
        paginationControls={
          <Box display="flex" justifyContent="space-between" mt={2}>
            <span className="text-secondary-text text-sm">
              {rows.length > 0
                ? `${page * rowsPerPage + 1} - ${Math.min(
                    (page + 1) * rowsPerPage,
                    rows.length,
                  )} of ${rows.length} items`
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

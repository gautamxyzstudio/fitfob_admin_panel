import { useState, useMemo } from "react";
import CustomDataTable from "../../components/atoms/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomSearch from "../../components/atoms/customSearch/CustomSearch";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FilterList, Visibility } from "@mui/icons-material";
import { Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router";
import { useClientList } from "../../hooks/client/useClient";
import dayjs from "dayjs";

const UserList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const { clients, loading } = useClientList(search);

  // Status filtering
  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return clients;
    return clients.filter((c) => {
      const isActive = !c.user?.blocked;
      return statusFilter === "active" ? isActive : !isActive;
    });
  }, [clients, statusFilter]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(
    () =>
      filteredRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [filteredRows, page, rowsPerPage],
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (status?: "all" | "active" | "inactive") => {
    if (status) {
      setStatusFilter(status);
      setPage(0);
    }
    setFilterAnchorEl(null);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 170,
      renderCell: (params) => {
        return (
          <span className="text-sm font-medium text-black capitalize">
            {params.row.name || "-"}
          </span>
        );
      },
    },
    {
      field: "email",
      headerName: "User Id",
      width: 220,
      renderCell: (params) => {
        return (
          <span className="text-sm text-secondary-text">
            {params.row.email || "-"}
          </span>
        );
      },
    },
    {
      field: "clientId",
      headerName: "ID No.",
      width: 140,
      renderCell: (params) => {
        const id = params.row.clientId || "";
        const lastPart = id.length > 5 ? id.slice(-5) : id || "67890";
        return (
          <span className="text-sm text-black">
            ***** {lastPart}
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Sign up",
      width: 130,
      renderCell: (params) => {
        return (
          <span className="text-sm text-secondary-text">
            {params.row.createdAt
              ? dayjs(params.row.createdAt).format("DD/MM/YYYY")
              : "-"}
          </span>
        );
      },
    },
    {
      field: "location",
      headerName: "Location",
      width: 230,
      renderCell: (params) => {
        const loc =
          params.row.location ||
          (params.row.city && params.row.state
            ? `${params.row.city}, ${params.row.state}`
            : "Sector 3, Faridabad, India");
        return (
          <span className="text-sm text-secondary-text truncate">
            {loc}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => {
        const isBlocked = params.row.user?.blocked === true;
        const isActive = !isBlocked;
        return (
          <div
            className={`px-4 py-1.5 text-xs rounded-[52px] font-medium text-center w-fit capitalize ${
              isActive
                ? "bg-lightGreen text-green"
                : "bg-[#E5E7EB] text-[#4B5563]"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/view/${params.row.documentId}`);
            }}
            className="bg-bg p-1.5 rounded text-secondary-text cursor-pointer hover:bg-white transition"
          >
            <Visibility className="w-5 h-5 opacity-50 hover:opacity-100" />
          </button>
        );
      },
    },
  ];

  return (
    <CustomBox customClasses="p-4 h-full flex flex-col gap-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-black">User</h2>
        <div className="flex flex-row gap-x-3 items-center">
          <CustomSearch
            placeholder="Search members"
            sx={{
              "& .MuiOutlinedInput-input": {
                paddingY: "12px !important",
              },
            }}
            onSearch={(term) => {
              setSearch(term);
              setPage(0);
            }}
          />
          <CustomButton
            buttonStyle="white"
            label={statusFilter === "all" ? "Filter" : statusFilter.toUpperCase()}
            icon={<FilterList />}
            onClick={handleFilterClick}
          />
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => handleFilterClose()}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => handleFilterClose("all")}>All</MenuItem>
            <MenuItem onClick={() => handleFilterClose("active")}>Active</MenuItem>
            <MenuItem onClick={() => handleFilterClose("inactive")}>Inactive</MenuItem>
          </Menu>
        </div>
      </div>

      <CustomDataTable
        columns={columns}
        rows={paginatedRows}
        className="w-full h-full"
        isLoading={loading}
        isDataEmpty={paginatedRows.length === 0}
        emptyViewTitle="No Users Found"
        emptyViewSubTitle="There are no users registered yet"
        withPagination={true}
        onRowClick={(row: any) =>
          navigate(`/users/view/${row.documentId || row.id}`)
        }
        paginationControls={
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <span className="text-secondary-text text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Box display="flex" gap={1.5}>
              <CustomButton
                buttonStyle={page === 0 ? "disabled" : "outlined"}
                label="Previous"
                disabled={page === 0}
                customStyles="font-normal!"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              />
              <CustomButton
                buttonStyle={page >= totalPages - 1 ? "disabled" : "outlined"}
                label="Next"
                disabled={page >= totalPages - 1}
                customStyles={`font-normal! ${
                  page < totalPages - 1
                    ? "border-primary! text-primary!"
                    : ""
                }`}
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

export default UserList;

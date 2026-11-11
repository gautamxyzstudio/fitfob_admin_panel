import { useState, useMemo } from "react";
import CustomDataTable from "../../components/atoms/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomSearch from "../../components/atoms/customSearch/CustomSearch";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import {
  FilterList,
  Visibility,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import { Box, Popover } from "@mui/material";
import { ICONS } from "../../assets/exports";
import { useNavigate } from "react-router";
import { useVerifiedOwners } from "../../hooks/clubOwner/useClubOwner";
import { getMediaUrl } from "../../utility/utili";
import { toLocalDate, formatLocalDate } from "../../utility/dayjs";

const ClubList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { verifiedOwners, loading } = useVerifiedOwners(search);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Date range filter state (applied)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Temporary date filter state (in popover before applying)
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Popover anchor element
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(0);
    setFilterAnchorEl(null);
  };

  const handleResetFilter = () => {
    setTempStartDate("");
    setTempEndDate("");
    setStartDate("");
    setEndDate("");
    setPage(0);
    setFilterAnchorEl(null);
  };

  // Compute active filter label for UI badge
  const activeFilterLabel = useMemo(() => {
    if (!startDate && !endDate) return null;
    const today = toLocalDate().format("YYYY-MM-DD");
    if (startDate === today && endDate === today) return "Today";
    if (
      startDate === toLocalDate().subtract(6, "day").format("YYYY-MM-DD") &&
      endDate === today
    ) {
      return "Last 7 Days";
    }
    if (
      startDate === toLocalDate().subtract(29, "day").format("YYYY-MM-DD") &&
      endDate === today
    ) {
      return "Last 30 Days";
    }
    if (
      startDate === toLocalDate().startOf("month").format("YYYY-MM-DD") &&
      endDate === toLocalDate().endOf("month").format("YYYY-MM-DD")
    ) {
      return "This Month";
    }
    if (startDate && endDate) {
      return `${formatLocalDate(startDate, "DD/MM/YY")} - ${formatLocalDate(endDate, "DD/MM/YY")}`;
    }
    if (startDate) return `From ${formatLocalDate(startDate, "DD/MM/YY")}`;
    if (endDate) return `Until ${formatLocalDate(endDate, "DD/MM/YY")}`;
    return null;
  }, [startDate, endDate]);

  // Filter verifiedOwners by createdAt date range
  const filteredOwners = useMemo(() => {
    if (!verifiedOwners) return [];

    return verifiedOwners.filter((club) => {
      if (!startDate && !endDate) return true;
      if (!club.createdAt) return false;

      const clubDate = toLocalDate(club.createdAt);
      if (!clubDate.isValid()) return false;

      if (startDate && endDate) {
        const start = toLocalDate(startDate).startOf("day");
        const end = toLocalDate(endDate).endOf("day");
        return (
          (clubDate.isAfter(start) || clubDate.isSame(start)) &&
          (clubDate.isBefore(end) || clubDate.isSame(end))
        );
      }

      if (startDate) {
        const start = toLocalDate(startDate).startOf("day");
        return clubDate.isAfter(start) || clubDate.isSame(start);
      }

      if (endDate) {
        const end = toLocalDate(endDate).endOf("day");
        return clubDate.isBefore(end) || clubDate.isSame(end);
      }

      return true;
    });
  }, [verifiedOwners, startDate, endDate]);

  const columns: GridColDef[] = [
    {
      field: "clubName",
      headerName: "Club Name",
      width: 180,
      renderCell: (params) => {
        const logoUrl = getMediaUrl(params.row.logo, ICONS.DummyClubProfile);
        const styles = logoUrl !== ICONS.DummyClubProfile ? "object-cover" : "p-2";
        return (
          <div className="flex flex-row gap-x-2.5 items-center">
            <img
              className={`w-10.5 h-10.5 ${styles} rounded-md bg-bg group-hover:bg-white`}
              src={logoUrl}
              alt={params.row.clubName || "Club"}
            />
            <span className="text-base capitalize">{params.row.clubName}</span>
          </div>
        );
      },
    },
    {
      field: "ownerName",
      headerName: "Owner’s name",
      width: 110,
    },
    {
      field: "phoneNumber",
      headerName: "Phone No.",
      width: 100,
      renderCell: (params) =>
        params.row.phoneNumber
          ? `*****${params.row.phoneNumber?.replace(/^\+91/, "")?.slice(7)}`
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
      width: 110,
      renderCell: (params) => {
        return (
          <span className="line-clamp-1" title={`${params.row.clubAddress}, ${params.row.city}, ${params.row.state}, ${params.row.pincode}`}>
            {params.row.city}, {params.row.state}
          </span>
        )
      }

    },
    {
      field: "createdAt",
      headerName: "Date Added",
      width: 110,
      renderCell: (params) =>
        params.row.createdAt
          ? formatLocalDate(params.row.createdAt, "DD/MM/YYYY")
          : "-",
    },
    {
      field: "status",
      headerName: "Status",
      width: 60,
      renderCell: (params) => {
        return (
          <div className="relative px-5 py-2 text-xs rounded-[52px] capitalize bg-lightGreen text-green w-fit">
            {params.row.user?.verification_status}
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

  const totalPages = Math.ceil(filteredOwners.length / rowsPerPage) || 1;

  const paginatedRows = useMemo(() => {
    return filteredOwners.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredOwners, page, rowsPerPage]);

  return (
    <CustomBox customClasses="p-4 h-full flex flex-col gap-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-lg font-medium">Recently Add Clubs</h2>
        <div className="flex flex-row items-center gap-x-3">
          <CustomSearch
            placeholder="Search Clubs"
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

          {/* Date Range Filter Button */}
          <div className="flex items-center gap-1.5">
            <CustomButton
              buttonStyle="white"
              label={activeFilterLabel ? `Date: ${activeFilterLabel}` : "Filter"}
              icon={<FilterList className={activeFilterLabel ? "text-primary" : ""} />}
              onClick={handleFilterClick}
              customStyles={
                activeFilterLabel
                  ? "border-primary! text-primary! font-semibold!"
                  : ""
              }
            />

            {activeFilterLabel && (
              <button
                type="button"
                onClick={handleResetFilter}
                title="Clear date filter"
                className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-red-50 border border-gray-200 transition cursor-pointer"
              >
                <Close sx={{ fontSize: 18 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              mt: 1.5,
              width: 320,
              p: 2.5,
              border: "1px solid #E5E7EB",
            },
          },
        }}
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <CalendarToday className="text-primary" sx={{ fontSize: 18 }} />
              <span className="text-sm font-bold text-gray-900">
                Filter by Created Date
              </span>
            </div>
            {(tempStartDate || tempEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setTempStartDate("");
                  setTempEndDate("");
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                {
                  label: "Today",
                  getRange: () => ({
                    start: toLocalDate().format("YYYY-MM-DD"),
                    end: toLocalDate().format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "Last 7 Days",
                  getRange: () => ({
                    start: toLocalDate().subtract(6, "day").format("YYYY-MM-DD"),
                    end: toLocalDate().format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "Last 30 Days",
                  getRange: () => ({
                    start: toLocalDate().subtract(29, "day").format("YYYY-MM-DD"),
                    end: toLocalDate().format("YYYY-MM-DD"),
                  }),
                },
                {
                  label: "This Month",
                  getRange: () => ({
                    start: toLocalDate().startOf("month").format("YYYY-MM-DD"),
                    end: toLocalDate().endOf("month").format("YYYY-MM-DD"),
                  }),
                },
              ].map((preset) => {
                const range = preset.getRange();
                const isSelected =
                  tempStartDate === range.start && tempEndDate === range.end;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTempStartDate(range.start);
                      setTempEndDate(range.end);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border text-left ${isSelected
                      ? "bg-red-50 text-primary border-primary font-semibold"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Custom Range
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-600 font-medium">
                  From:
                </span>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-600 font-medium">To:</span>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleFilterClose}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyFilter}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-[#c82333] text-white text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Popover>

      <CustomDataTable
        columns={columns}
        rows={paginatedRows}
        className="w-full h-full"
        isLoading={loading}
        isDataEmpty={paginatedRows?.length === 0}
        emptyViewTitle={
          activeFilterLabel
            ? "No clubs found in selected date range"
            : "No Club Request found"
        }
        emptyViewSubTitle={
          activeFilterLabel
            ? "Try selecting a different date range or clear the filter"
            : "There are not any Club Request"
        }
        withPagination={true}
        onRowClick={(row) => navigate(`/clubs/view/${row.id}`)}
        paginationControls={
          <Box display="flex" justifyContent="space-between" mt={2}>
            <span className="text-secondary-text text-sm">
              {filteredOwners.length > 0
                ? `${page * rowsPerPage + 1} - ${Math.min(
                  (page + 1) * rowsPerPage,
                  filteredOwners.length,
                )} of ${filteredOwners.length} items`
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

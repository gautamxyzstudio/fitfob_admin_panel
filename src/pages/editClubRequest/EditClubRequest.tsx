/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router";
import {
  useClubOwnerDetails,
  useUpdateClubOwner,
} from "../../hooks/clubOwner/useClubOwner";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import { ICONS } from "../../assets/exports";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import {
  formatFileSize,
  formatTimeRange,
  formatTo12Hour,
  getTimeShort,
  parseSchedulingData,
  type ScheduleItem,
} from "../../utility/utili";
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import useSnackBarStore from "../../store/snackBar.store";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FileCard } from "../../components/atoms/fileCard/FileCard";
import WeeklySchedule from "../../components/atoms/weeklySchedule/WeeklySchedule";
import { Controller, useForm } from "react-hook-form";
import {
  ALL_FACILITIES,
  ALL_SERVICES,
  CLUB_CATEGORIES,
  type EditClubForm,
} from "./types";
import TextInput from "../../components/modules/textInput/TextInput";
import { Autocomplete, Dialog, Popover } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import type { ClubOwnerDocument } from "../../api/clubRequest/clubRequest.types";

const parseTimeParts = (
  timeStr?: string | null,
  fallbackHour = "06",
  fallbackPeriod: "AM" | "PM" = "AM",
) => {
  if (!timeStr) {
    return { hour: fallbackHour, minute: "00", period: fallbackPeriod };
  }
  const formatted12 = formatTo12Hour(timeStr);
  const match = formatted12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    return {
      hour: match[1].padStart(2, "0"),
      minute: match[2],
      period: match[3].toUpperCase() as "AM" | "PM",
    };
  }
  return { hour: fallbackHour, minute: "00", period: fallbackPeriod };
};

interface TimePickerInputProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  fallbackHour?: string;
  fallbackPeriod?: "AM" | "PM";
}

const TimePickerInput = ({
  label,
  value,
  onChange,
  fallbackHour = "06",
  fallbackPeriod = "AM",
}: TimePickerInputProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const { hour, minute, period } = parseTimeParts(
    value,
    fallbackHour,
    fallbackPeriod,
  );

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateTime = (newH: string, newM: string, newP: string) => {
    onChange(`${newH}:${newM} ${newP}`);
  };

  useEffect(() => {
    if (anchorEl) {
      setTimeout(() => {
        const selectedHourEl = hourListRef.current?.querySelector<HTMLElement>(
          `[data-value="${hour}"]`,
        );
        selectedHourEl?.scrollIntoView({ block: "center" });

        const selectedMinuteEl =
          minuteListRef.current?.querySelector<HTMLElement>(
            `[data-value="${minute}"]`,
          );
        selectedMinuteEl?.scrollIntoView({ block: "center" });
      }, 50);
    }
  }, [anchorEl, hour, minute]);

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const periods = ["AM", "PM"] as const;

  const displayTime = value ? formatTo12Hour(value) : `${hour}:${minute} ${period}`;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        className="flex items-center gap-1.5 bg-background hover:bg-gray-200/60 px-2.5 py-1 rounded-lg border border-divider hover:border-primary transition cursor-pointer select-none group"
      >
        <span className="text-[11px] text-secondary-text font-medium">
          {label}:
        </span>
        <span className="text-xs font-semibold text-black group-hover:text-primary transition-colors">
          {displayTime}
        </span>
        <Clock
          size={13}
          className="text-secondary-text group-hover:text-primary transition-colors ml-0.5"
        />
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E5E7EB",
              mt: 0.5,
              p: 1.5,
              width: "240px",
              zIndex: 1400,
            },
          },
        }}
      >
        {/* Header showing current selection in primary color */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-divider">
          <span className="text-[11px] font-medium text-secondary-text">
            {label} Time
          </span>
          <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-[#ffdfe2]">
            {hour}:{minute} {period}
          </span>
        </div>

        {/* 3 columns: Hour, Minute, Period */}
        <div className="flex items-start justify-between gap-1">
          {/* Column 1: Hours */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] uppercase font-bold text-secondary-text mb-1 tracking-wider">
              HR
            </span>
            <div
              ref={hourListRef}
              className="flex flex-col gap-1 max-h-44 overflow-y-auto w-full pr-0.5 scrollbar-thin"
            >
              {hours.map((h) => {
                const isSelected = h === hour;
                return (
                  <button
                    key={h}
                    type="button"
                    data-value={h}
                    onClick={() => updateTime(h, minute, period)}
                    className={`py-1 rounded-md text-xs font-semibold transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "text-black hover:bg-[#ffdfe2]/60 hover:text-primary"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Minutes */}
          <div className="flex flex-col items-center flex-1 border-x border-divider px-1">
            <span className="text-[10px] uppercase font-bold text-secondary-text mb-1 tracking-wider">
              MIN
            </span>
            <div
              ref={minuteListRef}
              className="flex flex-col gap-1 max-h-44 overflow-y-auto w-full pr-0.5 scrollbar-thin"
            >
              {minutes.map((m) => {
                const isSelected = m === minute;
                return (
                  <button
                    key={m}
                    type="button"
                    data-value={m}
                    onClick={() => updateTime(hour, m, period)}
                    className={`py-1 rounded-md text-xs font-semibold transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "text-black hover:bg-[#ffdfe2]/60 hover:text-primary"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3: AM / PM */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] uppercase font-bold text-secondary-text mb-1 tracking-wider">
              AM/PM
            </span>
            <div className="flex flex-col gap-1 w-full">
              {periods.map((p) => {
                const isSelected = p === period;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateTime(hour, minute, p)}
                    className={`py-2 rounded-md text-xs font-bold transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "text-black hover:bg-[#ffdfe2]/60 hover:text-primary"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Done button in primary color */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full mt-2.5 py-1 text-xs font-bold bg-primary text-white rounded-lg hover:opacity-90 transition cursor-pointer shadow-xs"
        >
          Done
        </button>
      </Popover>
    </>
  );
};

const buildWeekdaySchedulingPayload = (
  items: ScheduleItem[],
  isEveryday: boolean,
) => {
  const scheduling: Record<string, any> = {};
  items.forEach((item) => {
    const key = item.day.toLowerCase();
    scheduling[key] = {
      isOpen: item.isOpen,
      openingTime: item.isOpen ? item.openingTime || "06:00 AM" : "",
      closingTime: item.isOpen ? item.closingTime || "10:00 PM" : "",
      timeStr: item.isOpen ? item.timeStr : "Closed",
    };
  });
  if (isEveryday) {
    const firstOpen = items.find((i) => i.isOpen) || items[0];
    scheduling.everyday = {
      isOpen: true,
      openingTime: firstOpen?.openingTime || "06:00 AM",
      closingTime: firstOpen?.closingTime || "10:00 PM",
    };
  }
  return scheduling;
};

const EditClubRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOwner, loading } = useClubOwnerDetails(id ? Number(id) : 0);
  const { updateClubOwner } = useUpdateClubOwner();

  const { setGlobalLoader } = useUIStore();
  const { setSnackBar } = useSnackBarStore();

  // Photo Preview state
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Document Preview state
  const [selectedDocument, setSelectedDocument] =
    useState<ClubOwnerDocument | null>(null);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  // Schedule Edit state
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isEverydaySchedule, setIsEverydaySchedule] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<ScheduleItem[]>([]);
  const [draftIsEveryday, setDraftIsEveryday] = useState(false);

  const { control, handleSubmit, setValue } = useForm<EditClubForm>({
    defaultValues: {
      clubCategory: "",
      services: [],
      facilities: [],
    },
  });

  useEffect(() => {
    if (selectedOwner) {
      setValue("ownerName", selectedOwner.ownerName);
      setValue("email", selectedOwner.email);
      setValue("phoneNumber", selectedOwner.phoneNumber);
      setValue("clubCategory", selectedOwner.clubCategory);
      setValue("services", selectedOwner.services || []);
      setValue("facilities", selectedOwner.facilities || []);

      const parsed = parseSchedulingData(selectedOwner);
      setScheduleItems(parsed.scheduleItems);
      setIsEverydaySchedule(parsed.isEveryday);
    }
  }, [selectedOwner, setValue]);

  const handleOpenScheduleModal = () => {
    setDraftSchedule(JSON.parse(JSON.stringify(scheduleItems)));
    setDraftIsEveryday(isEverydaySchedule);
    setOpenScheduleModal(true);
  };

  const handleApplySchedule = () => {
    setScheduleItems(draftSchedule);
    setIsEverydaySchedule(draftIsEveryday);
    setOpenScheduleModal(false);
    setSnackBar("Schedule updated! Click Save to apply changes.", "success");
  };

  const logo = selectedOwner?.logo
    ? selectedOwner.logo.formats
      ? selectedOwner.logo.formats.thumbnail?.url
      : selectedOwner.logo.url
    : ICONS.DummyClubProfile;

  const time = getTimeShort(selectedOwner?.createdAt || "");

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

  const handleUpdate = async (data: EditClubForm) => {
    setGlobalLoader(true);
    try {
      const currentScheduling =
        scheduleItems.length > 0
          ? buildWeekdaySchedulingPayload(scheduleItems, isEverydaySchedule)
          : selectedOwner?.weekdayScheduling;

      const openDays = scheduleItems.filter((s) => s.isOpen);
      const firstOpen = openDays[0];

      const response = await updateClubOwner(Number(id), {
        data: {
          ownerName: data.ownerName,
          email: selectedOwner?.email || data.email,
          phoneNumber: data.phoneNumber,
          clubCategory: data.clubCategory,
          services: data.services,
          facilities: data.facilities,
          weekdayScheduling: currentScheduling,
          openingTime: firstOpen?.openingTime || selectedOwner?.openingTime,
          closingTime: firstOpen?.closingTime || selectedOwner?.closingTime,
          weekday: isEverydaySchedule
            ? "Everyday"
            : openDays.length > 0
              ? "Monday - Saturday"
              : "Closed",
        },
      });

      if (response) {
        setSnackBar("Club Updated Successfully", "success");
        navigate(-1);
      }
    } catch (error: any) {
      setSnackBar(error.message || "Something went wrong", "error");
    } finally {
      setGlobalLoader(false);
    }
  };

  return loading ? (
    <div className="flex justify-center items-center h-full p-6 bg-white rounded-xl w-full">
      <ActivityIndicator size={80} />
    </div>
  ) : (
    <form
      onSubmit={handleSubmit(handleUpdate)}
      className="flex w-full h-full flex-col gap-y-5"
    >
      {/* Club detail */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Review Club Request</h2>
        <div className="flex flex-row items-end justify-between w-full mt-4">
          <div className="flex flex-row gap-x-3 items-center justify-start">
            <img
              src={logo}
              alt={selectedOwner?.clubName}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-row gap-x-3">
                <span className="text-black text-[32px] leading-8 font-bold capitalize">
                  {selectedOwner?.clubName}
                </span>
                <div
                  className={`relative px-6.25 py-2 text-xs text-white rounded-[52px] ${selectedOwner?.user?.verification_status === "approved" ? "bg-lightGreen text-green!" : bgColor}`}
                >
                  {selectedOwner?.user?.verification_status === "approved"
                    ? "Approved"
                    : "Pending"}
                  {selectedOwner?.user?.verification_status === "pending" && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 bg-white px-2 py-1 rounded-full text-secondary-text border ${borderColor}`}
                    >
                      {time}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center">
                <img src={ICONS.Location} alt="location" className="w-3 h-4" />
                <span className="text-base text-secondary-text ml-2 capitalize">
                  {selectedOwner?.clubAddress}, {selectedOwner?.city},{" "}
                  {selectedOwner?.state} {selectedOwner?.pincode}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-x-3">
            <button
              type="submit"
              className="bg-background  w-auto h-12 rounded px-7.5 text-center text-secondary-text font-bold text-base cursor-pointer "
            >
              Save
            </button>
            <button
              onClick={() => navigate(-1)}
              type="button"
              className="bg-background  w-auto h-12 rounded px-7.5 text-center text-secondary-text font-bold text-base cursor-pointer "
            >
              Cancel
            </button>
          </div>
        </div>
      </CustomBox>
      {/* Club Information */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Club Information</h2>
        <div className="grid grid-cols-4 gap-4 mt-3">
          <TextInput
            label="Owner’s name"
            placeholder="Owner name"
            name="ownerName"
            control={control}
            rules={{ required: "Owner name is required" }}
          />

          <TextInput
            label="Id No."
            placeholder="Id No."
            name="clubId"
            value={selectedOwner?.clubId}
            disabled
          />

          <TextInput
            label="Phone Number"
            placeholder="Phone number"
            name="phoneNumber"
            control={control}
          />

          <TextInput
            label="Email Address"
            placeholder="Email"
            name="email"
            value={selectedOwner?.email}
            disabled
          />

          <Controller
            name="clubCategory"
            control={control}
            rules={{ required: "Club category is required" }}
            render={({ field, fieldState }) => (
              <Autocomplete
                options={CLUB_CATEGORIES}
                value={field.value || null}
                onChange={(_, newValue) => {
                  field.onChange(newValue);
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: 0,
                  },
                }}
                renderInput={(params) => (
                  <TextInput
                    placeholder="Category"
                    {...params}
                    label="Club Category"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
          />
        </div>
        <WeeklySchedule
          scheduleItems={scheduleItems}
          isEveryday={isEverydaySchedule}
          onEdit={handleOpenScheduleModal}
        />
      </CustomBox>
      {/* Club Type */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Club Type</h2>
        <Controller
          name="services"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-4 gap-y-4 mt-3">
              {ALL_SERVICES.map((service) => {
                const checked = field.value.includes(service);

                return (
                  <label
                    key={service}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          field.onChange(
                            field.value.filter((s: string) => s !== service),
                          );
                        } else {
                          field.onChange([...field.value, service]);
                        }
                      }}
                      className="accent-red-500 w-6 h-6"
                    />
                    <span className="text-sm text-secondary-text">
                      {service}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </CustomBox>

      {/* Amenities */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Amenities</h2>
        <Controller
          name="facilities"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-4 gap-y-4 mt-3">
              {ALL_FACILITIES.map((facility) => {
                const checked = field.value.includes(facility);

                return (
                  <label
                    key={facility}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          field.onChange(
                            field.value.filter((f: string) => f !== facility),
                          );
                        } else {
                          field.onChange([...field.value, facility]);
                        }
                      }}
                      className="accent-red-500 w-6 h-6"
                    />
                    <span className="text-sm text-secondary-text">
                      {facility}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </CustomBox>

      {/* Club Photos */}
      <CustomBox customClasses="p-4">
        <div className="w-full flex flex-row justify-between items-center-safe">
          <h2 className="text-lg font-medium">Club Photos</h2>
          {selectedOwner?.club_photos && selectedOwner.club_photos.length > 6 && (
            <CustomButton
              type="button"
              label="View All"
              buttonStyle="secondary"
              customStyles="rounded-full! px-6!"
              onClick={() => setShowAllPhotos(true)}
            />
          )}
        </div>
        {selectedOwner?.club_photos === null ? (
          <div className="mt-6 text-center text-xl font-bold">
            No Club Photo Available
          </div>
        ) : (
          <div
            className={`mt-3 flex flex-row w-full flex-wrap gap-4 ${(selectedOwner?.club_photos?.length ?? 0) >= 5 ? "justify-between" : "justify-start"}`}
          >
            {selectedOwner?.club_photos.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-[0_1px_12px_0_rgba(174,174,174,0.71)]"
              >
                <img
                  src={item?.images[0]?.url}
                  alt={item?.imageInfo}
                  className="w-42 h-33 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="text-white" size={24} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CustomBox>

      {/* Club Documents */}
      <CustomBox customClasses="p-4">
        <div className="w-full flex flex-row justify-between items-center-safe">
          <h2 className="text-lg font-medium">Club Documents</h2>
          {selectedOwner?.club_owner_documents &&
            selectedOwner.club_owner_documents.length > 6 && (
              <CustomButton
                type="button"
                label="View All"
                buttonStyle="secondary"
                customStyles="rounded-full! px-6!"
                onClick={() => setShowAllDocuments(true)}
              />
            )}
        </div>
        {selectedOwner?.club_owner_documents.length === 0 ? (
          <div className="my-6 text-center text-xl font-bold">
            No Documents Available
          </div>
        ) : (
          <div
            className={`mt-3 flex flex-row w-full flex-wrap gap-4 ${(selectedOwner?.club_owner_documents?.length ?? 0) >= 3 ? "justify-between" : "justify-start"}`}
          >
            {selectedOwner?.club_owner_documents.map((item) => (
              <FileCard
                key={item.id}
                fileName={item.documentName + (item.File?.ext || "")}
                uploadDate={item.publishedAt || item.createdAt || ""}
                fileSize={item.File?.size || 0}
                onClick={() => setSelectedDocument(item)}
                onMenuClick={() => setSelectedDocument(item)}
              />
            ))}
          </div>
        )}
      </CustomBox>

      {/* Single Photo Lightbox Modal */}
      <Dialog
        open={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
        maxWidth="lg"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 3,
            backgroundColor: "#111827",
            color: "#ffffff",
            overflow: "hidden",
            maxWidth: "90vw",
            maxHeight: "90vh",
          },
        }}
      >
        {selectedPhotoIndex !== null && selectedOwner?.club_photos && (
          <div className="flex flex-col w-full max-w-4xl p-4">
            <div className="flex flex-row justify-between items-center pb-3 border-b border-gray-700 mb-4">
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-white">
                  {selectedOwner.club_photos[selectedPhotoIndex]?.imageInfo ||
                    `Photo ${selectedPhotoIndex + 1}`}
                </span>
                <span className="text-xs text-gray-400">
                  {selectedPhotoIndex + 1} of {selectedOwner.club_photos.length}
                </span>
              </div>
              <div className="flex items-center gap-x-2">
                <a
                  href={selectedOwner.club_photos[selectedPhotoIndex]?.images[0]?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-300 hover:text-white"
                  title="Open Original"
                >
                  <ExternalLink size={20} />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-300 hover:text-white cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center min-h-75 max-h-[70vh]">
              {selectedOwner.club_photos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null
                        ? (prev - 1 + selectedOwner.club_photos.length) %
                        selectedOwner.club_photos.length
                        : 0,
                    )
                  }
                  className="absolute left-2 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              <img
                src={selectedOwner.club_photos[selectedPhotoIndex]?.images[0]?.url}
                alt={selectedOwner.club_photos[selectedPhotoIndex]?.imageInfo}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl"
              />

              {selectedOwner.club_photos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null
                        ? (prev + 1) % selectedOwner.club_photos.length
                        : 0,
                    )
                  }
                  className="absolute right-2 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* All Photos Gallery Modal */}
      <Dialog
        open={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            padding: 3,
          },
        }}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200">
          <h2 className="text-xl font-bold text-black">
            Club Photos ({selectedOwner?.club_photos?.length || 0})
          </h2>
          <button
            type="button"
            onClick={() => setShowAllPhotos(false)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto p-1">
          {selectedOwner?.club_photos?.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setShowAllPhotos(false);
                setSelectedPhotoIndex(idx);
              }}
              className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            >
              <img
                src={item?.images[0]?.url}
                alt={item?.imageInfo}
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="text-white" size={24} />
              </div>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Single Document Preview Modal */}
      <Dialog
        open={selectedDocument !== null}
        onClose={() => setSelectedDocument(null)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            padding: 3,
          },
        }}
      >
        {selectedDocument && (
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-black truncate max-w-md">
                  {selectedDocument.documentName}
                  {selectedDocument.File?.ext || ""}
                </h2>
                <span className="text-xs text-secondary-text">
                  Uploaded:{" "}
                  {dayjs(
                    selectedDocument.publishedAt || selectedDocument.createdAt,
                  ).format("MMMM DD, YYYY")}{" "}
                  | {formatFileSize(selectedDocument.File?.size || 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="w-full min-h-75 max-h-[60vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-200">
              {selectedDocument.File?.mime?.startsWith("image/") ||
                [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(
                  selectedDocument.File?.ext?.toLowerCase() || "",
                ) ? (
                <img
                  src={selectedDocument.File.url}
                  alt={selectedDocument.documentName}
                  className="max-h-[55vh] max-w-full object-contain rounded-md"
                />
              ) : selectedDocument.File?.mime === "application/pdf" ||
                selectedDocument.File?.ext?.toLowerCase() === ".pdf" ? (
                <iframe
                  src={selectedDocument.File.url}
                  title={selectedDocument.documentName}
                  className="w-full h-[55vh] rounded-md border-0"
                />
              ) : (
                <div className="flex flex-col items-center gap-y-3 py-10">
                  <div className="w-16 h-16 rounded-full bg-lightRed flex items-center justify-center p-3">
                    <img src={ICONS.Doc} alt="doc" className="w-full h-full" />
                  </div>
                  <span className="text-sm font-medium text-black">
                    {selectedDocument.documentName}
                    {selectedDocument.File?.ext || ""}
                  </span>
                  <span className="text-xs text-secondary-text">
                    Preview not directly supported in-browser for this format.
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-row justify-end gap-x-3 mt-5">
              <CustomButton
                type="button"
                label="Close"
                buttonStyle="secondary"
                onClick={() => setSelectedDocument(null)}
              />
              <a
                href={selectedDocument.File?.url}
                target="_blank"
                rel="noreferrer"
                className="no-underline"
              >
                <CustomButton
                  type="button"
                  label="Open / Download"
                  buttonStyle="primary"
                />
              </a>
            </div>
          </div>
        )}
      </Dialog>

      {/* All Documents Gallery Modal */}
      <Dialog
        open={showAllDocuments}
        onClose={() => setShowAllDocuments(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            padding: 3,
          },
        }}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200">
          <h2 className="text-xl font-bold text-black">
            Club Documents ({selectedOwner?.club_owner_documents?.length || 0})
          </h2>
          <button
            type="button"
            onClick={() => setShowAllDocuments(false)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto p-1">
          {selectedOwner?.club_owner_documents.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setShowAllDocuments(false);
                setSelectedDocument(item);
              }}
              className="flex flex-row items-center justify-between p-3 rounded-xl border border-divider hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-white"
            >
              <div className="flex items-center gap-x-3">
                <div className="w-10 h-10 rounded-lg bg-lightRed flex items-center justify-center p-2">
                  <img src={ICONS.Doc} alt="doc" className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">
                    {item.documentName}
                    {item.File?.ext || ""}
                  </span>
                  <span className="text-xs text-secondary-text">
                    Uploaded:{" "}
                    {dayjs(item.publishedAt || item.createdAt).format(
                      "MMMM DD, YYYY",
                    )}{" "}
                    | {formatFileSize(item.File?.size || 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-x-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md bg-background text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllDocuments(false);
                    setSelectedDocument(item);
                  }}
                >
                  Preview
                </button>
                <a
                  href={item.File?.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Edit Weekly Schedule Modal */}
      <Dialog
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            padding: "24px",
            borderRadius: "20px",
            maxWidth: "640px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          },
        }}
      >
        <div className="flex flex-col w-full gap-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-divider">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-black">
                  Edit Club Timings & Schedule
                </h3>
                <p className="text-xs text-secondary-text">
                  Update daily operating hours or set everyday timings
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenScheduleModal(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-background rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draftIsEveryday}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDraftIsEveryday(checked);
                  if (checked) {
                    const firstOpen =
                      draftSchedule.find((d) => d.isOpen) || draftSchedule[0];
                    const openTime = firstOpen?.openingTime || "06:00 AM";
                    const closeTime = firstOpen?.closingTime || "10:00 PM";
                    const timeStr = formatTimeRange(openTime, closeTime);
                    setDraftSchedule((prev) =>
                      prev.map((d) => ({
                        ...d,
                        isOpen: true,
                        openingTime: openTime,
                        closingTime: closeTime,
                        timeStr,
                      })),
                    );
                  }
                }}
                className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-black">
                Open Everyday (Same timings for all days)
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                const mon = draftSchedule.find((d) => d.day === "monday");
                if (!mon) return;
                const openTime = mon.openingTime || "06:00 AM";
                const closeTime = mon.closingTime || "10:00 PM";
                const timeStr = mon.isOpen
                  ? formatTimeRange(openTime, closeTime)
                  : "Closed";
                setDraftSchedule((prev) =>
                  prev.map((d) =>
                    d.day === "monday"
                      ? d
                      : {
                          ...d,
                          isOpen: mon.isOpen,
                          openingTime: openTime,
                          closingTime: closeTime,
                          timeStr,
                        },
                  ),
                );
              }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer bg-white border border-divider px-2.5 py-1 rounded-md shadow-xs hover:bg-gray-50 transition"
            >
              <Copy size={12} />
              <span>Copy Monday to all</span>
            </button>
          </div>

          {/* Days list */}
          <div className="flex flex-col gap-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {draftSchedule.map((item, idx) => {
              return (
                <div
                  key={item.day}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border transition-all gap-2 ${
                    item.isOpen
                      ? "bg-white border-divider shadow-xs"
                      : "bg-gray-50/70 border-dashed border-gray-300 opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-3 w-36">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftSchedule((prev) =>
                          prev.map((d, i) => {
                            if (i !== idx) return d;
                            const newIsOpen = !d.isOpen;
                            const openTime = d.openingTime || "06:00 AM";
                            const closeTime = d.closingTime || "10:00 PM";
                            return {
                              ...d,
                              isOpen: newIsOpen,
                              openingTime: newIsOpen ? openTime : "",
                              closingTime: newIsOpen ? closeTime : "",
                              timeStr: newIsOpen
                                ? formatTimeRange(openTime, closeTime)
                                : "Closed",
                            };
                          }),
                        );
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                        item.isOpen
                          ? "bg-lightGreen text-green hover:opacity-80"
                          : "bg-lightRed text-red hover:opacity-80"
                      }`}
                    >
                      {item.isOpen ? "OPEN" : "CLOSED"}
                    </button>
                    <span className="text-sm font-semibold text-black capitalize">
                      {item.label}
                    </span>
                  </div>

                  {item.isOpen ? (
                    <div className="flex items-center gap-2">
                      <TimePickerInput
                        label="Opens"
                        value={item.openingTime || "06:00 AM"}
                        fallbackHour="06"
                        fallbackPeriod="AM"
                        onChange={(formatted) => {
                          setDraftSchedule((prev) =>
                            prev.map((d, i) => {
                              if (i !== idx) return d;
                              const close = d.closingTime || "10:00 PM";
                              return {
                                ...d,
                                openingTime: formatted,
                                timeStr: formatTimeRange(formatted, close),
                              };
                            }),
                          );
                        }}
                      />
                      <span className="text-xs text-secondary-text font-bold">
                        -
                      </span>
                      <TimePickerInput
                        label="Closes"
                        value={item.closingTime || "10:00 PM"}
                        fallbackHour="10"
                        fallbackPeriod="PM"
                        onChange={(formatted) => {
                          setDraftSchedule((prev) =>
                            prev.map((d, i) => {
                              if (i !== idx) return d;
                              const open = d.openingTime || "06:00 AM";
                              return {
                                ...d,
                                closingTime: formatted,
                                timeStr: formatTimeRange(open, formatted),
                              };
                            }),
                          );
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-secondary-text italic px-2">
                      Closed all day
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end items-center gap-x-3 pt-3 border-t border-divider">
            <CustomButton
              type="button"
              label="Cancel"
              buttonStyle="secondary"
              onClick={() => setOpenScheduleModal(false)}
            />
            <CustomButton
              type="button"
              label="Apply Schedule"
              buttonStyle="primary"
              onClick={handleApplySchedule}
            />
          </div>
        </div>
      </Dialog>
    </form>
  );
};

export default EditClubRequest;

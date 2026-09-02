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
  formatTo12Hour,
  getTimeShort,
} from "../../utility/utili";
import { useEffect, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import useSnackBarStore from "../../store/snackBar.store";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FileCard } from "../../components/atoms/fileCard/FileCard";
import { Controller, useForm } from "react-hook-form";
import {
  ALL_FACILITIES,
  ALL_SERVICES,
  CLUB_CATEGORIES,
  type EditClubForm,
} from "./types";
import TextInput from "../../components/modules/textInput/TextInput";
import { Autocomplete, Dialog } from "@mui/material";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, X } from "lucide-react";
import dayjs from "dayjs";
import type { ClubOwnerDocument } from "../../api/clubRequest/clubRequest.types";

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
      setValue("weekday", selectedOwner.weekday);
      setValue("weekend", selectedOwner.weekend);
      setValue("services", selectedOwner.services || []);
      setValue("facilities", selectedOwner.facilities || []);
    }
  }, [selectedOwner, setValue]);

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
      const response = await updateClubOwner(Number(id), {
        data: {
          ownerName: data.ownerName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          clubCategory: data.clubCategory,
          weekday: data.weekday,
          weekend: data.weekend,
          services: data.services,
          facilities: data.facilities,
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
            {/* <button
              type="button"
              onClick={() => console.log("Chat")}
              className="bg-red w-12 h-12 rounded p-2.5 items-center cursor-pointer "
            >
              <img src={ICONS.Chat} className="w-full h-full" />
            </button> */}
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
            control={control}
          />

          <TextInput
            label="Timing"
            placeholder="Timing"
            name="timing"
            value={
              formatTo12Hour(selectedOwner?.openingTime || "") +
              " to " +
              formatTo12Hour(selectedOwner?.closingTime || "")
            }
            disabled
          />

          <TextInput
            label="Weekday"
            placeholder="Weekday"
            name="weekday"
            control={control}
          />

          <TextInput
            label="Weekend"
            placeholder="Weekend"
            name="weekend"
            control={control}
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
          {selectedOwner?.clubPhotos && selectedOwner.clubPhotos.length > 6 && (
            <CustomButton
              type="button"
              label="View All"
              buttonStyle="secondary"
              customStyles="rounded-full! px-6!"
              onClick={() => setShowAllPhotos(true)}
            />
          )}
        </div>
        {selectedOwner?.clubPhotos === null ? (
          <div className="mt-6 text-center text-xl font-bold">
            No Club Photo Available
          </div>
        ) : (
          <div
            className={`mt-3 flex flex-row w-full flex-wrap gap-4 ${(selectedOwner?.clubPhotos?.length ?? 0) >= 5 ? "justify-between" : "justify-start"}`}
          >
            {selectedOwner?.clubPhotos.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-[0_1px_12px_0_rgba(174,174,174,0.71)]"
              >
                <img
                  src={item?.url}
                  alt={item.name}
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
        {selectedPhotoIndex !== null && selectedOwner?.clubPhotos && (
          <div className="flex flex-col w-full max-w-4xl p-4">
            <div className="flex flex-row justify-between items-center pb-3 border-b border-gray-700 mb-4">
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-white">
                  {selectedOwner.clubPhotos[selectedPhotoIndex]?.name ||
                    `Photo ${selectedPhotoIndex + 1}`}
                </span>
                <span className="text-xs text-gray-400">
                  {selectedPhotoIndex + 1} of {selectedOwner.clubPhotos.length}
                </span>
              </div>
              <div className="flex items-center gap-x-2">
                <a
                  href={selectedOwner.clubPhotos[selectedPhotoIndex]?.url}
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
              {selectedOwner.clubPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null
                        ? (prev - 1 + selectedOwner.clubPhotos.length) %
                          selectedOwner.clubPhotos.length
                        : 0,
                    )
                  }
                  className="absolute left-2 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              <img
                src={selectedOwner.clubPhotos[selectedPhotoIndex]?.url}
                alt={selectedOwner.clubPhotos[selectedPhotoIndex]?.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl"
              />

              {selectedOwner.clubPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null
                        ? (prev + 1) % selectedOwner.clubPhotos.length
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
            Club Photos ({selectedOwner?.clubPhotos?.length || 0})
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
          {selectedOwner?.clubPhotos?.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setShowAllPhotos(false);
                setSelectedPhotoIndex(idx);
              }}
              className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            >
              <img
                src={item?.url}
                alt={item.name}
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
    </form>
  );
};

export default EditClubRequest;

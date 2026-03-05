/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router";
import {
  useClubOwnerDetails,
  useUpdateClubOwner,
} from "../../hooks/clubOwner/useClubOwner";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import { ICONS } from "../../assets/exports";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import { formatTo12Hour, getTimeShort } from "../../utility/utili";
import { useEffect } from "react";
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
import { Autocomplete } from "@mui/material";

const EditClubRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOwner, loading } = useClubOwnerDetails(id ? Number(id) : 0);
  const { updateClubOwner } = useUpdateClubOwner();

  const { setGlobalLoader } = useUIStore();
  const { setSnackBar } = useSnackBarStore();

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
                  {selectedOwner?.clubAddress}, {selectedOwner?.city},
                  {selectedOwner?.state}
                </span>
                <span className="bg-background rounded-full px-2.5 py-1 text-xs text-secondary-text">
                  Change
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-x-3">
            <button
              onClick={() => console.log("Chat")}
              className="bg-red w-12 h-12 rounded p-2.5 items-center cursor-pointer "
            >
              <img src={ICONS.Chat} className="w-full h-full" />
            </button>
            <button
              type="submit"
              className="bg-background  w-auto h-12 rounded px-7.5 text-center text-secondary-text font-bold text-base cursor-pointer "
            >
              Save
            </button>
            <button
              onClick={() => navigate(-1)}
              type="reset"
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
          <CustomButton
            label="View All"
            buttonStyle="secondary"
            customStyles="rounded-full! px-6!"
          />
        </div>
        {selectedOwner?.clubPhotos.length === 0 ? (
          <div className="mt-6 text-center text-xl font-bold">
            No Club Photo Available
          </div>
        ) : (
          <div
            className={`mt-3 flex flex-row w-full flex-wrap gap-4 ${(selectedOwner?.clubPhotos?.length ?? 0) >= 5 ? "justify-between" : "justify-start"}`}
          >
            {selectedOwner?.clubPhotos.map((item, idx) => (
              <img
                key={idx}
                src={item?.url}
                alt={item.name}
                className="w-42 h-33 rounded-xl shadow-[0_1px_12px_0_rgba(174,174,174,0.71)]"
              />
            ))}
          </div>
        )}
      </CustomBox>

      {/* Club Documents */}
      <CustomBox customClasses="p-4">
        <div className="w-full flex flex-row justify-between items-center-safe">
          <h2 className="text-lg font-medium">Club Documents</h2>
          <CustomButton
            label="View All"
            buttonStyle="secondary"
            customStyles="rounded-full! px-6!"
          />
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
                fileName={item.documentName + item.File.ext}
                uploadDate={item.publishedAt || ""}
                fileSize={item.File.size}
              />
            ))}
          </div>
        )}
      </CustomBox>
    </form>
  );
};

export default EditClubRequest;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router";
import { useClubOwnerDetails } from "../../hooks/clubOwner/useClubOwner";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import { ICONS } from "../../assets/exports";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import { formatTo12Hour, getTimeShort } from "../../utility/utili";
import { Dialog } from "@mui/material";
import { useState } from "react";
import { useUIStore } from "../../store/ui.store";
import { verifyApproval } from "../../api/clubRequest/clubRequestApi";
import useSnackBarStore from "../../store/snackBar.store";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { FileCard } from "../../components/atoms/fileCard/FileCard";
import { InfoField } from "../../components/atoms/infoField/InfoField";

const ViewClubRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOwner, loading } = useClubOwnerDetails(id ? Number(id) : 0);
  const [openModal, setOpenModal] = useState(false);
  const { setGlobalLoader } = useUIStore();
  const { setSnackBar } = useSnackBarStore();

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

  const handleAccept = async (userId?: number) => {
    setGlobalLoader(true);
    try {
      if (!userId) return;
      const response = await verifyApproval(userId);
      if (response.message === "User verification approved") {
        setSnackBar("User Approved Successfully!", "success");
        setOpenModal(true);
      }
    } catch (error: any) {
      setSnackBar(error.message || "Something went wrong", "error");
      console.log("Error: Something went wrong", error);
      setGlobalLoader(false);
    } finally {
      setGlobalLoader(false);
    }
  };

  return loading ? (
    <div className="flex justify-center items-center h-full p-6 bg-white rounded-xl w-full">
      <ActivityIndicator size={80} />
    </div>
  ) : (
    <div className="flex w-full h-full flex-col gap-y-5">
      {/* Club detail */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Club Detail</h2>
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
              onClick={() => {
                if (selectedOwner?.user?.verification_status === "approved") {
                  navigate(`/clubs/edit/${selectedOwner?.id}`);
                } else {
                  navigate(`/club-request/edit/${selectedOwner?.id}`);
                }
              }}
              className="bg-background w-12 h-12 rounded p-2.5 items-center cursor-pointer "
            >
              <img src={ICONS.Edit} className="w-full h-full" />
            </button>
            {selectedOwner?.user?.verification_status === "pending" && (
              <>
                <button
                  onClick={() => handleAccept(selectedOwner?.user.id)}
                  className="bg-[#22C55E] w-auto h-12 rounded px-7.5 text-center text-white font-bold text-base cursor-pointer "
                >
                  Accept
                </button>
                <button
                  onClick={() => navigate("/club-request")}
                  className="bg-background  w-auto h-12 rounded px-7.5 text-center text-secondary-text font-bold text-base cursor-pointer "
                >
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      </CustomBox>
      {/* Club Information */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Club Information</h2>
        <div className="mt-3 flex flex-row w-full flex-wrap gap-y-3.75">
          <InfoField label="Owner’s name" value={selectedOwner?.ownerName} />
          <InfoField label="Email Address" value={selectedOwner?.email} />
          <InfoField label="Id No." value={selectedOwner?.clubId} />
          <InfoField label="Phone Number" value={selectedOwner?.phoneNumber} />
          <InfoField
            label="Club Category"
            value={selectedOwner?.clubCategory}
          />
          <InfoField
            label="Timings"
            value={
              formatTo12Hour(selectedOwner?.openingTime || "") +
              " - " +
              formatTo12Hour(selectedOwner?.closingTime || "")
            }
          />
          <InfoField label="Weekday" value={selectedOwner?.weekday} />
          <InfoField label="Weekend" value={selectedOwner?.weekend} />
        </div>
      </CustomBox>
      {/* Club Type */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Club Type</h2>
        <div className="mt-3 flex flex-row w-full flex-wrap gap-y-4">
          {selectedOwner?.services.map((item, idx) => (
            <div
              key={idx}
              className="w-[25%] flex flex-row gap-x-0.5 items-center"
            >
              <img src={ICONS.Tick} className="w-6 h-6" />
              <span className="text-secondary-text text-sm">{item}</span>
            </div>
          ))}
        </div>
      </CustomBox>
      {/* Amenities */}
      <CustomBox customClasses="p-4">
        <h2 className="text-lg font-medium">Amenities</h2>
        <div className="mt-3 flex flex-row w-full flex-wrap gap-y-4">
          {selectedOwner?.facilities.map((item, idx) => (
            <div
              key={idx}
              className="w-[25%] flex flex-row gap-x-0.5 items-center"
            >
              <img src={ICONS.Tick} className="w-6 h-6" />
              <span className="text-secondary-text text-sm">{item}</span>
            </div>
          ))}
        </div>
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

      {/* Verified Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            padding: "32px 24px",
            width: 524,
            boxShadow: "0 0 52px 0 rgba(0, 0, 0, 0.12)",
            borderRadius: 5,
            alignItems: "center",
          },
        }}
      >
        <img src={ICONS.Verified} className="w-22 h-22.5 mb-4" />
        <h3 className="mb-3 font-bold text-2xl text-black">
          Club Verified Successfully!
        </h3>
        <span className="text-sm text-black mb-6 text-center">
          This club has been reviewed and approved. It is now live and visible
          to members on fitfob.
        </span>
        <div className="flex flex-row gap-x-3 w-full">
          <CustomButton
            label="Go to dashboard"
            customStyles="w-full"
            onClick={() => navigate("/clubs")}
          />
          <CustomButton
            label="Close"
            customStyles="w-full"
            buttonStyle="secondary"
            onClick={() => navigate("/club-request")}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ViewClubRequest;

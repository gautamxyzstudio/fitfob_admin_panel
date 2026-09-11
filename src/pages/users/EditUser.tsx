import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import { useClientDetail, useUpdateClient } from "../../hooks/client/useClient";
import { IMAGES } from "../../assets/exports";
import { CameraAlt } from "@mui/icons-material";
import { Switch, TextField } from "@mui/material";
import dayjs from "dayjs";

const EditUser = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { client, loading } = useClientDetail(docId);
  const { updateClient, isUpdating } = useUpdateClient();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [location, setLocation] = useState("");
  const [signUpDate, setSignUpDate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isActive, setIsActive] = useState(true);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (client && !isInitialized.current) {
      setName(client.name || "");
      setEmail(client.email || "");
      setPhone(client.phoneNumber || "");
      setAccountNo(client.clientId || "FTB-ACC-000234");

      const loc =
        client.location ||
        (client.local_subscriptions?.[0]?.club_owner?.clubAddress
          ? `${client.local_subscriptions[0].club_owner.clubAddress}`
          : client.local_subscriptions?.[0]?.club_owner?.city
          ? `${client.local_subscriptions[0].club_owner.city}, ${client.local_subscriptions[0].club_owner.state}`
          : "Sector 3, Faridabad, India");
      setLocation(loc);

      setSignUpDate(
        client.createdAt
          ? dayjs(client.createdAt).format("DD/MM/YYYY")
          : "10/02/2025",
      );

      setDateOfBirth(
        client.date_of_birth
          ? dayjs(client.date_of_birth).format("DD/MM/YYYY")
          : "18/01/2001",
      );

      setIsActive(client.user?.blocked !== true);
      isInitialized.current = true;
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId) return;

    try {
      await updateClient({
        docId,
        payload: {
          name,
          email,
          phoneNumber: phone,
          clientId: accountNo,
          location,
          date_of_birth: dateOfBirth,
          isActive,
        },
      });

      navigate(`/users/view/${docId}`);
    } catch {
      // Error handled by hook toast
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6 bg-white rounded-xl w-full">
        <ActivityIndicator size={80} />
      </div>
    );
  }

  const avatar = client?.selfieUpload?.url || IMAGES.DummyPROFILE;

  return (
    <div className="flex w-full flex-col gap-y-4 pb-6">
      {/* Breadcrumbs matching image 3 */}
      <div className="flex items-center text-sm gap-1 text-secondary-text">
        <span
          onClick={() => navigate("/users")}
          className="cursor-pointer hover:underline text-secondary-text"
        >
          All Club Requests
        </span>
        <span className="mx-1">&gt;</span>
        <span
          onClick={() => navigate(`/users/view/${docId}`)}
          className="cursor-pointer hover:underline text-secondary-text"
        >
          User Detail Page
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        {/* Profile Header Card */}
        <CustomBox customClasses="p-5 flex flex-row items-center justify-start gap-x-4">
          <div className="relative w-18 h-18">
            <img
              src={avatar}
              alt="avatar"
              className="w-18 h-18 rounded-2xl object-cover border border-gray-100 shadow-xs"
            />
            <div
              title="Change photo"
              className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full flex items-center justify-center cursor-pointer shadow"
            >
              <CameraAlt sx={{ fontSize: 14 }} />
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <h2 className="text-xl font-bold text-black capitalize">
              {name || "David Lee"}
            </h2>
            <span className="text-sm text-secondary-text">
              {email || "davidlee@gmail.com"}
            </span>
          </div>
        </CustomBox>

        {/* Account Information Form Card */}
        <CustomBox customClasses="p-5 flex flex-col gap-y-5">
          <h3 className="text-base font-semibold text-black">
            Account Information
          </h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Left Col: Name */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Name
              </label>
              <TextField
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="David Lee"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Right Col: Email */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Email
              </label>
              <TextField
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="davidlee@gmail.com"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Left Col: Phone */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Phone
              </label>
              <TextField
                variant="outlined"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 91234-56789"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Right Col: Account No */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Account No:
              </label>
              <TextField
                variant="outlined"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="FTB-ACC-000234"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Left Col: Location */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Location
              </label>
              <TextField
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Sector 3, Faridabad, India"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Right Col: Sign Up Date */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Sign Up Date
              </label>
              <TextField
                variant="outlined"
                value={signUpDate}
                onChange={(e) => setSignUpDate(e.target.value)}
                placeholder="10/02/2025"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Left Col: Date of Birth */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Date of Birth
              </label>
              <TextField
                variant="outlined"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="18/01/2001"
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                    "&.Mui-focused fieldset": { borderColor: "#e23744" },
                  },
                }}
              />
            </div>

            {/* Right Col: Status Toggle */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Status
              </label>
              <div className="flex items-center justify-between h-[40px] px-1">
                <span className="text-sm font-medium text-black capitalize">
                  {isActive ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#fff",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#e23744 !important",
                      opacity: 1,
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: "#E5E7EB",
                      opacity: 1,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </CustomBox>

        {/* Bottom Action Buttons matching Image 3 */}
        <div className="flex flex-row gap-x-4 pt-1">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-48 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg text-sm cursor-pointer transition disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-48 bg-[#E5E7EB] hover:bg-gray-300 text-secondary-text hover:text-black font-bold py-3 px-6 rounded-lg text-sm cursor-pointer transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

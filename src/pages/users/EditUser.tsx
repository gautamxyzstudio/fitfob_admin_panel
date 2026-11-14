/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import { useClientDetail, useUpdateClient } from "../../hooks/client/useClient";
import type { UpdateClientPayload } from "../../api/client/client.types";
import { IMAGES } from "../../assets/exports";
import { CameraAlt } from "@mui/icons-material";
import { Switch, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { formatLocalDate, toLocalDate } from "../../utility/dayjs";

/**
 * Normalizes any date string (ISO, YYYY-MM-DD, or DD/MM/YYYY) to YYYY-MM-DD
 */
const parseToYMD = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("/");
    return `${y}-${m}-${d}`;
  }
  const parsed = toLocalDate(trimmed);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

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
  const [dateOfBirth, setDateOfBirth] = useState(""); // Stored as YYYY-MM-DD
  const [isActive, setIsActive] = useState(true);

  // Initial State to track changes
  const [initialValues, setInitialValues] = useState<{
    name: string;
    phone: string;
    location: string;
    dateOfBirth: string;
    isActive: boolean;
  } | null>(null);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (client && !isInitialized.current) {
      const initialName = client.name || "";
      const initialEmail = client.email || "";
      const initialPhone = client.phoneNumber || "";
      const initialAccountNo = client.clientId || "";

      const initialLoc =
        client.location ||
        (client.local_subscriptions?.[0]?.club_owner?.clubAddress
          ? `${client.local_subscriptions[0].club_owner.clubAddress}`
          : client.local_subscriptions?.[0]?.club_owner?.city
          ? `${client.local_subscriptions[0].club_owner.city}, ${client.local_subscriptions[0].club_owner.state}`
          : "");

      const initialSignUpDate = client.createdAt
        ? formatLocalDate(client.createdAt, "DD/MM/YYYY")
        : "";

      const initialDob = parseToYMD(client.date_of_birth);
      const initialActive = client.user?.blocked !== true;

      setName(initialName);
      setEmail(initialEmail);
      setPhone(initialPhone);
      setAccountNo(initialAccountNo);
      setLocation(initialLoc);
      setSignUpDate(initialSignUpDate);
      setDateOfBirth(initialDob);
      setIsActive(initialActive);

      setInitialValues({
        name: initialName,
        phone: initialPhone,
        location: initialLoc,
        dateOfBirth: initialDob,
        isActive: initialActive,
      });

      isInitialized.current = true;
    }
  }, [client]);

  // Determine if any editable field has changed
  const hasChanges = useMemo(() => {
    if (!initialValues) return false;
    if (name.trim() !== initialValues.name.trim()) return true;
    if (phone.trim() !== initialValues.phone.trim()) return true;
    if (location.trim() !== initialValues.location.trim()) return true;
    if (dateOfBirth !== initialValues.dateOfBirth) return true;
    if (isActive !== initialValues.isActive) return true;
    return false;
  }, [name, phone, location, dateOfBirth, isActive, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId || !hasChanges || !initialValues) return;

    // Build payload containing ONLY modified fields
    const payload: UpdateClientPayload = {};

    if (name.trim() !== initialValues.name.trim()) {
      payload.name = name.trim();
    }
    if (phone.trim() !== initialValues.phone.trim()) {
      payload.phoneNumber = phone.trim();
    }
    if (location.trim() !== initialValues.location.trim()) {
      payload.location = location.trim();
    }
    if (dateOfBirth !== initialValues.dateOfBirth) {
      payload.date_of_birth = dateOfBirth; // Formatted as YYYY-MM-DD
    }
    if (isActive !== initialValues.isActive) {
      payload.isActive = isActive;
    }

    if (Object.keys(payload).length === 0) return;

    try {
      await updateClient({
        docId,
        payload,
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

  // Disabled field styling
  const disabledFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#F9FAFB",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&.Mui-disabled": {
        backgroundColor: "#F9FAFB",
        "& fieldset": { borderColor: "#E5E7EB" },
      },
    },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "#6B7280",
      cursor: "not-allowed",
    },
  };

  const editableFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#fff",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#D1D5DB" },
      "&.Mui-focused fieldset": { borderColor: "#e23744" },
    },
  };

  return (
    <div className="flex w-full flex-col gap-y-4 pb-6">
      {/* Breadcrumbs matching image 3 */}
      <div className="flex items-center text-sm gap-1 text-secondary-text">
        <span
          onClick={() => navigate("/users")}
          className="cursor-pointer hover:underline text-secondary-text"
        >
          All Users
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
              {name || client?.name || "User"}
            </h2>
            <span className="text-sm text-secondary-text">
              {email || client?.email || ""}
            </span>
          </div>
        </CustomBox>

        {/* Account Information Form Card */}
        <CustomBox customClasses="p-5 flex flex-col gap-y-5">
          <h3 className="text-base font-semibold text-black">
            Account Information
          </h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Left Col: Name (Editable) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Name
              </label>
              <TextField
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter user name"
                fullWidth
                size="small"
                sx={editableFieldSx}
              />
            </div>

            {/* Right Col: Email (Non-editable) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Email
              </label>
              <TextField
                variant="outlined"
                value={email}
                disabled
                slotProps={{ input: { readOnly: true } }}
                placeholder="email@example.com"
                fullWidth
                size="small"
                sx={disabledFieldSx}
              />
            </div>

            {/* Left Col: Phone (Editable) */}
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
                sx={editableFieldSx}
              />
            </div>

            {/* Right Col: Account No (Non-editable) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Account No:
              </label>
              <TextField
                variant="outlined"
                value={accountNo}
                disabled
                slotProps={{ input: { readOnly: true } }}
                placeholder="Account number"
                fullWidth
                size="small"
                sx={disabledFieldSx}
              />
            </div>

            {/* Left Col: Location (Editable) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Location
              </label>
              <TextField
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                fullWidth
                size="small"
                sx={editableFieldSx}
              />
            </div>

            {/* Right Col: Sign Up Date (Non-editable) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Sign Up Date
              </label>
              <TextField
                variant="outlined"
                value={signUpDate}
                disabled
                slotProps={{ input: { readOnly: true } }}
                placeholder="DD/MM/YYYY"
                fullWidth
                size="small"
                sx={disabledFieldSx}
              />
            </div>

            {/* Left Col: Date of Birth (Editable with DatePicker, YYYY-MM-DD for payload) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Date of Birth
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dateOfBirth ? dayjs(dateOfBirth) : null}
                  onChange={(newValue) => {
                    setDateOfBirth(
                      newValue && newValue.isValid()
                        ? newValue.format("YYYY-MM-DD")
                        : "",
                    );
                  }}
                  format="DD/MM/YYYY"
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "DD/MM/YYYY",
                      sx: editableFieldSx,
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            {/* Right Col: Status Toggle (Editable) */}
            <div className="flex flex-col gap-y-1.5">
              <label className="text-xs text-secondary-text font-normal">
                Status
              </label>
              <div className="flex items-center justify-between h-10 px-1">
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

        {/* Bottom Action Buttons */}
        <div className="flex flex-row gap-x-4 pt-1">
          <button
            type="submit"
            disabled={!hasChanges || isUpdating}
            className="w-48 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg text-sm cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
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

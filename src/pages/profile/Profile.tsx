import CustomBox from "../../components/atoms/customBox/CustomBox";
import { IMAGES } from "../../assets/exports";
import {
  Email,
  CheckCircle,
} from "@mui/icons-material";

const Profile = () => {
  // Retrieve logged-in admin data from localStorage
  const storedUserStr = localStorage.getItem("user");
  const storedData = storedUserStr ? JSON.parse(storedUserStr) : null;
  const user = storedData?.user || storedData || {};

  const adminName = user?.username || user?.name || "Admin";
  const adminEmail = user?.email || "admin@fitfob.com";
  const adminRole = user?.role?.name || user?.role || "Admin";

  return (
    <div className="flex flex-col gap-y-5 w-full pb-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-black tracking-tight">
          Admin Profile
        </h1>
        <p className="text-xs text-secondary-text">
          Manage your personal credentials, administrative role, and account security
        </p>
      </div>

      {/* Main Profile Card with Fitfob Branded Banner */}
      <CustomBox customClasses="relative overflow-hidden p-0 border border-divider shadow-sm rounded-2xl bg-white">
        {/* Fitfob Branded Banner Image */}
        <div className="h-56 sm:h-64 w-full relative overflow-hidden bg-black">
          <img
            src={IMAGES.FitfobBanner}
            alt="Fitfob Official Banner"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 pb-6 pt-4 relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
            {/* Avatar popping out gracefully over banner */}
            <div className="relative -mt-18 shrink-0">
              <img
                src={IMAGES.DummyPROFILE}
                alt="Admin Avatar"
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green border-2 border-white flex items-center justify-center shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-x-2.5">
                <h2 className="text-2xl font-bold text-black capitalize leading-tight">
                  {adminName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-red/10 text-red border border-red/20  ">
                  {adminRole}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-secondary-text">
                <span className="flex items-center gap-x-1.5">
                  <Email className="w-4 h-4 text-secondary-text" />
                  {adminEmail}
                </span>
                {/* {adminPhone && (
                  <span className="flex items-center gap-x-1.5">
                    <Phone className="w-4 h-4 text-secondary-text" />
                    {adminPhone}
                  </span>
                )} */}
              </div>
            </div>
          </div>

    
        </div>
      </CustomBox>
    </div>
  );
};

export default Profile;

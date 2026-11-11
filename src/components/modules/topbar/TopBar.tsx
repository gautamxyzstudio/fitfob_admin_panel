import { Logout, Notifications, Person, Settings } from "@mui/icons-material";
import CustomBox from "../../atoms/customBox/CustomBox";
import { Link, useLocation, useNavigate } from "react-router";
import { ICONS, IMAGES } from "../../../assets/exports";
import DrawerNotification from "../drawerNotification/DrawerNotification";
import { useState } from "react";

const getPageTitle = (pathname: string): string => {
  if (pathname === "/app/master-pricing") return "Master Pricing";
  if (pathname === "/app/facilities") return "Facilities";
  if (pathname === "/app/club-types") return "Club Types";
  if (pathname === "/app/gemini-key") return "Gemini Key";
  if (pathname.startsWith("/app")) return "App Settings";
  if (pathname.startsWith("/club-request")) return "Club Request";
  if (pathname.startsWith("/clubs")) return "Clubs";
  if (pathname.startsWith("/users")) return "Users";
  if (pathname.startsWith("/earnings")) return "Earnings";
  if (pathname.startsWith("/check-in")) return "Check In";
  if (pathname.startsWith("/payouts")) return "Payouts";
  if (pathname === "/profile") return "Profile";
  if (pathname === "/settings") return "Settings";
  return "Dashboard";
};

const TopBar = () => {
  const [openNotification, setOpenNotification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const title = getPageTitle(location.pathname);

  return (
    <div className="w-full flex flex-row gap-x-3 justify-between sticky top-0 z-99">
      <CustomBox customClasses="w-[82%] rounded-xl pl-5 p-1.5 flex items-center justify-between shadow">
        <Link to={location.pathname}>
          <h2 className="text-black font-semibold text-base">{title}</h2>
        </Link>
      </CustomBox>
      <div className="relative">
        <img
          onClick={() => setOpenNotification(true)}
          src={ICONS.Notification}
          alt="notification"
          className="cursor-pointer w-15 h-16 p-3 bg-white rounded-xl"
        />
        <span className="absolute p-1 top-2.5 right-2.5 bg-primary text-white text-[10px] font-bold w-fit h-fit rounded-full flex items-center justify-center pointer-events-none">
          04
        </span>
      </div>
      <img
        onClick={() => navigate("/settings")}
        src={ICONS.Setting}
        alt="setting"
        className="cursor-pointer w-15 h-16 p-3 bg-white rounded-xl"
      />
      <div className="dropdown dropdown-hover dropdown-end">
        <img
          src={IMAGES.DummyPROFILE}
          onClick={() => navigate("/profile")}
          alt="profile"
          className="w-16 h-16 rounded-xl object-cover cursor-pointer "
          tabIndex={0}
          role="button"
        />
        <div
          tabIndex={-1}
          className="dropdown-content menu bg-white rounded-box z-1 p-3 shadow-sm gap-y-2 w-40"
        >
          <Link
            to={"/profile"}
            className="flex items-center gap-0.5 w-full cursor-pointer group text-secondary-text hover:text-primary hover:bg-background hover:font-medium px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out"
          >
            <Person className="group-hover:text-primary" />
            Profile
          </Link>
          <Link
            to={"/settings"}
            className="flex items-center gap-0.5 w-full cursor-pointer group text-secondary-text hover:text-primary hover:bg-background hover:font-medium px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out"
          >
            <Settings className="group-hover:text-primary" />
            Settings
          </Link>
          <Link
            to={"/notifications"}
            className="flex items-center gap-0.5 w-full cursor-pointer group text-secondary-text hover:text-primary hover:bg-background hover:font-medium px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out"
          >
            <Notifications className="group-hover:text-primary" />
            Notifications
          </Link>

          <Link
            to={"/logout"}
            className="flex items-center gap-0.5 w-full cursor-pointer group text-secondary-text hover:text-primary hover:bg-background hover:font-medium px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out"
          >
            <Logout className="group-hover:text-primary" />
            Logout
          </Link>
        </div>
      </div>
      <DrawerNotification
        open={openNotification}
        onClose={() => setOpenNotification(false)}
      />
    </div>
  );
};

export default TopBar;

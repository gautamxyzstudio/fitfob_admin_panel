import { Link, useLocation, useNavigate } from "react-router";
import CustomBox from "../../atoms/customBox/CustomBox";
import { ICONS } from "../../../assets/exports";
import CustomButton from "../../atoms/customButton/CustomButton";
import { ChevronRight, Logout } from "@mui/icons-material";
import { routes } from "../../../routes/routes";

const SideNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkPress = (href: string) => {
    if (href === "Log Out") {
      navigate("/login");
    }
  };
  return (
    <CustomBox customClasses="p-5 pt-4.5 flex w-[18%] h-full flex-col justify-between items-center overflow-clip overflow-y-scroll scrollbar-hide">
      <div className="w-full h-full  flex flex-col gap-y-8">
        <Link to="/" className="flex flex-row gap-x-1.75 items-center">
          <img className="w-auto h-8" src={ICONS.FITFOB} alt="XYZ Studio" />
          <span className="text-black font-extrabold text-[32px] leading-8">
            Fitfob
          </span>
        </Link>
        <div className="flex flex-col gap-y-3 h-full overflow-scroll scrollbar-hide">
          {routes.map((route) => {
            const isActive =
              location.pathname === route.route ||
              location.pathname.startsWith(route.route + "/");
            return (
              <Link
                to={route.route}
                key={route.key}
                className={
                  isActive
                    ? "bg-linear-to-r from-0% from-primary to-60% to-white p-px rounded-xl"
                    : ""
                }
              >
                <div className="bg-white rounded-[10px] px-4 py-3.5 flex flex-col gap-y-1">
                  <div className="flex flex-row gap-x-3 items-center">
                    <img
                      src={isActive ? route.iconFill : route.icon}
                      alt={route.key}
                      className="w-5 h-5 object-contain transition duration-300 ease-in-out"
                    />
                    <span
                      className={`${
                        isActive ? "text-primary" : "text-secondary-text"
                      } transition text-sm duration-300 ease-in-out`}
                    >
                      {route.name}
                    </span>
                    {route.subRoute && (
                      <ChevronRight
                        className={
                          isActive
                            ? "-rotate-90 text-primary"
                            : "rotate-90 text-secondary-text"
                        }
                      />
                    )}
                  </div>
                  {route.subRoute && isActive && (
                    <hr className="mt-1 border-t border-gray-200" />
                  )}
                  {isActive &&route.subRoute?.map((sub) => {
                    const isSubActive = location.pathname === sub.route;
                    return (
                      <Link key={sub.key} to={sub.route} className="ml-1">
                        <div
                          className={`${
                            isSubActive ? "text-primary" : "text-secondary-text"
                          } transition text-sm duration-300 ease-in-out py-1`}
                        >
                          {sub.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <CustomButton
        label="Log Out"
        icon={<Logout />}
        buttonStyle="secondary"
        customStyles="py-3.5! mt-7 w-[90%]"
        onClick={() => handleLinkPress("Log Out")}
      />
    </CustomBox>
  );
};

export default SideNavBar;

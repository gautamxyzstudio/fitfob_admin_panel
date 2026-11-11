import SideNavBar from "../modules/sideNavbar/SideNavbar";
import TopBar from "../modules/topbar/TopBar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-5 w-full h-full flex flex-row items-start gap-x-5 flex-nowrap max-w-screen-2xl mx-auto bg-background">
      <SideNavBar />
      <div className="w-[84%] h-full flex flex-col gap-y-5">
        <TopBar />
        <div className="w-full h-full overflow-y-scroll overflow-clip scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

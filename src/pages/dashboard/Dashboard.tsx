import { useEffect } from "react";
import { useAuthStore } from "../../store/auth.store";
import { ICONS } from "../../assets/exports";

const Dashboard = () => {
  const { setSession } = useAuthStore();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setSession(
        JSON.parse(localStorage.getItem("user") || "").jwt,
        JSON.parse(localStorage.getItem("user") || "").user.id,
      );
    }
  }, [setSession]);
  return (
    <>
      <img src={ICONS.Logo} alt="logo" className="w-auto h-auto" />
    </>
  );
};

export default Dashboard;

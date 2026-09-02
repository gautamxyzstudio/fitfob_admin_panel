import { useEffect } from "react";
import { useAuthStore } from "../../store/auth.store";

const Dashboard = () => {
  const { setSession } = useAuthStore();
  const user = JSON.parse(localStorage.getItem("user") || "");

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setSession(
        JSON.parse(localStorage.getItem("user") || "").jwt,
        JSON.parse(localStorage.getItem("user") || "").user.id,
      );
    }
  }, [setSession]);
  return <div>{user?.user?.role?.name} Dashboard Page</div>;
};

export default Dashboard;

import { Navigate, Route, Routes, useLocation } from "react-router";
import Login from "../pages/auth/Login";
import Logout from "../pages/auth/Logout";
import { useAuthStore } from "../store/auth.store";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!localStorage.getItem("user") || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

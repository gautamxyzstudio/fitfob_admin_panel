import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import Login from "../pages/auth/Login";
import Logout from "../pages/auth/Logout";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import ClubRequest from "../pages/clubRequest/ClubRequest";

const ProtectedRoute = () => {
  const location = useLocation();
  if (!localStorage.getItem("user")) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const AppRoutes = () => {
  return (
   <Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/logout" element={<Logout />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/verify-otp" element={<VerifyOtp />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/settings" element={<div>Settings Page</div>} />
    <Route path="/profile" element={<div>Profile Page</div>} />
    <Route path="/club-request" element={<ClubRequest />} />
    <Route path="/clubs" element={<div>Clubs Page</div>} />
    <Route path="/users" element={<div>User's Page</div>} />
    <Route path="/earnings" element={<div>Earnings Page</div>} />
    <Route path="/check-in" element={<div>Check In Page</div>} />
    <Route path="/payouts" element={<div>Payouts Page</div>} />

    {/* Nested /app */}
    <Route path="/app">
      <Route index element={<Navigate to="facilities" replace />} />
      <Route path="facilities" element={<div>App Facilities Page</div>} />
      <Route path="club-types" element={<div>App Club Types Page</div>} />
    </Route>
  </Route>
</Routes>
  );
};

export default AppRoutes;

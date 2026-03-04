import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestGuard = () => {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  if (isAuthenticated) {
    const isVerified = user?.email_verified_at !== null;
    return isVerified ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/verify-prompt" replace />
    );
  }

  return <Outlet />;
};

export default GuestGuard;

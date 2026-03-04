import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AuthGuard() {
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isVerified = user?.email_verified_at !== null;
  const isVerificationRoute = location.pathname.startsWith("/verify-");

  if (!isVerified && !isVerificationRoute) {
    return <Navigate to="/verify-prompt" replace />;
  }

  if (isVerified && isVerificationRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

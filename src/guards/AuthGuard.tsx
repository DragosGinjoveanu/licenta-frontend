import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetUserQuery } from "../store/api/authApiSlice";
import { useSelector } from "react-redux";

export default function AuthGuard() {
  const location = useLocation();

  const { isLoading, isFetching } = useGetUserQuery(undefined);
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  const isCheckingSession = isLoading || (isFetching && !isAuthenticated);

  if (isCheckingSession) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2>Verifying session...</h2>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

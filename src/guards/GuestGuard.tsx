import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetUserQuery } from "../store/apiSlice";

const GuestGuard = () => {
  const { isLoading } = useGetUserQuery(undefined);

  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2>Loading...</h2>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default GuestGuard;

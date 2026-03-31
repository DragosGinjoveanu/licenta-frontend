import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RestaurantGuard() {
  const user = useSelector((state: any) => state.auth.user);

  if (user && user.restaurant_id === null) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

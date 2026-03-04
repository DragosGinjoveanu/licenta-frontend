// src/pages/Dashboard.tsx
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Dashboard Principal</h1>
      {user ? <h2>Welcome, {user.name}! 👋</h2> : <h2>Welcome!</h2>}
    </div>
  );
};

export default Dashboard;

import { useSelector } from "react-redux";
import { useGetUserQuery } from "../store/api/authApiSlice";
import { Spin } from "antd";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  useGetUserQuery(undefined);

  const isInitialized = useSelector((state: any) => state.auth.isInitialized);

  if (!isInitialized) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f2f5",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p style={{ marginTop: 20 }}>Checking session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

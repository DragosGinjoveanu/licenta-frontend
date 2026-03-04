import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { Button, Result } from "antd";

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Result
            status="404"
            title="404"
            subTitle="The page you are looking for does not exist"
            extra={
              <Button type="primary" onClick={() => navigate("/")}>
                Go back to the main page
              </Button>
            }
          />
        </div>
      );
    }
  }

  console.error("ErrorBoundary error:", error);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Result
        status="500"
        title="Oops!"
        subTitle="Something went wrong, please retry!"
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Go back to the main page
          </Button>
        }
      />
    </div>
  );
}

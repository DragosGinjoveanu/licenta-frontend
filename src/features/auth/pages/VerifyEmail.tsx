import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Result, Button, Spin } from "antd";
import { useEffect } from "react";

import { useVerifyEmailMutation, useGetUserQuery } from "../store/authApiSlice";

export default function VerifyEmail() {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isAuthenticated, isInitialized } = useSelector(
    (state: any) => state.auth
  );

  const [verifyEmail, { isSuccess, isLoading, error, isError }] =
    useVerifyEmailMutation();

  const { isFetching: isUserUpdating } = useGetUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (id && hash) {
      const backendVerificationUrl = `/verify-email/${id}/${hash}?${searchParams.toString()}`;
      verifyEmail({ url: backendVerificationUrl });
    }
  }, [id, hash, searchParams, verifyEmail]);

  const handleContinue = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const isRateLimited =
    error && "status" in error && (error as any).status === 429;
  const isJustInvalid = isError && !isRateLimited;

  if (!isInitialized) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "450px",
        }}
      >
        {(isLoading || isUserUpdating) && (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
            <p style={{ marginTop: 20 }}>Updating your account...</p>
          </div>
        )}

        {isSuccess && !isUserUpdating && (
          <Result
            status="success"
            title="Email successfully confirmed!"
            subTitle="Your account is now active."
            extra={[
              <Button
                type="primary"
                key="dashboard"
                onClick={handleContinue}
                style={{ background: "blue" }}
              >
                {isAuthenticated ? "Go to dashboard" : "Go to login"}
              </Button>,
            ]}
          />
        )}

        {isRateLimited && (
          <Result
            status="warning"
            title="Too many tries"
            subTitle="Please wait a minute and then refresh this page."
            extra={[
              <Button
                type="primary"
                key="refresh"
                onClick={() => window.location.reload()}
              >
                Try now
              </Button>,
            ]}
          />
        )}

        {isJustInvalid && (
          <Result
            status="error"
            title="Verification failed"
            subTitle="The link is invalid or has expired."
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate("/login")}
              >
                Back to login
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
}

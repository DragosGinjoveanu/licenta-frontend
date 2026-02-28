import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Result, Button, Form, Input, Card, message } from "antd";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { useResetPasswordMutation } from "../store/api/authApiSlice";

import SuccessResult from "../components/SuccessResult";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password needs to be at least 8 characters long!")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter!")
    .matches(/[0-9]/, "Password must contain at least one number!")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character!"
    )
    .required("Password is mandatory!"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match!")
    .required("Please confirm the password!"),
});

export default function ResetPassword() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [isReset, setIsReset] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }).unwrap();

      setIsReset(true);
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors) {
        Object.keys(error.data.errors).forEach((key) => {
          setError(key as any, {
            type: "server",
            message: error.data.errors[key][0],
          });
        });
      } else {
        message.error(
          "Link-ul is invalid or has expired. Please try another one."
        );
      }
    }
  };

  if (isReset) {
    return (
      <SuccessResult
        title="Password has been reset!"
        subTitle="Now you can login with your new password."
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        title="Set new password"
        style={{ width: 400, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
      >
        <p style={{ marginBottom: 20, color: "#666" }}>
          Enter a new password for: <b>{email}</b>.
        </p>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="New password"
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message as string}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your new password"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Confirm the password"
            validateStatus={errors.password_confirmation ? "error" : ""}
            help={errors.password_confirmation?.message as string}
          >
            <Controller
              name="password_confirmation"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Enter password again" />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              Save new password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

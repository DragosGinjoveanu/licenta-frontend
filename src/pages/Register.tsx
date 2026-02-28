import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Steps,
  Button,
  Form,
  Input,
  Card,
  message,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useRegisterMutation } from "../store/api/authApiSlice";
import { Link } from "react-router-dom";

import SuccessResult from "../components/SuccessResult";

const { Title, Text } = Typography;

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format!")
    .required("Email is mandatory!"),
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
  name: yup
    .string()
    .min(3, "Name is too short!")
    .required("Full name is required!"),
});

export default function Register() {
  const [currentStep, setCurrentStep] = useState(0);
  const [register, { isLoading }] = useRegisterMutation();

  const [isCreated, setIsCreated] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const next = async () => {
    const fieldsToValidate =
      currentStep === 0
        ? ["email", "password", "password_confirmation"]
        : ["name"];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) setCurrentStep(currentStep + 1);
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const onSubmit = async (data: any) => {
    try {
      await register(data).unwrap();
      setIsCreated(true);
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors?.email) {
        setCurrentStep(0);
        setError("email", {
          type: "server",
          message: "This email is already registered.",
        });
      } else {
        message.error(
          error.data?.message || "Something went wrong. Please try again."
        );
      }
    }
  };

  const steps = [
    { title: "Account", icon: <MailOutlined /> },
    { title: "Personal", icon: <UserOutlined /> },
    { title: "Review", icon: <CheckCircleOutlined /> },
  ];

  if (isCreated) {
    return (
      <SuccessResult
        title="Account created successfully!"
        subTitle="Your account is ready. Please log in with your credentials to start managing your restaurant."
      />
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #f0f2f5 0%, #e6e9ff 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: 450,
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Title level={2} style={{ color: "blue", marginBottom: 0 }}>
            Restaurant management app
          </Title>
          <Text type="secondary">Join our community </Text>
        </div>

        <Steps
          current={currentStep}
          items={steps}
          size="small"
          style={{ marginBottom: "30px" }}
        />

        <Form layout="vertical">
          {currentStep === 0 && (
            <div className="step-content">
              <Title level={4} style={{ marginBottom: 20 }}>
                Create your account
              </Title>
              <Form.Item
                label="Email Address"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="email@example.com"
                      size="large"
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Password"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Password"
                      size="large"
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Confirm Password"
                validateStatus={errors.password_confirmation ? "error" : ""}
                help={errors.password_confirmation?.message}
              >
                <Controller
                  name="password_confirmation"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Confirm Password"
                      size="large"
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          {currentStep === 1 && (
            <div className="step-content">
              <Title level={4} style={{ marginBottom: 20 }}>
                Tell us your name
              </Title>
              <Form.Item
                label="Full Name"
                validateStatus={errors.name ? "error" : ""}
                help={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="e.g. John Doe"
                      size="large"
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <Title level={4} style={{ marginBottom: 20 }}>
                Review your information
              </Title>
              <Card
                type="inner"
                style={{ background: "#f9f9f9", borderRadius: "8px" }}
              >
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Text>
                    <strong>Name:</strong> {getValues("name")}
                  </Text>
                  <Divider style={{ margin: "8px 0" }} />
                  <Text>
                    <strong>Email:</strong> {getValues("email")}
                  </Text>
                </Space>
              </Card>
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  By clicking Create Account, you agree to our Terms of Service.
                </Text>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "40px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {currentStep > 0 ? (
              <Button
                onClick={prev}
                size="large"
                icon={<LeftOutlined />}
                htmlType="button"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={next}
                size="large"
                style={{ backgroundColor: "blue" }}
                htmlType="button"
              >
                Next <RightOutlined />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                style={{ backgroundColor: "blue", border: "none" }}
                icon={<CheckCircleOutlined />}
              >
                Create Account
              </Button>
            )}
          </div>
        </Form>

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "blue", fontWeight: "600" }}>
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form, Input, Card, Row, Col, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import {
  useUpdateProfileNameMutation,
  useUpdateProfilePasswordMutation,
} from "../store/profileApiSlice";

const { Title } = Typography;

// Schema for changing the name
const nameSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required!")
    .min(3, "Minimum 3 characters!"),
});

// Schema for changing the password
const passwordSchema = yup.object().shape({
  current_password: yup
    .string()
    .required("Please enter your current password!"),
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

export default function Profile() {
  const [updateName, { isLoading: isUpdatingName }] =
    useUpdateProfileNameMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] =
    useUpdateProfilePasswordMutation();

  const {
    control: controlName,
    handleSubmit: handleSubmitName,
    formState: { errors: errorsName },
  } = useForm({
    resolver: yupResolver(nameSchema),
    defaultValues: { name: "" },
  });

  const {
    control: controlPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmitName = async (data: { name: string }) => {
    try {
      await updateName(data).unwrap();
      message.success("Name updated successfully!");
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors?.name) {
        message.error("This name is already used by another user!");
      } else {
        message.error("An error occurred. Please try again.");
      }
    }
  };

  const onSubmitPassword = async (data: any) => {
    try {
      await updatePassword(data).unwrap();
      message.success("Password has been changed successfully!");
      resetPasswordForm();
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors?.current_password) {
        message.error("The current password is incorrect!");
      } else {
        message.error("Error changing password.");
      }
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Account Settings
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <UserOutlined /> Change Name
              </>
            }
            variant="borderless"
            style={{ borderRadius: 8, height: "100%" }}
          >
            <Form layout="vertical" onFinish={handleSubmitName(onSubmitName)}>
              <Form.Item
                label="Username"
                validateStatus={errorsName.name ? "error" : ""}
                help={errorsName.name?.message as string}
              >
                <Controller
                  name="name"
                  control={controlName}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter new name" />
                  )}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingName}
                block
              >
                Save Name
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <LockOutlined /> Change Password
              </>
            }
            variant="borderless"
            style={{ borderRadius: 8, height: "100%" }}
          >
            <Form
              layout="vertical"
              onFinish={handleSubmitPassword(onSubmitPassword)}
            >
              <Form.Item
                label="Current password"
                validateStatus={errorsPassword.current_password ? "error" : ""}
                help={errorsPassword.current_password?.message as string}
              >
                <Controller
                  name="current_password"
                  control={controlPassword}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="Current password" />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="New password"
                validateStatus={errorsPassword.password ? "error" : ""}
                help={errorsPassword.password?.message as string}
              >
                <Controller
                  name="password"
                  control={controlPassword}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="New password" />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Confirm new password"
                validateStatus={
                  errorsPassword.password_confirmation ? "error" : ""
                }
                help={errorsPassword.password_confirmation?.message as string}
              >
                <Controller
                  name="password_confirmation"
                  control={controlPassword}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="Confirm password" />
                  )}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingPassword}
                block
                danger
              >
                Change Password
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

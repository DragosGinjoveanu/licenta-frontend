import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form, Input, Card, message } from "antd";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../store/api/authApiSlice";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email format is invalid!")
    .required("Please enter email address!"),
});

export default function ForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: any) => {
    const genericMessage =
      "If email address exists, we have sent a reset password link on your email!";
    try {
      await forgotPassword({ email: data.email }).unwrap();
      message.success(genericMessage);
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors?.email) {
        message.success(genericMessage);
      } else {
        message.error("An error appeared. Please try again later.");
      }
    }
  };

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
        title="Reset password"
        style={{ width: 400, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
      >
        <p style={{ marginBottom: 20, color: "#666" }}>
          Enter your email address and a link for the password reset will be
          sent.
        </p>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message as string}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} />}
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
              Send the link
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Link to="/login">Back to login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

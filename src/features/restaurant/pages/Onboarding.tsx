import { Card, Typography, Button, Form, Input, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useLogoutApiMutation } from "../../auth/store/authApiSlice";
import { useCreateRestaurantMutation } from "../store/restaurantApiSlice";

const { Title, Text } = Typography;

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Please enter the restaurant name!")
    .min(2, "The name must be at least 2 characters long!")
    .max(50, "The name cannot exceed 50 characters!"),
  cui: yup
    .string()
    .required("Please enter the CUI!")
    .min(2, "The CUI must be at least 2 characters long!")
    .max(20, "The CUI cannot exceed 20 characters!"),
});

export default function Onboarding() {
  const [logoutApi] = useLogoutApiMutation();
  const [createRestaurant, { isLoading }] = useCreateRestaurantMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", cui: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await createRestaurant(data).unwrap();
      message.success("Restaurant created successfully!");
    } catch (error: any) {
      // catch laravel validation errors
      if (error.status === 422 && error.data?.errors) {
        Object.keys(error.data.errors).forEach((key) => {
          setError(key as any, {
            type: "server",
            message: error.data.errors[key][0],
          });
        });
      } else {
        message.error("Something went wrong. Please try again.");
      }
    }
  };

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
      <Card
        style={{
          width: 450,
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Title level={3}>Welcome to HoReCa SaaS! 🎉</Title>
          <Text type="secondary">
            Before we start, let's set up your restaurant profile.
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Restaurant Name"
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message as string}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g. Bella Napoli"
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Company CUI (Tax ID)"
            validateStatus={errors.cui ? "error" : ""}
            help={errors.cui?.message as string}
          >
            <Controller
              name="cui"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. RO12345678" size="large" />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 30 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              Create Restaurant & Continue
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button type="link" onClick={() => logoutApi()}>
            Logout for now
          </Button>
        </div>
      </Card>
    </div>
  );
}

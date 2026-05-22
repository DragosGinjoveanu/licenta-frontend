import { Form, Input, Button, Space, message, Divider, DatePicker } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useCreateOrderMutation } from "../store/ordersApiSlice";
import type { Order } from "../store/ordersApiSlice";
import OrderProductsList from "./OrderProductsList";

export default function PickupTab() {
  const [form] = Form.useForm();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const onFinish = async (values: any) => {
    try {
      const payload: Partial<Order> = {
        type: "pickup",
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        scheduled_for: values.scheduled_for
          ? values.scheduled_for.toISOString()
          : null,
        notes: values.notes,
        items: values.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      await createOrder(payload).unwrap();
      message.success("Pickup order sent to kitchen!");
      form.resetFields();
    } catch (error: any) {
      if (error.status === 400 && error.data?.error) {
        message.error({
          content: error.data.error,
          duration: 6,
        });
      } else if (error.status === 422 && error.data?.errors) {
        const formErrors = Object.keys(error.data.errors).map((key) => {
          const namePath = key.includes(".") ? key.split(".") : key;
          return {
            name: namePath,
            errors: [error.data.errors[key][0]],
          };
        });
        form.setFields(formErrors);
        message.error("Validation failed. Please review the inputs.");
      } else {
        message.error("Failed to create pickup order.");
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ items: [{ product_id: null, quantity: 1 }] }}
    >
      <Space
        style={{ display: "flex", width: "100%", flexWrap: "wrap" }}
        align="start"
      >
        <Form.Item
          name="customer_name"
          label="Customer Name"
          rules={[{ required: true, message: "Name is required" }]}
          style={{ width: "250px" }}
        >
          <Input placeholder="e.g. Jane Doe" />
        </Form.Item>

        <Form.Item
          name="customer_phone"
          label="Phone Number (Optional)"
          rules={[
            { pattern: /^[0-9+ ]+$/, message: "Invalid phone number format" },
          ]}
        >
          <Input placeholder="e.g. 07xx xxx xxx" />
        </Form.Item>

        <Form.Item name="scheduled_for" label="Pickup Time (Optional)">
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>
      </Space>

      <Form.Item name="notes" label="Notes (Optional)">
        <Input placeholder="e.g. Extra napkins" />
      </Form.Item>

      <Divider>Products</Divider>

      <OrderProductsList form={form} />

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SendOutlined />}
          loading={isCreating}
          size="large"
          block
        >
          Send Pickup Order
        </Button>
      </Form.Item>
    </Form>
  );
}

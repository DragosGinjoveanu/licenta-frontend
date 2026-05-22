import { Form, Input, InputNumber, Button, message, Divider } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useCreateOrderMutation } from "../store/ordersApiSlice";
import type { Order } from "../store/ordersApiSlice";
import OrderProductsList from "./OrderProductsList";

export default function DineInTab() {
  const [form] = Form.useForm();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const onFinish = async (values: any) => {
    try {
      const payload: Partial<Order> = {
        type: "dine_in",
        table_id: values.table_id.toString(),
        notes: values.notes,
        items: values.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      await createOrder(payload).unwrap();
      message.success("Order sent to kitchen!");
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
        message.error("Please check the form for errors.");
      } else {
        message.error("Failed to create order. Please try again.");
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
      <div style={{ display: "flex", gap: "16px" }}>
        <Form.Item
          name="table_id"
          label="Table Number"
          rules={[
            { required: true, message: "Please enter a table number" },
            {
              type: "number",
              min: 1,
              message: "Must be a positive number",
              transform: (value) => Number(value),
            },
          ]}
          style={{ flex: 1 }}
        >
          <InputNumber
            min={1}
            size="large"
            placeholder="e.g. 5"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </div>

      <Form.Item name="notes" label="General Notes (Optional)">
        <Input.TextArea rows={2} placeholder="e.g. Bring drinks first" />
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
          Send Order
        </Button>
      </Form.Item>
    </Form>
  );
}

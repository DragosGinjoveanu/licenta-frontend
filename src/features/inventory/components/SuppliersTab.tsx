import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Table,
  Space,
  Popconfirm,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierMutation,
} from "../store/inventoryApiSlice";
import type { Supplier } from "../store/inventoryApiSlice";

const { Text } = Typography;

export default function SuppliersTab() {
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [form] = Form.useForm();

  const { data: suppliers, isLoading: isLoadingSuppliers } =
    useGetSuppliersQuery();
  const [createSupplier, { isLoading: isCreatingSupplier }] =
    useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdatingSupplier }] =
    useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const handleSubmitSupplier = async (values: any) => {
    try {
      if (editingSupplier) {
        await updateSupplier({ id: editingSupplier.id, ...values }).unwrap();
        message.success("Supplier updated successfully!");
      } else {
        await createSupplier(values).unwrap();
        message.success("Supplier added successfully!");
      }

      setIsSupplierModalOpen(false);
      form.resetFields();
      setEditingSupplier(null);
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors) {
        const formErrors = Object.keys(error.data.errors).map((key) => ({
          name: key,
          errors: [error.data.errors[key][0]],
        }));
        form.setFields(formErrors);
      } else {
        message.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      await deleteSupplier(id).unwrap();
      message.success("Supplier removed successfully.");
    } catch (error) {
      message.error("Failed to delete supplier.");
    }
  };

  const supplierColumns: ColumnsType<Supplier> = [
    {
      title: "Supplier Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Contact Person",
      dataIndex: "contact_person",
      key: "contact_person",
      render: (text) => text || <Text type="secondary">-</Text>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || <Text type="secondary">-</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || <Text type="secondary">-</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => handleEditClick(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete the supplier"
            description="Are you sure to delete this supplier? Ingredients linked to them will revert to 'Own Supply'."
            onConfirm={() => handleDeleteSupplier(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingSupplier(null);
            form.resetFields();
            setIsSupplierModalOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </div>
      <Table
        columns={supplierColumns}
        dataSource={suppliers}
        rowKey="id"
        loading={isLoadingSuppliers}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
        open={isSupplierModalOpen}
        onCancel={() => {
          setIsSupplierModalOpen(false);
          form.resetFields();
          setEditingSupplier(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={isCreatingSupplier || isUpdatingSupplier}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitSupplier}>
          <Form.Item
            name="name"
            label="Supplier / Company Name"
            rules={[
              { required: true, message: "Please enter the supplier's name!" },
            ]}
          >
            <Input placeholder="e.g. Metro, Local Farm SRL" />
          </Form.Item>

          <Form.Item name="contact_person" label="Contact Person">
            <Input placeholder="e.g. John Doe" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                pattern: /^\+?[0-9\s\-]+$/,
                message:
                  "Please enter a valid phone number (digits, spaces, or +).",
              },
            ]}
          >
            <Input placeholder="e.g. +40 7xx xxx xxx" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ type: "email", message: "Please enter a valid email!" }]}
          >
            <Input placeholder="e.g. orders@supplier.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

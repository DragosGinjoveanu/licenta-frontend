import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Table,
  Space,
  Popconfirm,
  Typography,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetIngredientsQuery,
  useCreateIngredientMutation,
  useDeleteIngredientMutation,
  useUpdateIngredientMutation,
  useGetSuppliersQuery,
} from "../store/inventoryApiSlice";
import type { Ingredient } from "../store/inventoryApiSlice";

const { Text } = Typography;

export default function IngredientsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  const [form] = Form.useForm();

  const { data: ingredients, isLoading: isLoadingIngredients } =
    useGetIngredientsQuery();
  const { data: suppliers, isLoading: isLoadingSuppliers } =
    useGetSuppliersQuery();

  const [createIngredient, { isLoading: isCreating }] =
    useCreateIngredientMutation();
  const [updateIngredient, { isLoading: isUpdating }] =
    useUpdateIngredientMutation();
  const [deleteIngredient] = useDeleteIngredientMutation();

  const handleSubmit = async (values: any) => {
    try {
      if (editingIngredient) {
        console.log(values.supplier_id);
        await updateIngredient({
          ...values,
          id: editingIngredient.id,
          supplier_id: values.supplier_id || null,
        }).unwrap();
        message.success("Ingredient updated successfully!");
      } else {
        await createIngredient({
          ...values,
          supplier_id: values.supplier_id || null,
        }).unwrap();
        message.success("Ingredient added successfully!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingIngredient(null);
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

  const handleEditClick = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    form.setFieldsValue(ingredient);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteIngredient(id).unwrap();
      message.success("Ingredient removed successfully.");
    } catch (error) {
      message.error("Failed to delete ingredient.");
    }
  };

  const columns: ColumnsType<Ingredient> = [
    {
      title: "Ingredient Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Supplier",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (text, record) => {
        if (!record.supplier_id) {
          return <Tag color="blue">Own Supply</Tag>;
        }
        return text;
      },
    },
    {
      title: "Stock",
      dataIndex: "stock_quantity",
      key: "stock_quantity",
      render: (stock, record) => {
        const isLowStock = stock <= record.alert_level;
        return (
          <Text type={isLowStock ? "danger" : undefined} strong={isLowStock}>
            {stock} {record.unit_of_measure}
          </Text>
        );
      },
    },
    {
      title: "Alert Level",
      dataIndex: "alert_level",
      key: "alert_level",
      render: (alert, record) => `${alert} ${record.unit_of_measure}`,
    },
    {
      title: "Cost / Unit",
      dataIndex: "cost_per_unit",
      key: "cost_per_unit",
      render: (cost) => `${cost} RON`,
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
            title="Delete ingredient"
            description="Are you sure you want to delete this ingredient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
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
            setEditingIngredient(null);
            form.resetFields();
            // Setăm niște valori implicite pentru o adăugare mai rapidă
            form.setFieldsValue({
              stock_quantity: 0,
              alert_level: 0,
              cost_per_unit: 0,
            });
            setIsModalOpen(true);
          }}
        >
          Add Ingredient
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={ingredients}
        rowKey="id"
        loading={isLoadingIngredients}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingIngredient(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Ingredient Name"
            rules={[
              {
                required: true,
                message: "Please enter the ingredient's name!",
              },
            ]}
          >
            <Input placeholder="e.g. Flour 000, Tomato Sauce, Chicken Breast" />
          </Form.Item>

          <Form.Item
            name="supplier_id"
            label="Supplier"
            tooltip="Leave empty if you produce this or buy it from various random places."
          >
            <Select
              allowClear
              placeholder="Select a supplier or leave empty"
              loading={isLoadingSuppliers}
              options={suppliers?.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />
          </Form.Item>

          {/* Folosim Space pentru a pune unitatea de măsură și stocul pe același rând */}
          <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
            <Form.Item
              name="unit_of_measure"
              label="Unit (UoM)"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select style={{ width: 120 }} placeholder="e.g. kg, L, pcs">
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="g">g</Select.Option>
                <Select.Option value="L">Litru (L)</Select.Option>
                <Select.Option value="ml">ml</Select.Option>
                <Select.Option value="buc">Bucată</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="stock_quantity"
              label="Current Stock"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
            <Form.Item
              name="alert_level"
              label="Low Stock Alert Level"
              tooltip="When stock drops below this number, it will be highlighted."
            >
              <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="cost_per_unit"
              label="Cost per Unit (RON)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

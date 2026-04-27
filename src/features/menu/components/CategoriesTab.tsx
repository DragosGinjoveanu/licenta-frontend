import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  Table,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Select,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../store/menuApiSlice";
import type { Category } from "../store/menuApiSlice";

export default function CategoriesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const {
    data: categories,
    isLoading,
    isFetching,
  } = useGetCategoriesQuery({ search, sort });
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, ...values }).unwrap();
        message.success("Category updated successfully!");
      } else {
        await createCategory(values).unwrap();
        message.success("Category created successfully!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
    } catch (error: any) {
      if (error.status === 422 && error.data?.errors) {
        const formErrors = Object.keys(error.data.errors).map((key) => ({
          name: key,
          errors: [error.data.errors[key][0]],
        }));
        form.setFields(formErrors);
      } else {
        message.error("Something went wrong.");
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id).unwrap();
      message.success("Category deleted!");
    } catch (error) {
      message.error("Failed to delete category.");
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Products",
      dataIndex: "products_count",
      key: "products_count",
      render: (count: number) => (
        <Tag color={count > 0 ? "blue" : "default"}>{count || 0} products</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/menu/categories/${record.id}`)}
          >
            View Details
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete category"
            description="Are you sure? Products inside won't be deleted, but this category will be permanently removed from all Menus where it is used. Products will simply lose this category label."
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
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col flex="auto">
            <Space size="middle" wrap>
              <Input
                placeholder="Search category..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ width: 250 }}
              />
              <Select
                value={sort}
                onChange={(val) => setSort(val)}
                style={{ width: 200 }}
                options={[
                  { value: "name_asc", label: "Alphabetical (A-Z)" },
                  { value: "name_desc", label: "Alphabetical (Z-A)" },
                  { value: "products_desc", label: "Most Products" },
                  { value: "products_asc", label: "Least Products" },
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  setSort("name_asc");
                }}
                disabled={!search && sort === "name_asc"}
              >
                Reset Filters
              </Button>
            </Space>
          </Col>

          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Add Category
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={isLoading || isFetching}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add New Category"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              {
                required: true,
                message: "Please enter a category name (e.g., Pizza, Soups)",
              },
            ]}
          >
            <Input placeholder="e.g., Pizza, Pasta, Beverages" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

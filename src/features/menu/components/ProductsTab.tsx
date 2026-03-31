import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Table,
  Space,
  Popconfirm,
  message,
  Tag,
  Row,
  Col,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
} from "../store/menuApiSlice";
import type { Product, ProductPayload } from "../store/menuApiSlice";

export default function ProductsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState<string | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(
    undefined
  );
  const [sortField, setSortField] = useState<"name" | "price" | undefined>(
    undefined
  );
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | undefined
  >(undefined);

  const [tempMin, setTempMin] = useState<number | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const [tempSearch, setTempSearch] = useState<string>("");

  const navigate = useNavigate();

  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  const {
    data: products,
    isLoading: isProductsLoading,
    isFetching,
  } = useGetProductsQuery({
    search,
    category_ids:
      selectedCategories.length > 0 ? selectedCategories : undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    is_available: isAvailable,
    sort_field: sortField,
    sort_direction: sortDirection,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleSubmit = async (values: any) => {
    const payload: ProductPayload = {
      name: values.name,
      description: values.description,
      price: values.price,
      is_available: values.is_available,
      category_ids: values.category_ids || [],
    };

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...payload }).unwrap();
        message.success("Product updated successfully!");
      } else {
        await createProduct(payload).unwrap();
        message.success("Product created successfully!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const categoryIds = product.categories?.map((cat) => cat.id) || [];

    form.setFieldsValue({
      ...product,
      category_ids: categoryIds,
      price: Number(product.price),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Product deleted!");
    } catch (error) {
      message.error("Failed to delete product.");
    }
  };

  const handleTableChange: TableProps<Product>["onChange"] = (
    _pagination,
    filters,
    sorter: any
  ) => {
    if (filters.categories) {
      setSelectedCategories(filters.categories as number[]);
    } else {
      setSelectedCategories([]);
    }

    if (filters.is_available && filters.is_available.length > 0) {
      setIsAvailable(filters.is_available[0] as boolean);
    } else {
      setIsAvailable(undefined);
    }

    if (sorter.order) {
      setSortField(sorter.field);
      setSortDirection(sorter.order === "ascend" ? "asc" : "desc");
    } else {
      setSortField(undefined);
      setSortDirection(undefined);
    }
  };

  const handleClearAllFilters = () => {
    setSearch(undefined);
    setTempSearch("");
    setMinPrice(null);
    setMaxPrice(null);
    setTempMin(null);
    setTempMax(null);
    setSelectedCategories([]);
    setIsAvailable(undefined);
    setSortField(undefined);
    setSortDirection(undefined);
    message.info("All filters cleared");
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        sortField === "name"
          ? sortDirection === "asc"
            ? "ascend"
            : "descend"
          : null,
      filteredValue: search ? [search] : null,
      render: (text) => <strong>{text}</strong>,
      filterDropdown: ({ confirm }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder="Search name"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onPressEnter={() => {
              setSearch(tempSearch);
              confirm();
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setSearch(tempSearch);
                confirm();
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                setTempSearch("");
                setSearch(undefined);
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: () => (
        <SearchOutlined style={{ color: search ? "#1677ff" : undefined }} />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      sortOrder:
        sortField === "price"
          ? sortDirection === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (price) => `${Number(price).toFixed(2)} RON`,
      filteredValue:
        minPrice !== null || maxPrice !== null
          ? [minPrice || 0, maxPrice || 0]
          : null,
      filterDropdown: ({ confirm }) => (
        <div style={{ padding: 12 }} onKeyDown={(e) => e.stopPropagation()}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Space>
              <InputNumber
                placeholder="Min"
                value={tempMin}
                onChange={setTempMin}
                style={{ width: 100 }}
              />
              <span>-</span>
              <InputNumber
                placeholder="Max"
                value={tempMax}
                onChange={setTempMax}
                style={{ width: 100 }}
              />
            </Space>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                type="primary"
                onClick={() => {
                  setMinPrice(tempMin);
                  setMaxPrice(tempMax);
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Filter
              </Button>
              <Button
                onClick={() => {
                  setTempMin(null);
                  setTempMax(null);
                  setMinPrice(null);
                  setMaxPrice(null);
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      ),
      filterIcon: () => (
        <FilterOutlined
          style={{
            color:
              minPrice !== null || maxPrice !== null ? "#1677ff" : undefined,
          }}
        />
      ),
    },
    {
      title: "Categories",
      key: "categories",
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.categories?.map((category) => (
            <Tag color="blue" key={category.id} style={{ fontSize: "10px" }}>
              {category.name}
            </Tag>
          ))}
        </Space>
      ),
      filters: [
        { text: "🚫 Uncategorized", value: 0 },
        ...(categories?.map((c) => ({ text: c.name, value: c.id })) || []),
      ],
      filteredValue: selectedCategories.length > 0 ? selectedCategories : null,
    },
    {
      title: "Status",
      dataIndex: "is_available",
      key: "is_available",
      render: (isAvailable) => (
        <Tag color={isAvailable ? "green" : "red"}>
          {isAvailable ? "Active" : "Hidden"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Hidden", value: false },
      ],
      filterMultiple: false,
      filteredValue: isAvailable !== undefined ? [isAvailable] : null,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/menu/products/${record.id}/recipe`)}
          >
            Recipe
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete product"
            description="Are you sure? This will remove it from all menus."
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

  const hasActiveFilters =
    search !== undefined ||
    selectedCategories.length > 0 ||
    minPrice !== null ||
    maxPrice !== null ||
    isAvailable !== undefined ||
    sortDirection !== undefined;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            {hasActiveFilters && (
              <Button type="dashed" danger onClick={handleClearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProduct(null);
                form.resetFields();
                form.setFieldsValue({ is_available: true });
                setIsModalOpen(true);
              }}
            >
              Add Product
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={isProductsLoading || isFetching}
        onChange={handleTableChange}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingProduct(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        forceRender
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter a product name" }]}
          >
            <Input placeholder="e.g., Pizza Margherita" />
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <Input.TextArea
              rows={2}
              placeholder="e.g., Tomato sauce, mozzarella, basil"
            />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="price"
              label="Price (RON)"
              rules={[{ required: true, message: "Please enter the price" }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                step={0.5}
                style={{ width: "100%" }}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="is_available"
              label="Available on Menu"
              valuePropName="checked"
              style={{ flex: 1 }}
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </div>

          <Form.Item name="category_ids" label="Categories">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select categories (can be multiple)"
              loading={isCategoriesLoading}
              options={categories?.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

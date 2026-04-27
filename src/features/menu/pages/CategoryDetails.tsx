import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Table,
  Input,
  Button,
  Space,
  Tag,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  useGetCategoryByIdQuery,
  useGetAvailableProductsQuery,
  useAttachProductsToCategoryMutation,
  useDetachProductFromCategoryMutation,
  type Product,
} from "../store/menuApiSlice";

const { Title, Text } = Typography;

export default function CategoryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string | undefined>(undefined);
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

  const [tempSearch, setTempSearch] = useState<string>("");
  const [tempMin, setTempMin] = useState<number | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    data: categoryData,
    isLoading,
    isFetching,
  } = useGetCategoryByIdQuery(
    {
      id: Number(id),
      search: search || undefined,
      sort_field: sortField,
      sort_direction: sortDirection,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      is_available: isAvailable,
    },
    { skip: !id }
  );

  const { data: availableProducts, isLoading: isAvailableLoading } =
    useGetAvailableProductsQuery(Number(id), { skip: !isModalOpen });
  const [attachProducts, { isLoading: isAttaching }] =
    useAttachProductsToCategoryMutation();
  const [detachProduct] = useDetachProductFromCategoryMutation();

  const handleDetach = async (productId: number) => {
    try {
      await detachProduct({ categoryId: Number(id), productId }).unwrap();
      message.success("Product removed from category");
    } catch (err) {
      message.error("Failed to remove product");
    }
  };

  const handleAddProducts = async () => {
    try {
      await attachProducts({
        id: Number(id),
        product_ids: selectedRowKeys as number[],
      }).unwrap();

      message.success("Products added!");
      setIsModalOpen(false);
      setSelectedRowKeys([]);
    } catch (err) {
      message.error("Failed to add products.");
    }
  };

  const handleTableChange: TableProps<Product>["onChange"] = (
    _pagination,
    filters,
    sorter: any
  ) => {
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
      title: "Status",
      dataIndex: "is_available",
      key: "is_available",
      render: (available) => (
        <Tag color={available ? "green" : "red"}>
          {available ? "Active" : "Hidden"}
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
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Remove from category?"
            description={
              "Are you sure? Removing the product from this category will also delete it from any Menu currently displaying this category section."
            }
            onConfirm={() => handleDetach(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Remove from this category">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const modalColumns: ColumnsType<Product> = [
    { title: "Product", dataIndex: "name", key: "name" },
    {
      title: "In Other Categories",
      key: "other_cats",
      render: (_, record) => (
        <>
          {record.categories?.map((cat) => (
            <Tag key={cat.id} style={{ fontSize: "10px" }}>
              {cat.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (p) => `${Number(p).toFixed(2)} RON`,
    },
    {
      title: "Status",
      dataIndex: "is_available",
      key: "status",
      render: (available) => (
        <Tag color={available ? "green" : "red"} style={{ fontSize: "10px" }}>
          {available ? "Active" : "Hidden"}
        </Tag>
      ),
    },
  ];

  if (isLoading && !categoryData) {
    return <div style={{ padding: 24 }}>Loading category details...</div>;
  }

  if (!categoryData) {
    return <div style={{ padding: 24 }}>Category not found!</div>;
  }

  const hasActiveFilters =
    search !== undefined ||
    minPrice !== null ||
    maxPrice !== null ||
    isAvailable !== undefined ||
    sortDirection !== undefined;

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/menu")}
        />
        <div style={{ flex: 1 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {categoryData.name}
            <Tag
              color="blue"
              style={{
                fontSize: "14px",
                fontWeight: "normal",
                marginTop: "4px",
              }}
            >
              {categoryData.products?.length || 0}{" "}
              {categoryData.products?.length === 1 ? "product" : "products"}
            </Tag>
          </Title>
          <Text type="secondary">
            Viewing all products associated with this category
          </Text>
        </div>

        <Space>
          {hasActiveFilters && (
            <Button type="dashed" danger onClick={handleClearAllFilters}>
              Clear All Filters
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Products
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={categoryData?.products || []}
          rowKey="id"
          loading={isFetching}
          onChange={handleTableChange}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Add products to ${categoryData?.name}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRowKeys([]);
        }}
        onOk={handleAddProducts}
        okButtonProps={{
          disabled: selectedRowKeys.length === 0,
          loading: isAttaching,
        }}
        width={700}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 15 }}>
          Select products you want to include in this category.
        </Text>
        <Table
          size="small"
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          columns={modalColumns}
          dataSource={availableProducts}
          rowKey="id"
          loading={isAvailableLoading}
          scroll={{ y: 400 }}
          pagination={false}
        />
      </Modal>
    </div>
  );
}

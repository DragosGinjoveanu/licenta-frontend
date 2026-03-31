import { useState, useRef } from "react";
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
  Row,
  Col,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { InputRef } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
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

  // === TABLE CONTROL STATES PENTRU FILTRE/SORTĂRI ===
  const [filteredInfo, setFilteredInfo] = useState<Record<string, any>>({});
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const [form] = Form.useForm();
  const searchInput = useRef<InputRef>(null);

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

  // === HANDLERS PENTRU TABEL ===
  const handleTableChange: TableProps<Supplier>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const handleClearAllFilters = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const hasActiveFilters =
    Object.values(filteredInfo).some(
      (val) => Array.isArray(val) && val.length > 0
    ) || !!sortedInfo.order;

  // Funcție SIMPLĂ doar pentru căutare text (pe Supplier Name)
  const getTextColumnProps = (
    dataIndex: keyof Supplier,
    placeholder: string
  ) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div
        style={{ padding: 12, width: 250 }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 16, display: "block" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ flex: 1 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]);
              confirm();
            }}
            size="small"
            style={{ flex: 1 }}
          >
            Reset
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value: any, record: Supplier) => {
      const recordValue = record[dataIndex] as string | undefined;
      return recordValue
        ? recordValue.toLowerCase().includes((value as string).toLowerCase())
        : false;
    },
    filterDropdownProps: {
      onOpenChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const supplierColumns: ColumnsType<Supplier> = [
    {
      title: "Supplier Name",
      dataIndex: "name",
      key: "name",
      ...getTextColumnProps("name", "supplier name"),
      filteredValue: filteredInfo.name || null,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
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
      title: "Added On",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      },
      sortOrder:
        sortedInfo.columnKey === "created_at" ? sortedInfo.order : null,
      render: (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
      },
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
            onConfirm={() => handleDelete(record.id)}
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
                setEditingSupplier(null);
                form.resetFields();
                setIsSupplierModalOpen(true);
              }}
            >
              Add Supplier
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={supplierColumns}
        dataSource={suppliers}
        rowKey="id"
        loading={isLoadingSuppliers}
        pagination={{ pageSize: 10 }}
        onChange={handleTableChange}
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

import { useEffect, useState, useMemo } from "react";
import { Card, Typography, Table, Tag, Button, Space, DatePicker } from "antd";
import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import type { TableProps } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { useSelector } from "react-redux";
import {
  useGetFinishedOrdersQuery,
  ordersApiSlice,
} from "../store/ordersApiSlice";
import type { Order } from "../store/ordersApiSlice";
import type { RootState } from "../../../store/store";

const { Title, Text } = Typography;

export default function OrdersHistory() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: orders = [], isLoading, refetch } = useGetFinishedOrdersQuery();

  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Order>>({});

  const [paginationInfo, setPaginationInfo] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    if (!user?.restaurant_id) return;

    const channelName = `restaurant.${user.restaurant_id}`;
    const channel = window.Echo.private(channelName);

    channel.listen(".order.updated", (e: any) => {
      if (e.order.status === "completed" || e.order.status === "cancelled") {
        refetch();
      }
    });

    return () => {
      channel.stopListening(".order.updated");
    };
  }, [user, refetch]);

  const handleChange: TableProps<Order>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<Order>);
    setPaginationInfo({
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    });
  };

  const clearFilters = () => {
    setFilteredInfo({});
    setSortedInfo({});
    setPaginationInfo((prev) => ({ ...prev, current: 1 }));
  };

  const waiterFilters = useMemo(() => {
    const uniqueWaiters = Array.from(
      new Set(orders.map((o) => o.user?.name).filter(Boolean) as string[])
    );
    return uniqueWaiters.map((name) => ({ text: name, value: name }));
  }, [orders]);

  const columns: TableProps<Order>["columns"] = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Dine In", value: "dine_in" },
        { text: "Delivery", value: "delivery" },
        { text: "Pickup", value: "pickup" },
      ],
      filteredValue: filteredInfo.type || null,
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        const colors: Record<string, string> = {
          dine_in: "volcano",
          delivery: "geekblue",
          pickup: "purple",
        };
        return (
          <Tag color={colors[type] || "default"}>
            {type.toUpperCase().replace("_", " ")}
          </Tag>
        );
      },
    },
    {
      title: "Details (Table/Client)",
      key: "details",
      render: (_, record) => {
        if (record.type === "dine_in") return `Table ${record.table_id}`;
        return record.customer_name || "N/A";
      },
    },
    {
      title: "Waiter",
      dataIndex: ["user", "name"],
      key: "waiter",
      filters: waiterFilters,
      filteredValue: filteredInfo.waiter || null,
      onFilter: (value, record) => record.user?.name === value,
      render: (name) => name || "N/A",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount),
      sortOrder:
        sortedInfo.columnKey === "total_amount" ? sortedInfo.order : null,
      render: (val) => <strong style={{ color: "#389e0d" }}>{val} RON</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === "completed" ? "success" : "error"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortOrder:
        sortedInfo.columnKey === "created_at" ? sortedInfo.order : null,
      defaultSortOrder: "descend",
      filteredValue: filteredInfo.created_at || null,

      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <RangePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            value={selectedKeys[0] as any}
            onChange={(dates) => setSelectedKeys(dates ? [dates as any] : [])}
            style={{ marginBottom: 8, display: "flex" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => {
                clearFilters && clearFilters();
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

      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),

      onFilter: (value, record) => {
        const dates = value as any;
        if (!dates || dates.length !== 2) return true;

        const recordDate = dayjs(record.created_at);
        const startDate = dates[0];
        const endDate = dates[1];

        return (
          (recordDate.isAfter(startDate) ||
            recordDate.isSame(startDate, "minute")) &&
          (recordDate.isBefore(endDate) || recordDate.isSame(endDate, "minute"))
        );
      },

      render: (date) =>
        new Date(date).toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  const hasActiveFilters =
    Object.values(filteredInfo).some((val) => val !== null) || sortedInfo.order;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Orders History
        </Title>
        <Text type="secondary">
          View, filter, and analyze completed or cancelled orders.
        </Text>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            danger
            ghost
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear All Filters
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          onChange={handleChange}
          pagination={{
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
          }}
        />
      </Card>
    </div>
  );
}

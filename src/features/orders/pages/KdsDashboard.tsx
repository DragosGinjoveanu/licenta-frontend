import { useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Spin,
  message,
  Space,
  Dropdown,
  notification,
} from "antd";
import {
  EditOutlined,
  DownOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import {
  useGetActiveOrdersQuery,
  useUpdateOrderStatusMutation,
  ordersApiSlice,
} from "../store/ordersApiSlice";

const { Title, Text } = Typography;

export default function KdsDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: activeOrders, isLoading } = useGetActiveOrdersQuery({});
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  useEffect(() => {
    if (!user?.restaurant_id) return;

    const channelName = `restaurant.${user.restaurant_id}`;
    const channel = window.Echo.private(channelName);

    channel
      .listen(".order.created", (event: any) => {
        message.info(`New order received! (${event.order.total_amount} RON)`);
        dispatch(ordersApiSlice.util.invalidateTags(["Order"]));
      })
      .listen(".order.updated", (event: any) => {
        if (event.order.status === "cancelled") {
          notification.error({
            message: "🚨 ORDER CANCELLED!",
            description: `Order #${event.order.id} was cancelled. Remove it from the kitchen flow.`,
            duration: 0,
            placement: "top",
          });
        }
        dispatch(ordersApiSlice.util.invalidateTags(["Order"]));
      });

    return () => {
      channel.stopListening(".order.created");
      channel.stopListening(".order.updated");
    };
  }, [user, dispatch]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      message.success(`Order set to ${newStatus}`);
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  const getStatusMenu = (orderId: number, currentStatus: string) => {
    return {
      items: [
        {
          key: "pending",
          label: "🟡 Pending",
          disabled: currentStatus === "pending",
        },
        {
          key: "cooking",
          label: "🔥 Cooking",
          disabled: currentStatus === "cooking",
        },
        {
          key: "ready",
          label: "✅ Ready (Notify Waiter)",
          disabled: currentStatus === "ready",
        },
        {
          type: "divider" as const,
        },
        {
          key: "cancelled",
          label: "❌ Cancelled",
          danger: true,
        },
      ],

      onClick: ({ key }: { key: string }) => handleStatusChange(orderId, key),
    };
  };

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );

  const kdsOrders =
    activeOrders?.filter(
      (o) => o.status === "pending" || o.status === "cooking"
    ) || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Kitchen Display System
        </Title>
        <Text type="secondary">Real-time incoming orders queue.</Text>
      </div>

      <Row gutter={[16, 16]}>
        {kdsOrders.map((order) => (
          <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
            <Card
              title={
                <Space>
                  <span>#{order.id}</span>
                  {order.type === "dine_in" && (
                    <Tag color="volcano">Table {order.table_id}</Tag>
                  )}
                  {order.type === "delivery" && (
                    <Tag color="geekblue">Delivery</Tag>
                  )}
                  {order.type === "pickup" && <Tag color="purple">Pickup</Tag>}
                </Space>
              }
              extra={
                <Tag
                  color={order.status === "pending" ? "orange" : "processing"}
                >
                  {order.status.toUpperCase()}
                </Tag>
              }
              actions={[
                <Dropdown
                  menu={getStatusMenu(order.id, order.status)}
                  trigger={["click"]}
                  placement="bottom"
                >
                  <Button
                    block
                    type="primary"
                    ghost
                    icon={<EditOutlined />}
                    style={{ border: "none" }}
                  >
                    CHANGE STATUS <DownOutlined />
                  </Button>
                </Dropdown>,
              ]}
              style={{
                borderColor: order.status === "cooking" ? "#1890ff" : "#f0f0f0",
                borderWidth: order.status === "cooking" ? 2 : 1,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <ClockCircleOutlined />{" "}
                <Text type="secondary">
                  {new Date(order.created_at).toLocaleTimeString()}
                </Text>
              </div>

              {(order.type === "delivery" || order.type === "pickup") &&
                order.customer_name && (
                  <div
                    style={{
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <UserOutlined /> <Text strong>{order.customer_name}</Text>
                    {order.scheduled_for && (
                      <div style={{ color: "#cf1322", fontWeight: "bold" }}>
                        Scheduled:{" "}
                        {new Date(order.scheduled_for).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}

              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {order.items?.map((item) => (
                  <li
                    key={item.id}
                    style={{ marginBottom: 8, fontSize: "15px" }}
                  >
                    <strong>{item.quantity}x</strong> {item.product_name}
                    {item.notes && (
                      <div style={{ color: "#cf1322", fontSize: 13 }}>
                        ⚠️ {item.notes}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {order.notes && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 8,
                    backgroundColor: "#fffbe6",
                    border: "1px solid #ffe58f",
                    borderRadius: 4,
                  }}
                >
                  <strong>Order Note:</strong> {order.notes}
                </div>
              )}
            </Card>
          </Col>
        ))}
        {kdsOrders.length === 0 && (
          <Col span={24}>
            <Card style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type="secondary">
                No active orders right now. Kitchen is clear!
              </Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

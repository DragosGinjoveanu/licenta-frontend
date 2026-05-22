import { useEffect, useMemo } from "react";
import {
  Tabs,
  Badge,
  Card,
  Tag,
  Row,
  Col,
  Spin,
  Empty,
  Button,
  message,
  notification,
  Typography,
  Popconfirm,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FireOutlined,
  HistoryOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  useGetActiveOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../store/ordersApiSlice";
import type { RootState } from "../../../store/store";

const { Title, Text } = Typography;

const playNotificationSound = () => {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
  );
  audio.play().catch((e) => console.log("Audio play blocked by browser", e));
};

export default function ActiveOrders() {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: orders = [], isLoading, refetch } = useGetActiveOrdersQuery({});
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const myOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.user_id === user?.id && order.status !== "delivering"
      ),
    [orders, user?.id]
  );

  const allRestaurantOrders = useMemo(
    () => orders.filter((order) => order.status !== "delivering"),
    [orders]
  );

  const deliveringOrders = useMemo(
    () => orders.filter((order) => order.status === "delivering"),
    [orders]
  );

  useEffect(() => {
    if (!user?.restaurant_id) return;

    const channelName = `restaurant.${user.restaurant_id}`;
    const channel = window.Echo.private(channelName);

    channel
      .listen(".order.created", () => {
        refetch();
      })
      .listen(".order.updated", (e: any) => {
        const orderIdentifier =
          e.order.type === "dine_in"
            ? `Table ${e.order.table_id}`
            : `${e.order.type?.toUpperCase()} order`;

        if (e.order.status === "ready") {
          playNotificationSound();
          notification.success({
            message: "ORDER READY! 🔔",
            description: `${orderIdentifier} is ready to serve.`,
            placement: "topRight",
            duration: 0,
          });
        } else if (e.order.status === "cancelled") {
          notification.error({
            message: "ORDER CANCELLED ❌",
            description: `Order for ${orderIdentifier} was cancelled.`,
            placement: "topRight",
          });
        }

        refetch();
      });

    return () => {
      channel.stopListening(".order.created");
      channel.stopListening(".order.updated");
    };
  }, [user, refetch]);

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: string,
    successMsg: string
  ) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      message.success(successMsg);
    } catch (err) {
      message.error("Failed to update order status");
    }
  };

  const handleCancel = async (orderId: number) => {
    try {
      await updateStatus({ id: orderId, status: "cancelled" }).unwrap();
      message.success("Order cancelled successfully!");
    } catch (err) {
      message.error("Failed to cancel order");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "orange", text: "Pending", icon: <HistoryOutlined /> };
      case "cooking":
        return { color: "blue", text: "Cooking", icon: <FireOutlined /> };
      case "ready":
        return {
          color: "green",
          text: "Ready to Serve",
          icon: <CheckCircleOutlined />,
        };
      case "delivering":
        return {
          color: "purple",
          text: "Out for Delivery",
          icon: <CarOutlined />,
        };
      default:
        return { color: "default", text: status, icon: null };
    }
  };

  const renderOrderCard = (order: any) => {
    const config = getStatusConfig(order.status);
    const isOwner = order.user_id === user?.id;

    let actionButton = null;

    if (order.status === "ready") {
      if (order.type === "delivery") {
        actionButton = (
          <Button
            type="primary"
            block
            icon={<CarOutlined />}
            onClick={() =>
              handleStatusUpdate(
                order.id,
                "delivering",
                "Order dispatched to driver!"
              )
            }
            loading={isUpdating}
            style={{
              backgroundColor: "#722ed1",
              borderColor: "#722ed1",
              whiteSpace: "normal",
              height: "auto",
              padding: "8px",
            }}
          >
            Dispatch to Driver
          </Button>
        );
      } else {
        actionButton = (
          <Button
            type="primary"
            block
            icon={<CheckCircleOutlined />}
            onClick={() =>
              handleStatusUpdate(
                order.id,
                "completed",
                "Order served and archived!"
              )
            }
            loading={isUpdating}
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              whiteSpace: "normal",
              height: "auto",
              padding: "8px",
            }}
          >
            Completed (Mark as served)
          </Button>
        );
      }
    } else if (order.status === "delivering") {
      actionButton = (
        <Button
          type="primary"
          block
          icon={<CheckCircleOutlined />}
          onClick={() =>
            handleStatusUpdate(
              order.id,
              "completed",
              "Delivery completed and archived!"
            )
          }
          loading={isUpdating}
          style={{
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
            whiteSpace: "normal",
            height: "auto",
            padding: "8px",
          }}
        >
          Confirm Delivered
        </Button>
      );
    }

    return (
      <Col
        xs={24}
        sm={12}
        lg={8}
        xl={6}
        key={order.id}
        style={{ display: "flex" }}
      >
        <Card
          hoverable
          className={`order-card ${
            order.status === "ready" || order.status === "delivering"
              ? "pulse-border"
              : ""
          }`}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          styles={{
            body: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "16px",
            },
          }}
          title={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "8px 0",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <Tag
                  color={config.color}
                  icon={config.icon}
                  style={{ margin: 0 }}
                >
                  {config.text.toUpperCase()}
                </Tag>

                {/* Aratam Cancel DOAR daca nu este inca livrata sau pe drum */}
                {order.status !== "delivering" && (
                  <Popconfirm
                    title="Are you sure you want to cancel this order?"
                    onConfirm={() => handleCancel(order.id)}
                    okText="Yes, Cancel"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      style={{
                        padding: 0,
                        whiteSpace: "nowrap",
                        overflow: "visible",
                      }}
                    >
                      Cancel
                    </Button>
                  </Popconfirm>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {order.type === "delivery"
                    ? `🚚 Delivery (${order.customer_name || "Client"})`
                    : order.type === "pickup"
                    ? `📦 Pickup (${order.customer_name || "Client"})`
                    : `🍽️ Table ${order.table_id || "N/A"}`}
                </span>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  #{order.id}
                </Text>
              </div>
            </div>
          }
          actions={actionButton ? [actionButton] : undefined}
        >
          <div style={{ marginBottom: 12 }}>
            <UserOutlined />{" "}
            <Text strong>{order.user?.name || "Unknown Waiter"}</Text>
            {isOwner && (
              <Tag color="purple" style={{ marginLeft: 8 }}>
                My Table
              </Tag>
            )}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: "80px",
              marginBottom: "16px",
              paddingRight: "4px",
            }}
          >
            {order.items?.map((item: any) => (
              <div key={item.id} style={{ marginBottom: "4px" }}>
                <Text>
                  • {item.quantity}x {item.product?.name}
                </Text>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "auto",
              borderTop: "1px solid #f0f0f0",
              paddingTop: 8,
            }}
          >
            <Text type="secondary">
              <ClockCircleOutlined /> Received at:{" "}
              {new Date(order.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Active Orders Management</Title>

      <Tabs
        type="card"
        defaultActiveKey="my"
        items={[
          {
            key: "my",
            label: (
              <span>
                My Orders{" "}
                <Badge
                  count={myOrders.length}
                  offset={[10, 0]}
                  style={{ backgroundColor: "#722ed1" }}
                />
              </span>
            ),
            children: isLoading ? (
              <Spin size="large" />
            ) : (
              <Row gutter={[16, 16]}>
                {myOrders.length > 0 ? (
                  myOrders.map(renderOrderCard)
                ) : (
                  <Col span={24}>
                    <Empty description="You have no active orders" />
                  </Col>
                )}
              </Row>
            ),
          },
          {
            key: "all",
            label: (
              <span>
                All Tables{" "}
                <Badge count={allRestaurantOrders.length} offset={[10, 0]} />
              </span>
            ),
            children: isLoading ? (
              <Spin size="large" />
            ) : (
              <Row gutter={[16, 16]}>
                {allRestaurantOrders.length > 0 ? (
                  allRestaurantOrders.map(renderOrderCard)
                ) : (
                  <Col span={24}>
                    <Empty description="No active orders in the restaurant" />
                  </Col>
                )}
              </Row>
            ),
          },
          {
            key: "deliveries",
            label: (
              <span>
                Out for Delivery{" "}
                <Badge
                  count={deliveringOrders.length}
                  offset={[10, 0]}
                  style={{ backgroundColor: "#722ed1" }}
                />
              </span>
            ),
            children: isLoading ? (
              <Spin size="large" />
            ) : (
              <Row gutter={[16, 16]}>
                {deliveringOrders.length > 0 ? (
                  deliveringOrders.map(renderOrderCard)
                ) : (
                  <Col span={24}>
                    <Empty description="No active deliveries on the road" />
                  </Col>
                )}
              </Row>
            ),
          },
        ]}
      />

      <style>{`
        .pulse-border {
          border: 2px solid #52c41a;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(82, 196, 26, 0); }
          100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
        }
      `}</style>
    </div>
  );
}

import { Card, Typography, Tabs, Descriptions, Tag, Alert, Spin } from "antd";
import type { TabsProps } from "antd";
import { useSelector } from "react-redux";
import { ShopOutlined } from "@ant-design/icons";
import { useGetRestaurantQuery } from "../store/restaurantApiSlice";

const { Title, Text } = Typography;

export default function MyRestaurant() {
  const user = useSelector((state: any) => state.auth.user);

  const { data: restaurant, isLoading } = useGetRestaurantQuery();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "General Info",
      children: (
        <div style={{ paddingTop: 16 }}>
          <Alert
            message="Business Identity Locked"
            description="As part of our SaaS compliance policy, the core legal identity of your restaurant (Name and CUI) cannot be changed manually. Please contact support if you undergo a legal entity change."
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          <Descriptions
            title="Business Details"
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}
          >
            <Descriptions.Item label="Restaurant Name">
              <Text strong>
                <ShopOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                {restaurant?.name || "N/A"}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Registration Number (CUI)">
              <Text copyable>{restaurant?.cui || "N/A"}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="System ID">
              <Text type="secondary">#{user?.restaurant_id || "N/A"}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Account Status">
              <Tag color="success">Active</Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "2",
      label: "Floor Plan",
      children: (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <Title level={4}>🚧 Coming Soon: Tables & Floor Plan</Title>
          <Text type="secondary">
            Here you will be able to manage your tables and layout.
          </Text>
        </div>
      ),
    },
    {
      key: "3",
      label: "Team & Roles (HR)",
      children: (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <Title level={4}>🚧 Coming Soon: Team Management</Title>
          <Text type="secondary">
            Invite staff, set hourly wages, and configure permissions.
          </Text>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          My Restaurant
        </Title>
        <Text type="secondary">
          Configure your business settings, staff, and operations.
        </Text>
      </div>

      <Card
        variant="borderless"
        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <Tabs defaultActiveKey="1" items={items} size="large" />
      </Card>
    </div>
  );
}

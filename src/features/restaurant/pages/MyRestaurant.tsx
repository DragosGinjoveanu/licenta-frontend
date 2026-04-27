import { Card, Typography, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export default function MyRestaurant() {
  const user = useSelector((state: any) => state.auth.user);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "General Info",
      children: (
        <div style={{ paddingTop: 16 }}>
          <Title level={4}>Business Details</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Manage your core restaurant information and billing details.
          </Text>

          <div style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}>
            <p>
              <strong>Associated Restaurant ID:</strong> {user?.restaurant_id}
            </p>
            <p>
              <em>Numele și CUI-ul vor fi încărcate aici curând...</em>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Floor Plan",
      children: (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
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
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <Title level={4}>🚧 Coming Soon: Team Management</Title>
          <Text type="secondary">
            Invite staff, set hourly wages, and configure permissions.
          </Text>
        </div>
      ),
    },
    {
      key: "4",
      label: "Suppliers",
      children: (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <Title level={4}>🚧 Coming Soon: Suppliers Directory</Title>
          <Text type="secondary">
            Manage your inventory providers and contact persons.
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          My Restaurant
        </Title>
        <Text type="secondary">
          Configure your business settings, staff, and operations.
        </Text>
      </div>

      <Card>
        <Tabs defaultActiveKey="1" items={items} size="large" />
      </Card>
    </div>
  );
}

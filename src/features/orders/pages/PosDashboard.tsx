import { Card, Typography, Tabs } from "antd";
import {
  CoffeeOutlined,
  CarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import DineInTab from "../components/DineInTab.tsx";
import DeliveryTab from "../components/DeliveryTab.tsx";
import PickupTab from "../components/PickupTab.tsx";

const { Title, Text } = Typography;

export default function PosDashboard() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          POS Dashboard
        </Title>
        <Text type="secondary">
          Take new orders and send them to the kitchen.
        </Text>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="dine_in"
          items={[
            {
              key: "dine_in",
              label: (
                <span>
                  <CoffeeOutlined /> Dine-In
                </span>
              ),
              children: <DineInTab />,
            },
            {
              key: "delivery",
              label: (
                <span>
                  <CarOutlined /> Delivery
                </span>
              ),
              children: <DeliveryTab />,
            },
            {
              key: "pickup",
              label: (
                <span>
                  <ShoppingOutlined /> Pickup
                </span>
              ),
              children: <PickupTab />, // Form specific to customer name only
            },
          ]}
        />
      </Card>
    </div>
  );
}

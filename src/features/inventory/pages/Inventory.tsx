import { Card, Typography, Tabs } from "antd";
import { TeamOutlined, BoxPlotOutlined } from "@ant-design/icons";

import SuppliersTab from "../components/SuppliersTab";
import IngredientsTab from "../components/IngredientsTab";

const { Title, Text } = Typography;

export default function Inventory() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Inventory & Suppliers
        </Title>
        <Text type="secondary">
          Manage your raw materials, stock levels, and supply chain.
        </Text>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="2"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <BoxPlotOutlined /> Ingredients
                </span>
              ),
              children: <IngredientsTab />,
            },
            {
              key: "2",
              label: (
                <span>
                  <TeamOutlined /> Suppliers
                </span>
              ),
              children: <SuppliersTab />,
            },
          ]}
        />
      </Card>
    </div>
  );
}

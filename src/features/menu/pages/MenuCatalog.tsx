import { Card, Typography, Tabs } from "antd";
import { AppstoreOutlined, CoffeeOutlined } from "@ant-design/icons";
import CategoriesTab from "../components/CategoriesTab";
import ProductsTab from "../components/ProductsTab";

const { Title, Text } = Typography;

export default function MenuCatalog() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Menu Catalog
        </Title>
        <Text type="secondary">
          Manage your categories, products, and base recipes.
        </Text>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <AppstoreOutlined /> Categories
                </span>
              ),
              children: <CategoriesTab />,
            },
            {
              key: "2",
              label: (
                <span>
                  <CoffeeOutlined /> Products & Recipes
                </span>
              ),
              children: <ProductsTab />,
            },
          ]}
        />
      </Card>
    </div>
  );
}

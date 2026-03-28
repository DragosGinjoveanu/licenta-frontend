import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  MenuOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      theme="dark"
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontWeight: "bold",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {collapsed ? "SaaS" : "HoReCa SaaS"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={[
          {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => navigate("/dashboard"),
          },
          {
            key: "2",
            icon: <ShopOutlined />,
            label: "My Restaurant",
            onClick: () => navigate("/restaurant"),
          },
          {
            key: "3",
            icon: <MenuOutlined />,
            label: "Menu Builder",
            onClick: () => navigate("/menu"),
          },
          {
            key: "4",
            icon: <DatabaseOutlined />,
            label: "Inventory",
            onClick: () => navigate("/inventory"),
          },
        ]}
      />
    </Sider>
  );
}

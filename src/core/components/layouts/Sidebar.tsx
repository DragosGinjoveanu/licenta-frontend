import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  MenuOutlined,
  DatabaseOutlined,
  HighlightOutlined,
  ShoppingCartOutlined,
  DesktopOutlined,
  FireOutlined,
  HistoryOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;

    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/restaurant")) return "restaurant";
    if (path.startsWith("/menu-builder")) return "menu-builder";
    if (path.startsWith("/menu")) return "menu-catalog";
    if (path.startsWith("/inventory")) return "inventory";

    if (path.startsWith("/orders/active")) return "active-orders";
    if (path.startsWith("/orders/pos")) return "pos";
    if (path.startsWith("/orders/kds")) return "kds";
    if (path.startsWith("/orders/history")) return "history";

    return "dashboard";
  };

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
        selectedKeys={[getSelectedKey()]}
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => navigate("/dashboard"),
          },
          {
            key: "restaurant",
            icon: <ShopOutlined />,
            label: "My Restaurant",
            onClick: () => navigate("/restaurant"),
          },
          {
            key: "orders",
            icon: <ShoppingCartOutlined />,
            label: "Orders Management",
            children: [
              {
                key: "active-orders",
                icon: <CarryOutOutlined />,
                label: "Active Orders",
                onClick: () => navigate("/orders/active"),
              },
              {
                key: "pos",
                icon: <DesktopOutlined />,
                label: "POS (New Order)",
                onClick: () => navigate("/orders/pos"),
              },
              {
                key: "kds",
                icon: <FireOutlined />,
                label: "Kitchen (KDS)",
                onClick: () => navigate("/orders/kds"),
              },
              {
                key: "history",
                icon: <HistoryOutlined />,
                label: "Order History",
                onClick: () => navigate("/orders/history"),
              },
            ],
          },
          {
            key: "menu-catalog",
            icon: <MenuOutlined />,
            label: "Menu Catalog",
            onClick: () => navigate("/menu"),
          },
          {
            key: "menu-builder",
            icon: <HighlightOutlined />,
            label: "Menu Builder",
            onClick: () => navigate("/menu-builder"),
          },
          {
            key: "inventory",
            icon: <DatabaseOutlined />,
            label: "Inventory",
            onClick: () => navigate("/inventory"),
          },
        ]}
      />
    </Sider>
  );
}

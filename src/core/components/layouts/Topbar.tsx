import { Layout, Button, Dropdown, Avatar, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogoutApiMutation } from "../../../features/auth/store/authApiSlice";

const { Header } = Layout;

interface TopbarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function Topbar({ collapsed, setCollapsed }: TopbarProps) {
  const navigate = useNavigate();
  const [logoutApi] = useLogoutApiMutation();
  const user = useSelector((state: any) => state.auth.user);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const profileMenuProps = {
    items: [
      {
        key: "1",
        icon: <UserOutlined />,
        label: "Edit Profile",
        onClick: () => navigate("/profile"),
      },
      {
        key: "2",
        icon: <SettingOutlined />,
        label: "Settings",
      },
      { type: "divider" as const },
      {
        key: "3",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
        onClick: () => logoutApi(),
      },
    ],
  };

  return (
    <Header
      style={{
        padding: "0 16px",
        background: colorBgContainer,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        zIndex: 1,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: "16px", width: 64, height: 64 }}
      />

      <Dropdown menu={profileMenuProps} placement="bottomRight" arrow>
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontWeight: 500 }}>{user?.name || "User"}</span>
          <Avatar
            style={{ backgroundColor: "#1677ff" }}
            icon={!user?.name && <UserOutlined />}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : ""}
          </Avatar>
        </div>
      </Dropdown>
    </Header>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Empty,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Tag,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  useGetMenusQuery,
  useCreateMenuMutation,
  useDeleteMenuMutation,
} from "../store/menuBuilderApiSlice";

const { Title, Text } = Typography;

export default function MenuBuilderList() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: menus, isLoading } = useGetMenusQuery();
  const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation();
  const [deleteMenu] = useDeleteMenuMutation();

  const handleCreate = async (values: { name: string }) => {
    try {
      const newMenu = await createMenu(values).unwrap();
      message.success("Menu version created!");
      setIsModalOpen(false);
      form.resetFields();
      navigate(`/menu-builder/${newMenu.id}`);
    } catch (e) {
      message.error("Failed to create menu");
    }
  };

  return (
    <div style={{ padding: "32px" }}>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "32px" }}
      >
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Menu Builder
          </Title>
          <Text type="secondary">
            Design and export custom PDF menus for different occasions.
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Create New Menu
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}>
              <Card loading={true} />
            </Col>
          ))}
        </Row>
      ) : menus?.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No menus found. Start by creating a menu version (e.g., 'Summer Specials')."
        />
      ) : (
        <Row gutter={[20, 20]}>
          {menus?.map((menu) => (
            <Col xs={24} sm={12} md={8} lg={6} key={menu.id}>
              <Card
                hoverable
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => navigate(`/menu-builder/${menu.id}`)}
                    title="Edit Layout"
                  />,
                  <FilePdfOutlined
                    key="pdf"
                    onClick={() => message.info("PDF Engine coming soon!")}
                    title="Export PDF"
                  />,
                  <Popconfirm
                    title="Delete Menu"
                    description="Are you sure? This won't delete the products from catalog."
                    onConfirm={() => deleteMenu(menu.id)}
                  >
                    <DeleteOutlined key="delete" style={{ color: "#ff4d4f" }} />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={menu.name}
                  description={
                    <Space orientation="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <ClockCircleOutlined />{" "}
                        {new Date(menu.created_at).toLocaleDateString()}
                      </Text>
                      <Tag color="blue" style={{ marginTop: "8px" }}>
                        {menu.menu_categories?.length || 0} Sections
                      </Tag>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="New Menu Version"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Create & Start Building"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Menu Name"
            rules={[
              { required: true, message: "Ex: Dinner Menu, Wine List, etc." },
            ]}
          >
            <Input
              placeholder="Enter a name for this menu version..."
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

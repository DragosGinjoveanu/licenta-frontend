import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  Layout,
  Button,
  Typography,
  Space,
  Spin,
  Result,
  Modal,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import { useGetCategoriesQuery } from "../store/menuApiSlice";
import {
  useGetMenuByIdQuery,
  useUpdateMenuMutation,
  useAddCategoryToMenuMutation,
  useRemoveCategoryFromMenuMutation,
  useReorderMenuCategoriesMutation,
  useReorderMenuProductsMutation,
  useRemoveProductFromMenuMutation,
  useUpdateMenuProductOptionsMutation,
} from "../store/menuBuilderApiSlice";

import type { MenuCategory } from "../store/menuBuilderApiSlice";

import { SortableCategory } from "../components/SortableCategory";
import { PrintableMenu } from "../components/PrintableMenu";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function MenuCanvas() {
  const { id } = useParams<{ id: string }>();
  const menuId = Number(id);
  const navigate = useNavigate();

  const {
    data: menu,
    isLoading: isLoadingMenu,
    error,
  } = useGetMenuByIdQuery(menuId);
  const { data: catalogCategories, isLoading: isLoadingCatalog } =
    useGetCategoriesQuery();

  const [addCategory] = useAddCategoryToMenuMutation();
  const [removeCategory] = useRemoveCategoryFromMenuMutation();
  const [reorderCategories] = useReorderMenuCategoriesMutation();
  const [removeProduct] = useRemoveProductFromMenuMutation();
  const [updateProductOptions] = useUpdateMenuProductOptionsMutation();
  const [reorderProducts] = useReorderMenuProductsMutation();
  const [updateMenu] = useUpdateMenuMutation();

  const [localCategories, setLocalCategories] = useState<MenuCategory[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menu?.menu_categories) {
      setLocalCategories(menu.menu_categories);
    }
  }, [menu]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: menu?.name
      ? `${menu.name.replace(/\s+/g, "-").toLowerCase()}`
      : "menu",
  });

  const handleRenameMenu = async (newName: string) => {
    if (!newName.trim() || newName === menu?.name) return;
    try {
      await updateMenu({ id: menuId, name: newName }).unwrap();
      message.success("Menu renamed successfully!");
    } catch {
      message.error("Failed to rename menu");
    }
  };

  const handleAddCategory = async (categoryId: number) => {
    try {
      await addCategory({ menu_id: menuId, category_id: categoryId }).unwrap();
      message.success("Category added to menu");
    } catch {
      message.error("Failed to add category");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeType = active.data.current?.type;

    if (activeType === "Category") {
      const oldIndex = localCategories.findIndex(
        (c) => `category-${c.id}` === activeId
      );
      const newIndex = localCategories.findIndex(
        (c) => `category-${c.id}` === overId
      );

      const newArray = arrayMove(localCategories, oldIndex, newIndex);
      setLocalCategories(newArray);

      const orders = newArray.map((cat, index) => ({
        id: cat.id,
        order: index,
      }));
      try {
        await reorderCategories({ menu_id: menuId, orders }).unwrap();
        message.success("Categories display order changed!");
      } catch (error) {
        message.error("Failed to save category order. Please try again.");
        setLocalCategories(menu?.menu_categories || []);
      }
    } else if (activeType === "Product") {
      const categoryIndex = localCategories.findIndex((c) =>
        c.menu_products?.some((p) => `product-${p.id}` === activeId)
      );

      if (categoryIndex === -1) return;

      const category = localCategories[categoryIndex];
      const products = [...(category.menu_products || [])];

      const oldIndex = products.findIndex(
        (p) => `product-${p.id}` === activeId
      );
      const newIndex = products.findIndex((p) => `product-${p.id}` === overId);

      const newProductsArray = arrayMove(products, oldIndex, newIndex);

      const newCategories = [...localCategories];
      newCategories[categoryIndex] = {
        ...category,
        menu_products: newProductsArray,
      };
      setLocalCategories(newCategories);

      const orders = newProductsArray.map((prod, index) => ({
        id: prod.id,
        order: index,
      }));

      try {
        await reorderProducts({
          menu_id: menuId,
          menu_category_id: category.id,
          orders,
        }).unwrap();
        message.success("Products display order changed!");
      } catch (error) {
        message.error("Failed to save product order. Please try again.");
        setLocalCategories(menu?.menu_categories || []);
      }
    }
  };

  if (isLoadingMenu || isLoadingCatalog) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <Result
        status="404"
        title="Menu not found"
        extra={
          <Button type="primary" onClick={() => navigate("/menu-builder")}>
            Back to List
          </Button>
        }
      />
    );
  }

  const usedCategoryIds = localCategories.map((c) => c.category_id);
  const availableCategories =
    catalogCategories?.filter((c) => !usedCategoryIds.includes(c.id)) || [];

  return (
    <Layout style={{ height: "100vh", background: "#fff" }}>
      <Header
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
        }}
      >
        <Space size="middle">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/menu-builder")}
          />
          <span
            style={{
              borderLeft: "1px solid #d9d9d9",
              height: "24px",
              marginLeft: "4px",
            }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Editing: {menu.name}
          </Title>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview & Export
          </Button>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={300}
          theme="light"
          style={{
            borderRight: "1px solid #f0f0f0",
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <Title level={5}>Available Categories</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Click to add a section to your menu.
          </Text>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {availableCategories.length === 0 ? (
              <Text
                type="secondary"
                style={{
                  textAlign: "center",
                  display: "block",
                  marginTop: "20px",
                }}
              >
                No more categories to add.
              </Text>
            ) : (
              availableCategories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "6px",
                    background: "#fafafa",
                  }}
                >
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {cat.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {cat.products_count || 0} products available
                    </Text>
                  </div>
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddCategory(cat.id)}
                  />
                </div>
              ))
            )}
          </div>
        </Sider>

        <Content
          style={{
            padding: "40px",
            overflowY: "auto",
            background: "#f5f5f5",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{ width: "100%", maxWidth: "800px", paddingBottom: "100px" }}
          >
            <Title
              level={2}
              style={{ textAlign: "center", marginBottom: "40px" }}
              editable={{
                onChange: handleRenameMenu,
                tooltip: "Click to rename menu",
                triggerType: ["text", "icon"],
              }}
            >
              {menu.name}
            </Title>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localCategories.map((c) => `category-${c.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {localCategories.map((category) => (
                  <SortableCategory
                    key={category.id}
                    category={category}
                    menuId={menuId}
                    onRemoveCategory={(id) =>
                      removeCategory({ menu_id: menuId, id })
                    }
                    onRemoveProduct={(id) =>
                      removeProduct({ id, menu_id: menuId })
                    }
                    onUpdateProduct={(id, options) =>
                      updateProductOptions({ id, menu_id: menuId, ...options })
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>

            {localCategories.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  background: "#fff",
                  border: "2px dashed #d9d9d9",
                  borderRadius: "8px",
                }}
              >
                <Text type="secondary">
                  Your menu is empty. Add a category from the left sidebar to
                  start building.
                </Text>
              </div>
            )}
          </div>
        </Content>
        <Modal
          title={
            <Space>
              <EyeOutlined /> Menu Preview
            </Space>
          }
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          width={1000}
          footer={[
            <Button key="cancel" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>,
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              Print / Save as PDF
            </Button>,
          ]}
        >
          <div
            style={{
              backgroundColor: "#525659",
              padding: "40px 20px",
              maxHeight: "70vh",
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
              borderRadius: "6px",
            }}
          >
            {menu && <PrintableMenu ref={printRef} menu={menu} />}
          </div>
        </Modal>
      </Layout>
    </Layout>
  );
}

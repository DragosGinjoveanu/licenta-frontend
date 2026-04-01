import { useState } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Typography, Button, Space, Select, message } from "antd";
import {
  HolderOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { MenuCategory, MenuProduct } from "../store/menuBuilderApiSlice";
import { SortableProduct } from "./SortableProduct";
import {
  useGetAvailableProductsForMenuCategoryQuery,
  useAddProductToMenuCategoryMutation,
} from "../store/menuBuilderApiSlice";

const { Title } = Typography;

interface SortableCategoryProps {
  category: MenuCategory;
  menuId: number;
  onRemoveCategory: (id: number) => void;
  onRemoveProduct: (id: number) => void;
  onUpdateProduct: (id: number, options: Partial<MenuProduct>) => void;
}

export function SortableCategory({
  category,
  menuId,
  onRemoveCategory,
  onRemoveProduct,
  onUpdateProduct,
}: SortableCategoryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const { data: availableProducts, isLoading: isLoadingProducts } =
    useGetAvailableProductsForMenuCategoryQuery(category.category_id);

  const [addProduct, { isLoading: isAddingProduct }] =
    useAddProductToMenuCategoryMutation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `category-${category.id}`,
    data: { type: "Category", category },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginBottom: "24px",
    background: "#fafafa",
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
  };

  const productIds =
    category.menu_products?.map((p) => `product-${p.id}`) || [];

  const existingProductIds =
    category.menu_products?.map((p) => p.product_id) || [];
  const selectableProducts =
    availableProducts?.filter((p) => !existingProductIds.includes(p.id)) || [];

  const handleAddProduct = async () => {
    if (!selectedProductId) return;
    try {
      await addProduct({
        menu_id: menuId,
        menu_category_id: category.id,
        product_id: selectedProductId,
      }).unwrap();
      message.success("Product added to category!");
      setIsAdding(false);
      setSelectedProductId(null);
    } catch (e) {
      message.error(
        "Failed to add product. Make sure it belongs to this category."
      );
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          borderBottom: "1px solid #e8e8e8",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            {...attributes}
            {...listeners}
            style={{ cursor: "grab", color: "#999" }}
          >
            <HolderOutlined />
          </div>
          <Title level={5} style={{ margin: 0 }}>
            {category.category_details?.name}
          </Title>
        </div>
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveCategory(category.id)}
        />
      </div>

      <div style={{ padding: "16px" }}>
        <SortableContext
          items={productIds}
          strategy={verticalListSortingStrategy}
        >
          {category.menu_products?.map((product) => (
            <SortableProduct
              key={product.id}
              product={product}
              onRemove={onRemoveProduct}
              onUpdateOptions={onUpdateProduct}
            />
          ))}

          {/* Mesaj când nu sunt produse */}
          {(!category.menu_products || category.menu_products.length === 0) &&
            !isAdding && (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  padding: "16px 0",
                  border: "1px dashed #d9d9d9",
                  borderRadius: "6px",
                }}
              >
                No products yet. Click "Add Product" below.
              </div>
            )}
        </SortableContext>
      </div>

      <div
        style={{
          padding: "0 16px 16px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {isAdding ? (
          <Space style={{ width: "100%", justifyContent: "center" }}>
            <Select
              showSearch
              placeholder="Select a product from catalog..."
              style={{ width: 300 }}
              loading={isLoadingProducts}
              value={selectedProductId}
              onChange={(val) => setSelectedProductId(val)}
              options={selectableProducts.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
            <Button
              type="primary"
              onClick={handleAddProduct}
              loading={isAddingProduct}
              disabled={!selectedProductId}
            >
              Add
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setSelectedProductId(null);
              }}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setIsAdding(true)}
            disabled={selectableProducts.length === 0}
            style={{ width: "100%", maxWidth: "300px" }}
          >
            {selectableProducts.length === 0
              ? "All products added"
              : "Add Product"}
          </Button>
        )}
      </div>
    </div>
  );
}

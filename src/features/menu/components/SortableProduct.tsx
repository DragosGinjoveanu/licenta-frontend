import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Checkbox, Space, Typography, Button, Tag } from "antd";
import { HolderOutlined, DeleteOutlined } from "@ant-design/icons";
import type { MenuProduct } from "../store/menuBuilderApiSlice";

const { Text } = Typography;

interface SortableProductProps {
  product: MenuProduct;
  onRemove: (id: number) => void;
  onUpdateOptions: (id: number, options: Partial<MenuProduct>) => void;
}

export function SortableProduct({
  product,
  onRemove,
  onUpdateOptions,
}: SortableProductProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `product-${product.id}`,
    data: { type: "Product", product },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginBottom: "8px",
    zIndex: isDragging ? 999 : "auto",
  };

  const isAvailable = product.product_details?.is_available;
  const hasDescription = !!product.product_details?.description;
  const hasIngredients =
    (product.product_details?.ingredients?.length ?? 0) > 0;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{
          border: !isAvailable ? "1px dashed #ff4d4f" : "1px solid #f0f0f0",
          backgroundColor: !isAvailable ? "#fff1f0" : "#fff",
        }}
      >
        <div
          {...attributes}
          {...listeners}
          style={{ cursor: "grab", color: "#999" }}
        >
          <HolderOutlined />
        </div>

        <div style={{ flex: 1 }}>
          <Space>
            <Text
              strong
              style={{ color: !isAvailable ? "#cf1322" : "inherit" }}
            >
              {product.product_details?.name}
            </Text>
            {!isAvailable && (
              <Tag color="error" style={{ fontSize: "10px" }}>
                HIDDEN IN CATALOG
              </Tag>
            )}
          </Space>
          <div style={{ marginTop: "4px" }}>
            <Space size="middle">
              <Checkbox
                checked={product.show_price}
                onChange={(e) =>
                  onUpdateOptions(product.id, { show_price: e.target.checked })
                }
              >
                Price
              </Checkbox>
              <Checkbox
                checked={product.show_description}
                disabled={!hasDescription}
                onChange={(e) =>
                  onUpdateOptions(product.id, {
                    show_description: e.target.checked,
                  })
                }
              >
                Description{" "}
                {!hasDescription && (
                  <Text disabled style={{ fontSize: "11px" }}>
                    (Empty)
                  </Text>
                )}
              </Checkbox>

              <Checkbox
                checked={product.show_ingredients}
                disabled={!hasIngredients}
                onChange={(e) =>
                  onUpdateOptions(product.id, {
                    show_ingredients: e.target.checked,
                  })
                }
              >
                Ingredients{" "}
                {!hasIngredients && (
                  <Text disabled style={{ fontSize: "11px" }}>
                    (None)
                  </Text>
                )}
              </Checkbox>
            </Space>
          </div>
        </div>

        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(product.id)}
        />
      </Card>
    </div>
  );
}

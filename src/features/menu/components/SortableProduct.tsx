import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Checkbox, Space, Typography, Button } from "antd";
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

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        styles={{
          body: {
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          },
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
          <Text strong>{product.product_details?.name}</Text>
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
                onChange={(e) =>
                  onUpdateOptions(product.id, {
                    show_description: e.target.checked,
                  })
                }
              >
                Description
              </Checkbox>
              <Checkbox
                checked={product.show_ingredients}
                onChange={(e) =>
                  onUpdateOptions(product.id, {
                    show_ingredients: e.target.checked,
                  })
                }
              >
                Ingredients
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

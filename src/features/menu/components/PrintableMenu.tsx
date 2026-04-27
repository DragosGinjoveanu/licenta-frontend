import { forwardRef } from "react";
import { Typography } from "antd";
import type { Menu } from "../store/menuBuilderApiSlice";

const { Title, Text } = Typography;

interface PrintableMenuProps {
  menu: Menu;
}

export const PrintableMenu = forwardRef<HTMLDivElement, PrintableMenuProps>(
  ({ menu }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          margin: "0 auto",
          backgroundColor: "#fff",
          color: "#000",
          boxSizing: "border-box",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Title
            level={1}
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {menu.name}
          </Title>
          <div
            style={{
              width: "50px",
              height: "2px",
              background: "#000",
              margin: "16px auto",
            }}
          />
        </div>

        {menu.menu_categories?.map((category) => {
          if (!category.menu_products || category.menu_products.length === 0)
            return null;

          return (
            <div
              key={category.id}
              style={{ marginBottom: "32px", pageBreakInside: "avoid" }}
            >
              <Title
                level={3}
                style={{
                  borderBottom: "1px solid #eaeaea",
                  paddingBottom: "8px",
                  textTransform: "uppercase",
                  fontSize: "20px",
                }}
              >
                {category.category_details?.name}
              </Title>

              {category.menu_products
                ?.filter((mp) => mp.product_details?.is_available)
                .map((product) => (
                  <div
                    key={product.id}
                    style={{ marginBottom: "16px", pageBreakInside: "avoid" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <Text strong style={{ fontSize: "16px" }}>
                        {product.product_details?.name}
                      </Text>
                      {product.show_price && (
                        <Text strong style={{ fontSize: "16px" }}>
                          {product.product_details?.price} RON
                        </Text>
                      )}
                    </div>

                    {product.show_description &&
                      product.product_details?.description && (
                        <div style={{ marginTop: "4px" }}>
                          <Text
                            italic
                            style={{ fontSize: "14px", color: "#555" }}
                          >
                            {product.product_details.description}
                          </Text>
                        </div>
                      )}

                    {product.show_ingredients &&
                      product.product_details?.ingredients &&
                      product.product_details.ingredients.length > 0 && (
                        <div style={{ marginTop: "2px" }}>
                          <Text style={{ fontSize: "12px", color: "#888" }}>
                            [{" "}
                            {product.product_details.ingredients
                              .map((i) => i.name)
                              .join(", ")}{" "}
                            ]
                          </Text>
                        </div>
                      )}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    );
  }
);

import { Form, Space, Select, InputNumber, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useGetProductsQuery } from "../../menu/store/menuApiSlice";

interface OrderProductsListProps {
  form: any;
}

export default function OrderProductsList({ form }: OrderProductsListProps) {
  const { data: products, isLoading: isLoadingProducts } =
    useGetProductsQuery();

  const currentItems = Form.useWatch("items", form);

  return (
    <Form.List
      name="items"
      rules={[
        {
          validator: async (_, items) => {
            if (!items || items.length < 1) {
              return Promise.reject(
                new Error("At least one product is required")
              );
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields.map(({ key, name, ...restField }) => {
            const selectedProductId = currentItems?.[name]?.product_id;
            const selectedProduct = products?.find(
              (p) => p.id === selectedProductId
            );
            const maxQty = selectedProduct?.max_quantity ?? 999;

            return (
              <Space
                key={key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, "product_id"]}
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Select
                    style={{ width: 300 }}
                    placeholder="Select product"
                    loading={isLoadingProducts}
                    showSearch
                    optionFilterProp="label"
                    listHeight={350}
                  >
                    {products
                      ?.filter((p) => p.is_available)
                      .map((p) => {
                        const isOutOfStock = p.max_quantity === 0;
                        const isLowStock =
                          p.max_quantity > 0 && p.max_quantity <= 10;

                        return (
                          <Select.Option
                            key={p.id}
                            value={p.id}
                            disabled={isOutOfStock}
                            label={p.name}
                          >
                            <span
                              style={{
                                color: isOutOfStock ? "#ff4d4f" : "inherit",
                                textDecoration: isOutOfStock
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {p.name} ({p.price} RON)
                              {isOutOfStock && " - OUT OF STOCK"}
                              {isLowStock && (
                                <span
                                  style={{
                                    color: "#faad14",
                                    marginLeft: 8,
                                    fontSize: "12px",
                                  }}
                                >
                                  (Only {p.max_quantity} left)
                                </span>
                              )}
                            </span>
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, "quantity"]}
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber min={1} max={maxQty} placeholder="Qty" />
                </Form.Item>

                {fields.length > 1 && (
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{ color: "red", cursor: "pointer" }}
                  />
                )}
              </Space>
            );
          })}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              Add Product
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Table,
  Space,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Divider,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useGetProductRecipeQuery,
  useUpdateProductRecipeMutation,
  useGetIngredientsQuery,
} from "../store/menuApiSlice";

const { Title, Text } = Typography;

interface RecipeRow {
  key: string;
  ingredient_id: number | null;
  quantity: number;
  unit: string;
  cost: number;
}

export default function RecipeBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading: isProductLoading } =
    useGetProductRecipeQuery(Number(id));
  const { data: allIngredients } = useGetIngredientsQuery();
  const [updateRecipe, { isLoading: isSaving }] =
    useUpdateProductRecipeMutation();

  const [rows, setRows] = useState<RecipeRow[]>([]);

  useEffect(() => {
    if (product?.ingredients) {
      const initialRows = product.ingredients.map((ing: any) => ({
        key: String(ing.id),
        ingredient_id: ing.id,
        quantity: Number(ing.pivot.quantity_required),
        unit: ing.unit_of_measure,
        cost: Number(ing.cost_per_unit),
      }));
      setRows(initialRows);
    }
  }, [product]);

  const handleAddRow = () => {
    const newKey = Date.now().toString();
    setRows([
      ...rows,
      { key: newKey, ingredient_id: null, quantity: 0, unit: "-", cost: 0 },
    ]);
  };

  const handleRemoveRow = (key: string) => {
    setRows(rows.filter((row) => row.key !== key));
  };

  const handleUpdateRow = (key: string, field: keyof RecipeRow, value: any) => {
    const updatedRows = rows.map((row) => {
      if (row.key === key) {
        if (field === "ingredient_id") {
          const selectedIng = allIngredients?.find((i) => i.id === value);
          return {
            ...row,
            ingredient_id: value,
            unit: selectedIng?.unit_of_measure || "-",
            cost: Number(selectedIng?.cost_per_unit || 0),
          };
        }
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSave = async () => {
    const hasEmptyIngredients = rows.some((r) => !r.ingredient_id);
    if (hasEmptyIngredients) {
      message.warning(
        "Please select an ingredient for all rows, or remove the empty ones."
      );
      return;
    }

    const hasZeroQuantity = rows.some((r) => r.quantity <= 0);
    if (hasZeroQuantity) {
      message.warning("Quantity must be greater than 0 for all ingredients.");
      return;
    }

    const payload = {
      id: Number(id),
      ingredients: rows.map((r) => ({
        ingredient_id: r.ingredient_id!,
        quantity_required: r.quantity,
      })),
    };

    try {
      await updateRecipe(payload).unwrap();
      message.success("Recipe updated successfully!");
    } catch (err: any) {
      console.error("Save Recipe Error:", err);

      if (err?.status === 422 && err?.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        const errorMessage = err.data.errors[firstErrorKey][0];
        message.error(`Validation Error: ${errorMessage}`);
      } else {
        message.error(
          err?.data?.message || "Failed to save recipe. Please try again."
        );
      }
    }
  };

  const totalCost = rows.reduce((acc, row) => acc + row.quantity * row.cost, 0);
  const salePrice = Number(product?.price || 0);
  const foodCostPercentage = salePrice > 0 ? (totalCost / salePrice) * 100 : 0;

  const columns = [
    {
      title: "Ingredient",
      dataIndex: "ingredient_id",
      key: "ingredient_id",
      render: (val: number, record: RecipeRow) => {
        const selectedIdsInOtherRows = rows
          .filter((r) => r.key !== record.key && r.ingredient_id !== null)
          .map((r) => r.ingredient_id);

        const availableOptions = allIngredients
          ?.filter((i) => !selectedIdsInOtherRows.includes(i.id))
          .map((i) => ({ label: i.name, value: i.id }));

        return (
          <Select
            showSearch={{
              filterOption: (input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
            style={{ width: "100%" }}
            placeholder="Select ingredient"
            allowClear
            value={val}
            onChange={(v) => handleUpdateRow(record.key, "ingredient_id", v)}
            options={availableOptions}
          />
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (val: number, record: RecipeRow) => (
        <Space.Compact style={{ width: "100%" }}>
          <InputNumber
            min={0}
            value={val}
            onChange={(v) => handleUpdateRow(record.key, "quantity", v || 0)}
            style={{ width: "70%" }}
          />
          <Button
            disabled
            style={{
              width: "30%",
              color: "rgba(0,0,0,0.85)",
              background: "#f5f5f5",
            }}
          >
            {record.unit}
          </Button>
        </Space.Compact>
      ),
    },
    {
      title: "Cost Subtotal",
      key: "subtotal",
      width: 150,
      render: (_: any, record: RecipeRow) =>
        `${(record.quantity * record.cost).toFixed(2)} RON`,
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: any, record: RecipeRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveRow(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="middle">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/menu")}
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Recipe for: {product?.name}
                </Title>
                <Text type="secondary">
                  Manage ingredients and production costs
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={isSaving}
              onClick={handleSave}
            >
              Save Recipe
            </Button>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={16}>
            <Card
              title="Ingredients List"
              extra={
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddRow}
                  disabled={rows.length >= (allIngredients?.length || 0)}
                >
                  Add Ingredient
                </Button>
              }
            >
              <Table
                dataSource={rows}
                columns={columns}
                pagination={false}
                loading={isProductLoading}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Recipe Summary">
              <Space
                orientation="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <Row justify="space-between">
                  <Text>Selling Price:</Text>
                  <Text strong>{salePrice.toFixed(2)} RON</Text>
                </Row>
                <Row justify="space-between">
                  <Text>Total Food Cost:</Text>
                  <Text
                    strong
                    style={{ color: totalCost > salePrice ? "red" : "inherit" }}
                  >
                    {totalCost.toFixed(2)} RON
                  </Text>
                </Row>
                <Divider style={{ margin: "12px 0" }} />
                <Row justify="space-between">
                  <Text>Food Cost %:</Text>
                  <Tag color={foodCostPercentage > 35 ? "red" : "green"}>
                    {foodCostPercentage.toFixed(1)}%
                  </Tag>
                </Row>
                <Row justify="space-between">
                  <Text>Gross Profit:</Text>
                  <Text strong style={{ color: "green" }}>
                    {(salePrice - totalCost).toFixed(2)} RON
                  </Text>
                </Row>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}

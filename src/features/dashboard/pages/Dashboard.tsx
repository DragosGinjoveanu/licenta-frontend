import { useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  DatePicker,
  Spin,
  Statistic,
  Empty,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  FallOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useGetDashboardStatsQuery } from "../store/dashboardApiSlice";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = {
  dine_in: "#fa8c16",
  delivery: "#722ed1",
  pickup: "#1890ff",
};

const TYPE_LABELS = {
  dine_in: "Dine-In",
  delivery: "Delivery",
  pickup: "Pickup",
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "days").startOf("day"),
    dayjs().endOf("day"),
  ]);

  const { data, isLoading, isFetching } = useGetDashboardStatsQuery({
    start_date: dateRange[0].format("YYYY-MM-DD HH:mm:ss"),
    end_date: dateRange[1].format("YYYY-MM-DD HH:mm:ss"),
  });

  const handleDateChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "100px" }}
      >
        <Spin
          size="large"
          description="Loading Business Intelligence Analytics..."
        />
      </div>
    );
  }

  const { kpis, charts } = data || {};

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Business Intelligence Dashboard
        </Title>
        <RangePicker
          showTime={{ format: "HH:mm" }}
          format="YYYY-MM-DD HH:mm"
          value={dateRange}
          onChange={handleDateChange}
          allowClear={false}
          disabled={isFetching}
          style={{ minWidth: "320px" }}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col style={{ flex: "1 1 18%", minWidth: "200px" }}>
          <Card
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Total Revenue"
              value={kpis?.total_revenue || 0}
              precision={2}
              suffix="RON"
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              styles={{ content: { color: "#52c41a", fontWeight: "bold" } }}
            />
          </Card>
        </Col>

        <Col style={{ flex: "1 1 18%", minWidth: "200px" }}>
          <Card
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              borderLeft: "4px solid #1890ff",
            }}
          >
            <Statistic
              title="Gross Profit"
              value={kpis?.gross_profit || 0}
              precision={2}
              suffix="RON"
              prefix={<BankOutlined style={{ color: "#1890ff" }} />}
              styles={{ content: { color: "#1890ff", fontWeight: "bold" } }}
            />
          </Card>
        </Col>

        <Col style={{ flex: "1 1 18%", minWidth: "200px" }}>
          <Card
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Total Orders"
              value={kpis?.total_orders || 0}
              prefix={<ShoppingCartOutlined style={{ color: "#fa8c16" }} />}
              styles={{ content: { fontWeight: "bold" } }}
            />
          </Card>
        </Col>

        <Col style={{ flex: "1 1 18%", minWidth: "200px" }}>
          <Card
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Average Order Value"
              value={kpis?.aov || 0}
              precision={2}
              suffix="RON"
              prefix={<LineChartOutlined style={{ color: "#722ed1" }} />}
              styles={{ content: { fontWeight: "bold" } }}
            />
          </Card>
        </Col>

        <Col style={{ flex: "1 1 18%", minWidth: "200px" }}>
          <Card
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Statistic
              title="Missed (Cancellations)"
              value={kpis?.lost_revenue || 0}
              precision={2}
              suffix="RON"
              prefix={<FallOutlined style={{ color: "#f5222d" }} />}
              styles={{ content: { color: "#f5222d", fontWeight: "bold" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* GRAFICUL COMBINAT REVENUE VS PROFIT */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title="Revenue vs Profit Trends"
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {charts?.revenue_trends && charts.revenue_trends.length > 0 ? (
              <div style={{ height: 350, width: "100%" }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                  <AreaChart
                    data={charts.revenue_trends}
                    margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#52c41a"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#52c41a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorProfit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1890ff"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1890ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="#bfbfbf"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#bfbfbf"
                      tickFormatter={(value) => `${value} RON`}
                    />
                    <RechartsTooltip
                      formatter={(value: any, name: string) => [
                        typeof value === "number"
                          ? `${value.toFixed(2)} RON`
                          : value,
                        name === "total_revenue" ? "Revenue" : "Gross Profit",
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                      type="monotone"
                      name="total_revenue"
                      dataKey="total_revenue"
                      stroke="#52c41a"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      name="gross_profit"
                      dataKey="gross_profit"
                      stroke="#1890ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No trend data available for the selected interval" />
            )}
          </Card>
        </Col>
      </Row>

      {/* RÂNDUL CU 3 COLOANE ECHILIBRATE */}
      <Row gutter={[16, 16]}>
        {/* 1. SALES MIX */}
        <Col xs={24} lg={8}>
          <Card
            title="Sales Mix (Distribution)"
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            {charts?.sales_mix && charts.sales_mix.length > 0 ? (
              <div style={{ height: 320, width: "100%" }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                  <PieChart>
                    <Pie
                      data={charts.sales_mix}
                      dataKey="revenue"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      label={(props: any) => {
                        const { name, percent } = props;
                        const displayName =
                          TYPE_LABELS[name as keyof typeof TYPE_LABELS] || name;
                        return `${displayName} ${((percent || 0) * 100).toFixed(
                          0
                        )}%`;
                      }}
                    >
                      {charts.sales_mix.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[entry.type as keyof typeof COLORS] ||
                            "#d9d9d9"
                          }
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => [
                        typeof value === "number"
                          ? `${value.toFixed(2)} RON`
                          : value,
                        "Revenue",
                      ]}
                    />
                    <Legend
                      formatter={(value) =>
                        TYPE_LABELS[value as keyof typeof TYPE_LABELS] || value
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No distribution data found for this period" />
            )}
          </Card>
        </Col>

        {/* 2. TOP VOLUME (Cele mai vândute) */}
        <Col xs={24} lg={8}>
          <Card
            title="Top 5 Units Sold (Volume)"
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            {charts?.top_products && charts.top_products.length > 0 ? (
              <div style={{ height: 320, width: "100%" }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                  <BarChart
                    data={charts.top_products}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      type="number"
                      stroke="#bfbfbf"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      tick={{ fontSize: 11 }}
                      stroke="#bfbfbf"
                    />
                    <RechartsTooltip
                      formatter={(value: any) => [value, "Units Sold"]}
                    />
                    <Bar
                      dataKey="total_sold"
                      fill="#fa8c16"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    >
                      {charts.top_products.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#d46b08" : "#fa8c16"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No volume metrics for this period" />
            )}
          </Card>
        </Col>

        {/* 3. TOP MARGIN (Cele mai profitabile) */}
        <Col xs={24} lg={8}>
          <Card
            title="Top 5 Money Makers (Margin)"
            variant="borderless"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            {charts?.top_profitable && charts.top_profitable.length > 0 ? (
              <div style={{ height: 320, width: "100%" }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                  <BarChart
                    data={charts.top_profitable}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      type="number"
                      stroke="#bfbfbf"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      tick={{ fontSize: 11 }}
                      stroke="#bfbfbf"
                    />
                    <RechartsTooltip
                      formatter={(value: any) => [
                        typeof value === "number"
                          ? `${value.toFixed(2)} RON`
                          : value,
                        "Profit",
                      ]}
                    />
                    <Bar
                      dataKey="total_profit"
                      fill="#1890ff"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    >
                      {charts.top_profitable.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#0958d9" : "#1890ff"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No profit metrics for this period" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import { baseApi } from "../../../core/api/baseApi";

export interface DashboardKpis {
  total_revenue: number;
  gross_profit: number;
  total_orders: number;
  aov: number;
  lost_revenue: number;
}

export interface RevenueTrend {
  date: string;
  total_revenue: number;
  gross_profit: number;
  total_orders?: number;
}

export interface SalesMix {
  type: "dine_in" | "delivery" | "pickup";
  count: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  total_sold: number;
}

export interface TopProfitable {
  name: string;
  total_profit: number;
}

export interface DashboardCharts {
  revenue_trends: RevenueTrend[];
  sales_mix: SalesMix[];
  top_products: TopProduct[];
  top_profitable: TopProfitable[];
}

export interface DashboardData {
  kpis: DashboardKpis;
  charts: DashboardCharts;
  period: {
    start: string;
    end: string;
  };
}

export interface DashboardQueryParams {
  start_date?: string;
  end_date?: string;
}

export const dashboardApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardData, DashboardQueryParams>({
      query: (params) => ({
        url: "/api/dashboard/stats",
        method: "GET",
        params: params,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardStatsQuery } = dashboardApiSlice;

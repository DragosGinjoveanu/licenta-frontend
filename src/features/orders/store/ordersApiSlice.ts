import { baseApi } from "../../../core/api/baseApi";
import type { Product } from "../../menu/store/menuApiSlice";
import type { User } from "../../auth/store/authSlice";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  quantity: number;
  unit_price: string;
  product?: Product;
}

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  notes: string | null;
}

export interface Order {
  id: number;
  restaurant_id: number;
  user_id: number;
  type: "dine_in" | "delivery" | "pickup";
  status:
    | "pending"
    | "cooking"
    | "ready"
    | "delivering"
    | "completed"
    | "cancelled";
  table_id: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  scheduled_for: string | null;
  total_amount: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
  user?: User;
}

export const ordersApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveOrders: builder.query<Order[], { user_id?: number | null }>({
      query: (params) => ({
        url: "api/orders/active",
        params,
      }),
      providesTags: ["Order"],
    }),

    getFinishedOrders: builder.query<Order[], void>({
      query: () => ({ url: "/api/orders/history", method: "GET" }),
      providesTags: ["Order"],
    }),

    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (data) => ({ url: "/api/orders", method: "POST", data }),
      invalidatesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<Order, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/orders/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetActiveOrdersQuery,
  useGetFinishedOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = ordersApiSlice;

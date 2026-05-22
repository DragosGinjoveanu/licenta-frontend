import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axiosInstance from "../config/axios";

export type CustomErrorType = {
  status?: number;
  data?: any;
};

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: string;
      data?: any;
      params?: any;
    },
    unknown,
    CustomErrorType
  > =>
  async ({ url, method = "GET", data, params }) => {
    const requiresCsrf = ["POST", "PUT", "DELETE", "PATCH"].includes(
      method.toUpperCase()
    );

    if (requiresCsrf) {
      try {
        await axiosInstance.get("/sanctum/csrf-cookie");
      } catch (csrfError) {
        console.warn("CSRF Fetch failed", csrfError);
      }
    }

    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError: any) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  refetchOnFocus: true,
  tagTypes: [
    "User",
    "Category",
    "Supplier",
    "Ingredient",
    "Category",
    "Product",
    "Menu",
    "Order",
  ],
  endpoints: () => ({}),
});

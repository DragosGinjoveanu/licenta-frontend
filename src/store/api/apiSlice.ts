import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../axios";

// Create a custom baseQuery using our pre-configured Axios instance
// This allows RTK Query to use our Axios setup (with credentials, XSRF tokens, etc.)
const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }: any) => {
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

export const apiSlice = createApi({
  reducerPath: "api", // The name of the slice in the Redux store
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User"],
  endpoints: () => ({}),
});

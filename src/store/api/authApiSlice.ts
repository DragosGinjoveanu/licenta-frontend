import { apiSlice } from "./apiSlice";
import axiosInstance from "../../axios";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      queryFn: async (data) => {
        try {
          await axiosInstance.get("/sanctum/csrf-cookie");
          const result = await axiosInstance.post("/register", data);
          return { data: result.data };
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data || error.message,
            },
          };
        }
      },
    }),

    login: builder.mutation({
      queryFn: async (credentials) => {
        try {
          await axiosInstance.get("/sanctum/csrf-cookie");

          const result = await axiosInstance.post("/login", credentials);

          return { data: result.data }; // empty return, 204
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data || error.message,
            },
          };
        }
      },
    }),

    getUser: builder.query({
      query: () => ({
        url: "/api/user",
        method: "GET",
      }),
    }),

    forgotPassword: builder.mutation({
      queryFn: async (data) => {
        try {
          await axiosInstance.get("/sanctum/csrf-cookie");
          const result = await axiosInstance.post("/forgot-password", data);

          return { data: result.data };
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data || error.message,
            },
          };
        }
      },
    }),

    resetPassword: builder.mutation({
      queryFn: async (data) => {
        try {
          await axiosInstance.get("/sanctum/csrf-cookie");
          const result = await axiosInstance.post("/reset-password", data);
          return { data: result.data };
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data || error.message,
            },
          };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLazyGetUserQuery,
} = authApiSlice;

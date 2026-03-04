import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => ({
        url: "/api/user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        data,
      }),
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/forgot-password",
        method: "POST",
        data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset-password",
        method: "POST",
        data,
      }),
    }),

    verifyEmail: builder.mutation<void, { url: string }>({
      query: ({ url }) => ({
        url,
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),

    resendVerification: builder.mutation<void, void>({
      query: () => ({
        url: "/email/verification-notification",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
  useGetUserQuery,
  useLazyGetUserQuery,
} = authApiSlice;

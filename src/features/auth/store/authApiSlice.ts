import { baseApi } from "../../../core/api/baseApi";

export const authApiSlice = baseApi.injectEndpoints({
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

    logoutApi: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.warn("Server logout failed or session already expired");
        } finally {
          dispatch({ type: "auth/logout" });

          dispatch(baseApi.util.resetApiState());
        }
      },
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
  useLogoutApiMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
  useGetUserQuery,
  useLazyGetUserQuery,
} = authApiSlice;

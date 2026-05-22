import { baseApi } from "../../../core/api/baseApi";

export const profileApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfileName: builder.mutation<{ message: string }, { name: string }>({
      query: (data) => ({
        url: "/api/profile/name",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["User"],
    }),
    updateProfilePassword: builder.mutation<
      { message: string },
      {
        current_password: string;
        password: string;
        password_confirmation: string;
      }
    >({
      query: (data) => ({
        url: "/api/profile/password",
        method: "PUT",
        data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfileNameMutation,
  useUpdateProfilePasswordMutation,
} = profileApiSlice;

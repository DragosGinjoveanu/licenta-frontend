import { baseApi } from "../../../core/api/baseApi";

export const restaurantApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRestaurant: builder.mutation({
      query: (data) => ({
        url: "/api/restaurants",
        method: "POST",
        data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateRestaurantMutation } = restaurantApiSlice;

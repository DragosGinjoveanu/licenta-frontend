import { baseApi } from "../../../core/api/baseApi";

export const restaurantApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurant: builder.query<any, void>({
      query: () => ({
        url: "/api/restaurant",
        method: "GET",
      }),
    }),
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

export const { useCreateRestaurantMutation, useGetRestaurantQuery } =
  restaurantApiSlice;

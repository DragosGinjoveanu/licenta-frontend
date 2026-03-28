import { baseApi } from "../../../core/api/baseApi";

export interface Ingredient {
  id: number;
  restaurant_id: number;
  supplier_id: number | null;
  name: string;
  unit_of_measure: string;
  stock_quantity: number;
  alert_level: number;
  cost_per_unit: number;
  supplier_name?: string;
}

export interface Supplier {
  id: number;
  restaurant_id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
}

export const inventoryApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // SUPPLIERS
    getSuppliers: builder.query<Supplier[], void>({
      query: () => ({
        url: "/api/suppliers",
        method: "GET",
      }),
      providesTags: ["Supplier"],
    }),

    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (data) => ({
        url: "/api/suppliers",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Supplier"],
    }),

    updateSupplier: builder.mutation<
      Supplier,
      Partial<Supplier> & { id: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/suppliers/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Supplier", "Ingredient"],
    }),

    deleteSupplier: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/api/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier", "Ingredient"],
    }),

    // INGREDIENTS
    getIngredients: builder.query<Ingredient[], void>({
      query: () => ({ url: "/api/ingredients", method: "GET" }),
      providesTags: ["Ingredient"],
    }),

    createIngredient: builder.mutation<Ingredient, Partial<Ingredient>>({
      query: (data) => ({ url: "/api/ingredients", method: "POST", data }),
      invalidatesTags: ["Ingredient"],
    }),

    updateIngredient: builder.mutation<
      Ingredient,
      Partial<Ingredient> & { id: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/ingredients/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Ingredient"],
    }),

    deleteIngredient: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/api/ingredients/${id}`, method: "DELETE" }),
      invalidatesTags: ["Ingredient"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,

  useGetIngredientsQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
} = inventoryApiSlice;

import { baseApi } from "../../../core/api/baseApi";

export interface Category {
  id: number;
  name: string;
  restaurant_id: number;
  products_count?: number;
}

export interface Product {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: string;
  is_available: boolean;
  categories?: Category[];
  ingredients?: { id: number; name: string }[];
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  category_ids?: number[];
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export interface GetCategoryFilters {
  id: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
  sort_field?: "name" | "price";
  sort_direction?: "asc" | "desc";
}

export const menuApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CATEGORIES
    getCategories: builder.query<
      Category[],
      { search?: string; sort?: string } | void
    >({
      query: (params) => ({
        url: "/api/categories",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (data) => ({ url: "/api/categories", method: "POST", data }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      Category,
      Partial<Category> & { id: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/categories/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Category", "Product", "Menu"],
    }),

    deleteCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/api/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category", "Product", "Menu"],
    }),

    detachProductFromCategory: builder.mutation<
      { message: string },
      { categoryId: number; productId: number }
    >({
      query: ({ categoryId, productId }) => ({
        url: `/api/categories/${categoryId}/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Product", "Menu"],
    }),

    getAvailableProducts: builder.query<Product[], number>({
      query: (id) => ({
        url: `/api/categories/${id}/available-products`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    attachProductsToCategory: builder.mutation<
      { message: string },
      { id: number; product_ids: number[] }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/categories/${id}/attach-products`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Category", "Product", "Menu"],
    }),

    getCategoryById: builder.query<CategoryWithProducts, GetCategoryFilters>({
      query: ({ id, ...params }) => ({
        url: `/api/categories/${id}`,
        method: "GET",
        params,
      }),
      providesTags: ["Category", "Product"],
    }),

    // PRODUCTS
    getProducts: builder.query<
      Product[],
      {
        search?: string;
        category_ids?: number[];
        min_price?: number;
        max_price?: number;
        is_available?: boolean;
        sort_field?: "name" | "price";
        sort_direction?: "asc" | "desc";
      } | void
    >({
      query: (params) => ({
        url: "/api/products",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<Product, ProductPayload>({
      query: (data) => ({ url: "/api/products", method: "POST", data }),
      invalidatesTags: ["Product", "Category"],
    }),

    updateProduct: builder.mutation<Product, ProductPayload & { id: number }>({
      query: ({ id, ...data }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: ["Product", "Category", "Menu"],
    }),

    deleteProduct: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/api/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Category", "Menu"],
    }),

    getIngredients: builder.query<any[], void>({
      query: () => ({
        url: "/api/ingredients",
        method: "GET",
      }),
      providesTags: ["Ingredient"],
    }),

    getProductRecipe: builder.query<Product & { ingredients: any[] }, number>({
      query: (id) => ({
        url: `/api/products/${id}/recipe`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    updateProductRecipe: builder.mutation<
      { message: string },
      {
        id: number;
        ingredients: { ingredient_id: number; quantity_required: number }[];
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/products/${id}/recipe`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Product", "Menu"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAttachProductsToCategoryMutation,
  useGetAvailableProductsQuery,
  useDetachProductFromCategoryMutation,
  useGetIngredientsQuery,
  useGetProductRecipeQuery,
  useUpdateProductRecipeMutation,
} = menuApiSlice;

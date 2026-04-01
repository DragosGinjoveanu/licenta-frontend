import { baseApi } from "../../../core/api/baseApi";
import type { Category, Product } from "./menuApiSlice";

export interface Menu {
  id: number;
  name: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
  menu_categories?: MenuCategory[];
}

export interface MenuCategory {
  id: number;
  menu_id: number;
  category_id: number;
  order: number;
  category_details?: Category;
  menu_products?: MenuProduct[];
}

export interface MenuProduct {
  id: number;
  menu_category_id: number;
  product_id: number;
  order: number;
  show_price: boolean;
  show_description: boolean;
  show_ingredients: boolean;
  visible_ingredients: number[] | null;
  product_details?: Product;
}

export const menuBuilderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenus: builder.query<Menu[], void>({
      query: () => ({ url: "/api/menus", method: "GET" }),
      providesTags: ["Menu"],
    }),

    getMenuById: builder.query<Menu, number>({
      query: (id) => ({ url: `/api/menus/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Menu", id }],
    }),

    createMenu: builder.mutation<Menu, { name: string }>({
      query: (data) => ({ url: "/api/menus", method: "POST", data }),
      invalidatesTags: ["Menu"],
    }),

    updateMenu: builder.mutation<Menu, { id: number; name: string }>({
      query: ({ id, ...data }) => ({
        url: `/api/menus/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Menu", id },
        "Menu",
      ],
    }),

    deleteMenu: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/api/menus/${id}`, method: "DELETE" }),
      invalidatesTags: ["Menu"],
    }),

    addCategoryToMenu: builder.mutation<
      MenuCategory,
      { menu_id: number; category_id: number }
    >({
      query: (data) => ({ url: "/api/menu-categories", method: "POST", data }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),

    removeCategoryFromMenu: builder.mutation<
      { message: string },
      { menu_id: number; id: number }
    >({
      query: ({ id }) => ({
        url: `/api/menu-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),

    reorderMenuCategories: builder.mutation<
      void,
      { menu_id: number; orders: { id: number; order: number }[] }
    >({
      query: (data) => ({
        url: "/api/menu-categories/reorder",
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),

    getAvailableProductsForMenuCategory: builder.query<Product[], number>({
      query: (categoryId) => ({
        url: `/api/products?category_ids[]=${categoryId}`,
        method: "GET",
      }),
    }),

    addProductToMenuCategory: builder.mutation<
      MenuProduct,
      { menu_id: number; menu_category_id: number; product_id: number }
    >({
      query: ({ menu_id, ...data }) => ({
        url: "/api/menu-products",
        method: "POST",
        data,
      }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),

    updateMenuProductOptions: builder.mutation<
      MenuProduct,
      Partial<MenuProduct> & { id: number; menu_id: number }
    >({
      query: ({ id, menu_id, ...data }) => ({
        url: `/api/menu-products/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),

    reorderMenuProducts: builder.mutation<
      void,
      {
        menu_id: number;
        menu_category_id: number;
        orders: { id: number; order: number }[];
      }
    >({
      query: ({ menu_id, ...data }) => ({
        url: "/api/menu-products/reorder",
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),

    removeProductFromMenu: builder.mutation<
      { message: string },
      { id: number; menu_id: number }
    >({
      query: ({ id }) => ({
        url: `/api/menu-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { menu_id }) => [
        { type: "Menu", id: menu_id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMenusQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useAddCategoryToMenuMutation,
  useReorderMenuCategoriesMutation,
  useGetAvailableProductsForMenuCategoryQuery,
  useAddProductToMenuCategoryMutation,
  useUpdateMenuProductOptionsMutation,
  useReorderMenuProductsMutation,
  useRemoveProductFromMenuMutation,
  useRemoveCategoryFromMenuMutation,
} = menuBuilderApiSlice;

import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../core/components/layouts/MainLayout";
import ErrorBoundary from "../core/components/ErrorBoundary";

import Dashboard from "../features/dashboard/pages/Dashboard";

import Profile from "../features/profile/pages/Profile";

import ForgotPassword from "../features/auth/pages/ForgotPassword";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ResetPassword from "../features/auth/pages/ResetPassword";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import VerifyPrompt from "../features/auth/pages/VerifyPrompt";
import AuthGuard from "../features/auth/guards/AuthGuard";
import GuestGuard from "../features/auth/guards/GuestGuard";

import Onboarding from "../features/restaurant/pages/Onboarding";
import MyRestaurant from "../features/restaurant/pages/MyRestaurant";
import RestaurantGuard from "../features/restaurant/guards/RestaurantGuard";
import OnboardingGuard from "../features/restaurant/guards/OnboardingGuard";

import MenuCatalog from "../features/menu/pages/MenuCatalog";
import CategoryDetails from "../features/menu/pages/CategoryDetails";
import RecipeBuilder from "../features/menu/pages/RecipeBuilder";
import MenuBuilderList from "../features/menu/pages/MenuBuilderList";
import MenuCanvas from "../features/menu/pages/MenuCanvas";

import Inventory from "../features/inventory/pages/Inventory";

import KdsDashboard from "../features/orders/pages/KdsDashboard";
import PosDashboard from "../features/orders/pages/PosDashboard";
import OrdersHistory from "../features/orders/pages/OrdersHistory";
import ActiveOrders from "../features/orders/pages/ActiveOrders";

export const router = createBrowserRouter([
  {
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <VerifyEmail />,
        path: "/verify-email/:id/:hash",
      },
      {
        element: <GuestGuard />,
        children: [
          {
            path: "/register",
            element: <Register />,
          },
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "/password-reset/:token",
            element: <ResetPassword />,
          },
        ],
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/verify-prompt",
            element: <VerifyPrompt />,
          },
          {
            element: <OnboardingGuard />,
            children: [
              {
                path: "/onboarding",
                element: <Onboarding />,
              },
            ],
          },
          {
            element: <RestaurantGuard />,
            children: [
              {
                path: "/",
                element: <MainLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="/dashboard" replace />,
                  },
                  {
                    path: "dashboard",
                    element: <Dashboard />,
                  },
                  {
                    path: "profile",
                    element: <Profile />,
                  },
                  {
                    path: "restaurant",
                    element: <MyRestaurant />,
                  },
                  {
                    path: "menu",
                    element: <MenuCatalog />,
                  },
                  {
                    path: "menu/categories/:id",
                    element: <CategoryDetails />,
                  },
                  {
                    path: "/menu/products/:id/recipe",
                    element: <RecipeBuilder />,
                  },
                  {
                    path: "inventory",
                    element: <Inventory />,
                  },
                  {
                    path: "/menu-builder",
                    element: <MenuBuilderList />,
                  },
                  {
                    path: "/menu-builder/:id",
                    element: <MenuCanvas />,
                  },
                  {
                    path: "/orders/active",
                    element: <ActiveOrders />,
                  },
                  {
                    path: "/orders/kds",
                    element: <KdsDashboard />,
                  },
                  {
                    path: "/orders/pos",
                    element: <PosDashboard />,
                  },
                  {
                    path: "/orders/history",
                    element: <OrdersHistory />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

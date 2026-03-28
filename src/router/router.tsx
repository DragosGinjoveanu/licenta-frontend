import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../core/components/layouts/MainLayout";
import ErrorBoundary from "../core/components/ErrorBoundary";

import Dashboard from "../features/dashboard/pages/Dashboard";

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

import MenuBuilder from "../features/menu/pages/MenuBuilder";

import Inventory from "../features/inventory/pages/Inventory";

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
                    path: "restaurant",
                    element: <MyRestaurant />,
                  },
                  {
                    path: "menu",
                    element: <MenuBuilder />,
                  },
                  {
                    path: "inventory",
                    element: <Inventory />,
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

import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "./App";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyPrompt from "./pages/VerifyPrompy";

import AuthGuard from "./guards/AuthGuard";
import GuestGuard from "./guards/GuestGuard";
import ErrorBoundary from "./pages/errors/ErrorBoundary";

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
            path: "/",
            element: <App />,
            children: [
              {
                index: true,
                element: <Navigate to="/dashboard" replace />,
              },
              {
                path: "/dashboard",
                element: <Dashboard />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

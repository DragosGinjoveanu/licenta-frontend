import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApiSlice } from "./authApiSlice";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  restaurant_id: number | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },

  extraReducers: (builder) => {
    // set user if get it successfully
    builder.addMatcher(
      authApiSlice.endpoints.getUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      }
    );

    // if user session expired or invalid credentials, reset redux user state
    builder.addMatcher(
      authApiSlice.endpoints.getUser.matchRejected,
      (state, action) => {
        const errorStatus = action.payload?.status;
        if (errorStatus === 401) {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.isInitialized = true;
      }
    );
  },
});

export const { setCredentials, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;

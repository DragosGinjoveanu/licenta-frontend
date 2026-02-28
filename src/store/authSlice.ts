import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // every `getUser` will login the user to Redux store.
    builder.addMatcher(
      apiSlice.endpoints.getUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      }
    );
    // if `getUser` is expired, we auto-clean Redux state.
    builder.addMatcher(apiSlice.endpoints.getUser.matchRejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

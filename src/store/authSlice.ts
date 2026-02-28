import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApiSlice } from "./api/authApiSlice";

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
      authApiSlice.endpoints.getUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      }
    );
    // if `getUser` is expired, we auto-clean Redux state.
    builder.addMatcher(
      authApiSlice.endpoints.getUser.matchRejected,
      (state) => {
        state.user = null;
        state.isAuthenticated = false;
      }
    );
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

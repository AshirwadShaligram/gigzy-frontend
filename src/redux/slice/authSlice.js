import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "@/axios/axiosInstance";

// Async thunks for authentication
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return {};
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      const message =
        error.response?.data?.error || error.message || "Logout failed";
      return rejectWithValue(message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();

      // Update tokens in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      // Clear localStorage on refresh failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      const message =
        error.response?.data?.error || error.message || "Token refresh failed";
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getUser();
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || "Failed to get user";
      return rejectWithValue(message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const response = await authAPI.updateUser(userData);
      const updatedUser =
        response.data.updatedUserInfo || response.data.user || response.data;

      if (updatedUser && typeof updatedUser === "object" && updatedUser.id) {
        const currentState = getState();
        const currentToken = currentState.auth.accessToken;

        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
        }

        return {
          user: updatedUser,
          accessToken: response.data.accessToken || currentToken,
        };
      } else {
        throw new Error("Invalid user data received from server");
      }
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || "Update failed";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreAuthState: (state) => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          state.accessToken = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        } catch (error) {
          // Handle JSON parse error
          console.error("Failed to parse user data from localStorage:", error);
          state.accessToken = null;
          state.user = null;
          state.isAuthenticated = false;
          // Clear invalid data from localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      } else {
        // Clear state if either token or user is missing
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    },

    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // Get current user cases
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // Update user profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { restoreAuthState, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;

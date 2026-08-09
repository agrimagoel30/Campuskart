import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// The auth state will now simply hold the MongoDB user object after synchronization.
const initialState = {
  user: null, // The MongoDB User profile
  isError: false,
  isSuccess: false,
  isLoading: false,
  isProfileLoading: false,
  message: '',
};

// Sync Clerk user with backend to get MongoDB profile
export const syncClerkUser = createAsyncThunk('auth/syncClerkUser', async ({ email, firstName, lastName, getToken }, thunkAPI) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("Clerk token is null or undefined! The session may not be ready.");
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // We still use api.post to benefit from baseURL, but we explicitly provide the token
    const response = await api.post('/auth/sync', { email, firstName, lastName }, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Fetch full user profile & stats
export const getMe = createAsyncThunk('auth/getMe', async (getToken, thunkAPI) => {
  try {
    const token = await getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get('/users/me', config);
    return response.data.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update Profile (with potential file upload)
export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ formData, getToken }, thunkAPI) => {
  try {
    const token = await getToken();
    // FormData requires multipart/form-data
    const config = { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      } 
    };
    const response = await api.patch('/users/me', formData, config);
    return response.data.data.user;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Toggle Wishlist
export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async ({ productId, isWishlisted, getToken }, thunkAPI) => {
  try {
    const token = await getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    let response;
    if (isWishlisted) {
      response = await api.delete(`/users/wishlist/${productId}`, config);
    } else {
      response = await api.post(`/users/wishlist/${productId}`, {}, config);
    }
    
    return response.data.data.user;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearUser: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncClerkUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncClerkUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(syncClerkUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // getMe
      .addCase(getMe.pending, (state) => {
        state.isProfileLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.stats = action.payload.stats;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.isProfileLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // toggleWishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.user = action.payload; // backend returns populated user
      });
  },
});

export const { reset, clearUser } = authSlice.actions;
export default authSlice.reducer;

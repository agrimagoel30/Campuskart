import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

const initialState = {
  products: [],
  singleProduct: null,
  isError: false,
  isSuccess: false,
  isCreateSuccess: false,
  isUpdateSuccess: false,
  isDeleteSuccess: false,
  isLoading: false,
  message: '',
};

// Fetch products thunk
export const getProducts = createAsyncThunk('products/getAll', async (queryString, thunkAPI) => {
  try {
    return await productService.getProducts(queryString);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Fetch single product thunk
export const getProductDetails = createAsyncThunk('products/getSingle', async (id, thunkAPI) => {
  try {
    return await productService.getProduct(id);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Create product thunk
export const createProduct = createAsyncThunk('products/create', async (productData, thunkAPI) => {
  try {
    return await productService.createProduct(productData);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update product thunk
export const updateProduct = createAsyncThunk('products/update', async (productData, thunkAPI) => {
  try {
    return await productService.updateProduct(productData.id, productData.formData);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete product thunk
export const deleteProduct = createAsyncThunk('products/delete', async (id, thunkAPI) => {
  try {
    await productService.deleteProduct(id);
    return id;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Mark product as sold thunk
export const markProductAsSold = createAsyncThunk('products/markSold', async (id, thunkAPI) => {
  try {
    return await productService.markProductAsSold(id);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isCreateSuccess = true;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.singleProduct = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUpdateSuccess = true;
        state.singleProduct = action.payload;
        // Also update in the products list if it exists
        const index = state.products.findIndex(p => p._id === action.payload._id || p.id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isDeleteSuccess = true;
        state.singleProduct = null;
        state.products = state.products.filter(p => p._id !== action.payload && p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markProductAsSold.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markProductAsSold.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUpdateSuccess = true;
        state.singleProduct = action.payload;
        // Update in products list
        const index = state.products.findIndex(p => p._id === action.payload._id || p.id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(markProductAsSold.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;

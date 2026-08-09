import api from '../api/axiosConfig';

// Fetch all products (supports query strings for filtering/sorting)
const getProducts = async (queryString = '') => {
  const response = await api.get(`/products${queryString}`);
  return response.data.data.products;
};

// Create a new product (uses FormData for images)
const createProduct = async (productData) => {
  const response = await api.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.product;
};

const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data.product;
};

const updateProduct = async (id, productData) => {
  const response = await api.patch(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.product;
};

const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

const markProductAsSold = async (id) => {
  const response = await api.patch(`/products/${id}/sold`);
  return response.data.data.product;
};

const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  markProductAsSold,
};

export default productService;

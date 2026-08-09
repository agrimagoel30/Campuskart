import api from '../api/axiosConfig';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  
  // If login is successful, store the token and user in localStorage
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Logout user
const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error', err);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};

// Verify Email
const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  verifyEmail,
};

export default authService;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let getTokenFn = null;

export const setGetToken = (fn) => {
  getTokenFn = fn;
};

// Request interceptor to attach Clerk JWT token to every request automatically
api.interceptors.request.use(
  async (config) => {
    if (getTokenFn) {
      try {
        const token = await getTokenFn();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We removed the response interceptor that was causing the redirect loop!
// Clerk now handles token refreshing automatically via getToken().

export default api;

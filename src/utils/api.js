import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to check token expiry
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sr_token');
    const expiry = localStorage.getItem('sr_expiry');
    const now = new Date().getTime();

    if (token && expiry) {
      if (now < parseInt(expiry)) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('sr_token');
        localStorage.removeItem('sr_user');
        localStorage.removeItem('sr_expiry');
        delete config.headers['Authorization'];
        console.warn('Token expired. You have been logged out.');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
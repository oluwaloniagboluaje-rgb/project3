import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
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
        // Token expired
        localStorage.removeItem('sr_token');
        localStorage.removeItem('sr_user');
        localStorage.removeItem('sr_expiry');
        delete config.headers['Authorization'];
        console.warn('Token expired. You have been logged out.');
        // Optionally you can redirect the user here
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
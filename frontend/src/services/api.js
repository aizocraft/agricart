// src/services/api.js
import axios from "axios";

// Set up the Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Request Interceptor - Adds token to headers if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handles 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 🔹 Authentication API
export const login = (credentials) => API.post("/auth/login", credentials);
export const register = (userData) => API.post("/auth/register", userData);
export const getMe = () => API.get("/auth/me");

// 🔹 Products API
export const fetchProducts = (params = {}) => API.get("/products", { params });
export const fetchProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post("/products", productData);
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getFarmerProducts = () => API.get("/products/farmer");

// 🔹 Orders API
export const createOrder = (orderData) => API.post("/orders", orderData);
// src/services/api.js
export const getMyOrders = async () => {
  try {
    const response = await fetch("/api/orders");
    const data = await response.json();
    return data;
  } catch {
    throw new Error("Failed to fetch orders");
  }
};

export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderToPaid = (id, paymentData) => API.put(`/orders/${id}/pay`, paymentData);
export const updateOrderToDelivered = (id) => API.put(`/orders/${id}/deliver`);

// 🔹 Admin API
export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");
export const updateUserRole = (id, roleData) => API.put(`/admin/users/${id}`, roleData);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Farmer Product API
export const createFarmerProduct = (productData) => API.post("/farmer/products", productData);
export const updateFarmerProduct = (id, productData) => API.put(`/farmer/products/${id}`, productData);
export const getFarmerProductById = (id) => API.get(`/farmer/products/${id}`);

export default API;

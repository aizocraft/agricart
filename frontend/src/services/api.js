// src/services/api.js
import axios from "axios";
import { toast } from "react-hot-toast";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
API.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === "get" && response.data) {
      const url = response.config.url;
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(`cache_${url}`, JSON.stringify(cacheData));
    }
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please try again.");
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          toast.error("You don't have permission for this action");
          break;
        case 404:
          toast.error("Resource not found");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(
            error.response.data?.message || "An error occurred"
          );
      }
    }
    return Promise.reject(error);
  }
);

// Helper function for cached GET requests
const cachedGet = async (url, params = {}) => {
  const cacheKey = `cache_${url}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    // Use cache if less than 5 minutes old
    if (Date.now() - timestamp < 300000) {
      return { data };
    }
  }
  
  return API.get(url, { params });
};

// Authentication API
export const login = (credentials) => API.post("/auth/login", credentials);
export const register = (userData) => API.post("/auth/register", userData);
export const getMe = () => cachedGet("/auth/me");

// Products API
export const fetchProducts = (params = {}) => cachedGet("/products", params);
export const fetchProductById = (id) => cachedGet(`/products/${id}`);
export const createProduct = (productData) => {
  const formData = new FormData();
  Object.entries(productData).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => formData.append("images", file));
    } else {
      formData.append(key, value);
    }
  });
  return API.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getProductsByCategory = (category) => cachedGet(`/products/category/${category}`);
export const getFarmerProducts = (farmerId) => cachedGet(`/products/farmer/${farmerId}`);

// Orders API
export const createOrder = (orderData) => API.post("/orders", orderData);
export const getMyOrders = () => cachedGet("/orders/myorders");
export const getOrderById = (id) => cachedGet(`/orders/${id}`);
export const updateOrderToPaid = (id, paymentData) => API.put(`/orders/${id}/pay`, paymentData);
export const updateOrderToDelivered = (id) => API.put(`/orders/${id}/deliver`);

// Admin API
export const getAdminStats = () => cachedGet("/admin/stats");
export const getAdminUsers = () => cachedGet("/admin/users");
export const updateUserRole = (id, roleData) => API.put(`/admin/users/${id}`, roleData);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Payment API
export const processPayPalPayment = (id, paymentData) => API.post(`/payment/paypal/${id}`, paymentData);
export const processMpesaPayment = (id, paymentData) => API.post(`/payment/mpesa/${id}`, paymentData);
export const refreshToken = () => API.post('/auth/refresh');


export const createReview = (productId, reviewData) => 
  API.post(`/products/${productId}/reviews`, reviewData);

export const createFarmerProduct = (productData) => {
  const formData = new FormData();
  Object.entries(productData).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => formData.append("images", file));
    } else {
      formData.append(key, value);
    }
  });
  return API.post("/farmer/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateFarmerProduct = (id, productData) => {
  const formData = new FormData();
  Object.entries(productData).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => formData.append("images", file));
    } else {
      formData.append(key, value);
    }
  });
  return API.put(`/farmer/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getFarmerProductById = (id) => API.get(`/farmer/products/${id}`);
export default API;
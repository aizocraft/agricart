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
    if (response.config.method === "get" && response.data) {
      const url = response.config.url;
      const cacheKey = `cache_${url}`;
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
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
          toast.error(error.response.data?.message || "Server error. Please try again later.");
          break;
        default:
          toast.error(error.response.data?.message || "An error occurred");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

// Enhanced cached GET requests helper
const cachedGet = async (url, params = {}) => {
  const cacheKey = `cache_${url}?${new URLSearchParams(params).toString()}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    // Cache valid for 5 minutes (300000 ms)
    if (Date.now() - timestamp < 300000) {
      return { data };
    }
  }
  
  const response = await API.get(url, { params });
  return response;
};

// Authentication API
export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (userData) => API.post("/auth/register", userData),
  getMe: () => cachedGet("/auth/me"),
  refreshToken: () => API.post('/auth/refresh'),
  logout: () => API.post('/auth/logout'),
};

// Products API
export const productAPI = {
  // Get products with filters, pagination, and sorting
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Handle all possible query parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.organic) queryParams.append('organic', params.organic);
    
    return cachedGet(`/products?${queryParams.toString()}`);
  },

  // Get single product by ID
  getProductById: (id) => cachedGet(`/products/${id}`),

  // Create new product with image uploads
  createProduct: (productData) => {
    const formData = new FormData();
    
    // Append all product fields
    Object.entries(productData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (key === 'images') {
        // Handle both File objects and existing image URLs
        productData.images.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file);
          } else if (typeof file === 'string') {
            formData.append('existingImages', file);
          }
        });
      } else if (key === 'harvestDate' && value) {
        formData.append(key, new Date(value).toISOString());
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return API.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update product
  updateProduct: (id, productData) => {
    const formData = new FormData();
    
    Object.entries(productData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (key === 'images') {
        productData.images.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file);
          } else if (typeof file === 'string') {
            formData.append('existingImages', file);
          }
        });
      } else if (key === 'harvestDate' && value) {
        formData.append(key, new Date(value).toISOString());
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return API.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete product
  deleteProduct: (id) => API.delete(`/products/${id}`),

  // Get products by category
  getProductsByCategory: (category) => cachedGet(`/products/category/${category}`),

  // Get products by farmer
  getFarmerProducts: (farmerId) => cachedGet(`/products/farmer/${farmerId}`),
};

export const orderAPI = {
  createOrder: (orderData) => API.post("/orders", orderData),
  getMyOrders: () => cachedGet("/orders/myorders"),
  getFarmerOrders: () => cachedGet("/orders/farmer/myorders"),
  getAllOrders: () => cachedGet("/orders"),
  getOrderById: (id) => cachedGet(`/orders/${id}`),
  updateOrderToPaid: (id, paymentResult) => 
    API.put(`/orders/${id}/pay`, paymentResult),
  updateOrderToDelivered: (id) => 
    API.put(`/orders/${id}/deliver`),
  cancelOrder: (id, cancellationData = {}) => 
    API.put(`/orders/${id}/cancel`, cancellationData),

  // Real-time updates (for Socket.io)
  listenForOrderUpdates: (callback) => {
    socket.on("newOrder", callback);
    return () => socket.off("newOrder", callback);
  },
  listenForOrderCancellations: (callback) => {
    socket.on("orderCancelled", callback);
    return () => socket.off("orderCancelled", callback);
  },
};
// Admin API
export const adminAPI = {
  getStats: () => cachedGet("/admin/stats"),
  getUsers: () => cachedGet("/admin/users"),
  updateUserRole: (id, roleData) => API.put(`/admin/users/${id}`, roleData),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

// Payment API
export const paymentAPI = {
  paypal: {
    createPayment: (id, paymentData) => API.post(`/payment/paypal/${id}`, paymentData),
  },
  mpesa: {
    createPayment: (id, paymentData) => API.post(`/payment/mpesa/${id}`, paymentData),
  },
};

export default API;
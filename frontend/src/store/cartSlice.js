import { createSlice } from '@reduxjs/toolkit';

// Safe localStorage handler
const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  },
  remove: (...keys) => {
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
      }
    });
  }
};

const initialState = {
  cartItems: storage.get('cartItems', []),
  shippingAddress: storage.get('shippingAddress', null),
  paymentMethod: storage.get('paymentMethod', ''),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, { payload }) => {
      const existingItem = state.cartItems.find(item => item.product === payload.product);
      
      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + payload.quantity,
          existingItem.stock
        );
      } else {
        state.cartItems.push(payload);
      }
      storage.set('cartItems', state.cartItems);
    },
    removeFromCart: (state, { payload }) => {
      state.cartItems = state.cartItems.filter(item => item.product !== payload);
      storage.set('cartItems', state.cartItems);
    },
    updateQuantity: (state, { payload: { productId, quantity } }) => {
      const item = state.cartItems.find(item => item.product === productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
        storage.set('cartItems', state.cartItems);
      }
    },
    saveShippingAddress: (state, { payload }) => {
      state.shippingAddress = payload;
      storage.set('shippingAddress', payload);
    },
    savePaymentMethod: (state, { payload }) => {
      state.paymentMethod = payload;
      storage.set('paymentMethod', payload);
    },
    clearCart: (state) => {
      state.cartItems = [];
      storage.remove('cartItems');
    },
    resetCart: (state) => {
      state.cartItems = [];
      state.shippingAddress = null;
      state.paymentMethod = '';
      storage.remove('cartItems', 'shippingAddress', 'paymentMethod');
    }
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => 
  state.cart.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectCartItemsCount = (state) => 
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  resetCart
} = cartSlice.actions;

export default cartSlice.reducer;/*  */
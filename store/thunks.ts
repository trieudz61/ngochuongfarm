// Redux Thunks - Async actions để gọi API

import { createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI, newsAPI, ordersAPI, couponsAPI, authAPI, reviewsAPI } from '../utils/api';
import { Product, NewsArticle, Order, Coupon, User, Review } from '../types';

// Products Thunks
export const fetchProducts = createAsyncThunk(
  'app/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productsAPI.getAll();
      return products;
    } catch (error: any) {
      // Nếu backend offline, không reject mà để extraReducer xử lý fallback
      if (error.message === 'BACKEND_OFFLINE') {
        throw error; // Re-throw để extraReducer catch và fallback
      }
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'app/createProduct',
  async (product: Product, { rejectWithValue }) => {
    try {
      const newProduct = await productsAPI.create(product);
      return newProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'app/updateProduct',
  async ({ id, product }: { id: string; product: Product }, { rejectWithValue }) => {
    try {
      const updated = await productsAPI.update(id, product);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'app/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productsAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

// News Thunks
export const fetchNews = createAsyncThunk(
  'app/fetchNews',
  async (_, { rejectWithValue }) => {
    try {
      const news = await newsAPI.getAll();
      return news;
    } catch (error: any) {
      if (error.message === 'BACKEND_OFFLINE') {
        throw error;
      }
      return rejectWithValue(error.message || 'Failed to fetch news');
    }
  }
);

export const createNews = createAsyncThunk(
  'app/createNews',
  async (article: NewsArticle, { rejectWithValue }) => {
    try {
      const newArticle = await newsAPI.create(article);
      return newArticle;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create news');
    }
  }
);

export const updateNewsArticle = createAsyncThunk(
  'app/updateNews',
  async ({ id, article }: { id: string; article: NewsArticle }, { rejectWithValue }) => {
    try {
      const updated = await newsAPI.update(id, article);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update news');
    }
  }
);

export const deleteNews = createAsyncThunk(
  'app/deleteNews',
  async (id: string, { rejectWithValue }) => {
    try {
      await newsAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete news');
    }
  }
);

// Orders Thunks
export const fetchOrders = createAsyncThunk(
  'app/fetchOrders',
  async (cookieId?: string | null, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const isAdmin = state?.app?.isAdmin === true || state?.app?.user?.role === 'admin' || state?.app?.user?.email === 'admin';
      
      // Nếu cookieId === null (được truyền rõ ràng), fetch ALL orders (dùng cho admin)
      if (cookieId === null) {
        console.log('[fetchOrders] Fetching all orders (explicit null - admin requested)');
        const allOrders = await ordersAPI.getAll();
        console.log(`[fetchOrders] Fetched ${allOrders.length} orders for admin`);
        return allOrders;
      }
      
      // Admin luôn fetch tất cả orders
      if (isAdmin) {
        console.log('[fetchOrders] Fetching all orders (admin mode)');
        const allOrders = await ordersAPI.getAll();
        console.log(`[fetchOrders] Fetched ${allOrders.length} orders for admin`);
        return allOrders;
      }
      
      // User: Nếu có cookieId, fetch theo cookieId
      let targetCookieId = cookieId;
      if (!targetCookieId) {
        targetCookieId = state?.app?.cookieId || localStorage.getItem('customerCookieId');
      }
      
      if (targetCookieId) {
        console.log(`[fetchOrders] Fetching orders for cookieId: ${targetCookieId}`);
        try {
          const orders = await ordersAPI.getByCookieId(targetCookieId);
          console.log(`[fetchOrders] Fetched ${orders.length} orders from API for cookieId: ${targetCookieId}`);
          return orders;
        } catch (cookieError: any) {
          // Nếu endpoint không tồn tại hoặc lỗi, fallback về getAll và filter ở frontend
          if (cookieError.message?.includes('404') || cookieError.message?.includes('Not Found')) {
            console.warn('[fetchOrders] CookieId endpoint not found, fetching all and filtering in frontend');
            const allOrders = await ordersAPI.getAll();
            return allOrders;
          }
          throw cookieError;
        }
      } else {
        // Không có cookieId, fetch tất cả (sẽ được filter ở frontend)
        console.log('[fetchOrders] No cookieId, fetching all orders');
        const allOrders = await ordersAPI.getAll();
        return allOrders;
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'app/createOrder',
  async (order: Order, { rejectWithValue }) => {
    try {
      const newOrder = await ordersAPI.create(order);
      return newOrder;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'app/updateOrderStatus',
  async ({ id, status }: { id: string; status: Order['status'] }, { rejectWithValue }) => {
    try {
      const updated = await ordersAPI.update(id, status);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'app/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await ordersAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete order');
    }
  }
);

// Coupons Thunks
export const fetchCoupons = createAsyncThunk(
  'app/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const coupons = await couponsAPI.getAll();
      return coupons;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch coupons');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'app/createCoupon',
  async (coupon: Coupon, { rejectWithValue }) => {
    try {
      const newCoupon = await couponsAPI.create(coupon);
      return newCoupon;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'app/updateCoupon',
  async ({ id, coupon }: { id: string; coupon: Coupon }, { rejectWithValue }) => {
    try {
      const updated = await couponsAPI.update(id, coupon);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'app/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      await couponsAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete coupon');
    }
  }
);

// Auth Thunks
export const loginUser = createAsyncThunk(
  'app/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await authAPI.login(email, password);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Reviews Thunks
export const addReview = createAsyncThunk(
  'app/addReview',
  async ({ productId, review }: { productId: string; review: Review }, { rejectWithValue }) => {
    try {
      const newReview = await reviewsAPI.add(productId, review);
      return { productId, review: newReview };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add review');
    }
  }
);


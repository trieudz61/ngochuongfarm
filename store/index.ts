
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, CartItem, User, Order, NewsArticle, Coupon, CustomerInfo, PaymentMethod, Review } from '../types';
import { MOCK_PRODUCTS } from '../utils/mockData';
import { migrateProductsImages, migrateNewsImages } from '../utils/migrateImages';
import * as thunks from './thunks';

import { savePersistentData, loadPersistentData, removePersistentData } from '../utils/storage';
import { saveUserOrders, filterOrdersByCookie, deleteOrderFromAllStorage } from '../utils/userOrders';
import { getCookieId } from '../utils/cookieManager';

const saveState = (key: string, state: any) => {
  // Sử dụng persistent storage cho orders và cart (dữ liệu quan trọng)
  if (key === 'orders' || key === 'cart') {
    savePersistentData(key, state);
  } else {
    // Các dữ liệu khác vẫn dùng cách cũ để backward compatible
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);
    } catch (err) {
      console.error("Could not save state", err);
    }
  }
};

const loadState = (key: string) => {
  // Sử dụng persistent storage cho orders và cart
  if (key === 'orders' || key === 'cart') {
    return loadPersistentData(key);
  } else {
    // Các dữ liệu khác vẫn dùng cách cũ
    try {
      const serializedState = localStorage.getItem(key);
      if (serializedState === null) return undefined;
      return JSON.parse(serializedState);
    } catch (err) {
      return undefined;
    }
  }
};

// Async load với migration
const loadStateWithMigration = async (key: string): Promise<any> => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) return undefined;
    const data = JSON.parse(serializedState);
    
    // Migrate nếu là products hoặc news
    if (key === 'products' && Array.isArray(data)) {
      const migrated = await migrateProductsImages(data);
      // Lưu lại sau khi migrate
      saveState(key, migrated);
      return migrated;
    }
    
    if (key === 'news' && Array.isArray(data)) {
      const migrated = await migrateNewsImages(data);
      saveState(key, migrated);
      return migrated;
    }
    
    return data;
  } catch (err) {
    return undefined;
  }
};

const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Cách phân biệt Cam Vinh chuẩn vùng đất Hạnh Lâm',
    summary: 'Cam Vinh chuẩn thường có vò mỏng, mọng nước và hương thơm rất thanh đặc trưng không lẫn đi đâu được.',
    content: 'Tại vùng đất Hạnh Lâm, Thanh Chương, cam được trồng trên đất đỏ bazan giàu dinh dưỡng...',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=80',
    category: 'Kỹ thuật',
    author: 'Admin Ngọc Hường',
    createdAt: new Date().toISOString()
  }
];

const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', code: 'CHAOMUNG', discountType: 'percent', discountValue: 10, minOrderValue: 0, expiryDate: '2025-12-31', isActive: true },
  { id: 'c2', code: 'NGOC HUONG', discountType: 'fixed', discountValue: 50000, minOrderValue: 300000, expiryDate: '2025-12-31', isActive: true }
];

interface AppState {
  products: Product[];
  news: NewsArticle[];
  coupons: Coupon[];
  cart: CartItem[];
  orders: Order[];
  user: User | null;
  isAdmin: boolean;
  loading: {
    products: boolean;
    news: boolean;
    orders: boolean;
    coupons: boolean;
  };
  error: string | null;
}

// Load state đồng bộ ban đầu - dùng localStorage làm cache/fallback
const initialState: AppState = {
  products: [],
  news: [],
  coupons: [],
  cart: loadState('cart') || [], // Load cart từ localStorage
  orders: loadState('orders') || [], // Load orders từ localStorage để giữ lịch sử
  user: loadState('user') || null,
  isAdmin: loadState('isAdmin') || false,
  loading: {
    products: false,
    news: false,
    orders: false,
    coupons: false,
  },
  error: null,
};


const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Local actions (giữ lại cho cart, user session)
    addToCart: (state, action: PayloadAction<{ product: Product, quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existing = state.cart.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.cart.push({ ...product, quantity });
      }
      // Tự động lưu cart vào localStorage
      saveState('cart', state.cart);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.id !== action.payload);
      // Tự động lưu cart vào localStorage
      saveState('cart', state.cart);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string, quantity: number }>) => {
      const item = state.cart.find(i => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      // Tự động lưu cart vào localStorage
      saveState('cart', state.cart);
    },
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAdmin = action.payload.role === 'admin';
      saveState('user', state.user);
      saveState('isAdmin', state.isAdmin);
    },
    logout: (state) => {
      state.user = null;
      state.isAdmin = false;
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
    },
    clearCart: (state) => {
      state.cart = [];
      // Xóa cart khỏi localStorage khi clear (cả backup)
      removePersistentData('cart');
    },
  },
  extraReducers: (builder) => {
    // Products
    builder
      .addCase(thunks.fetchProducts.pending, (state) => {
        state.loading.products = true;
        state.error = null;
      })
      .addCase(thunks.fetchProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        state.products = action.payload;
      })
      .addCase(thunks.fetchProducts.rejected, (state, action) => {
        state.loading.products = false;
        const error = action.payload as string;
        state.error = error;
        // Fallback to localStorage nếu API fail (đặc biệt khi backend offline)
        if (error === 'BACKEND_OFFLINE' || !state.products || state.products.length === 0) {
          const cachedProducts = loadState('products') || MOCK_PRODUCTS;
          if (cachedProducts.length > 0) {
            state.products = cachedProducts;
            console.log('[Store] Sử dụng cached products từ localStorage');
          }
        }
      })
      .addCase(thunks.createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(thunks.updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(thunks.deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      });

    // News
    builder
      .addCase(thunks.fetchNews.pending, (state) => {
        state.loading.news = true;
      })
      .addCase(thunks.fetchNews.fulfilled, (state, action) => {
        state.loading.news = false;
        state.news = action.payload;
      })
      .addCase(thunks.fetchNews.rejected, (state, action) => {
        state.loading.news = false;
        const error = action.payload as string;
        if (error === 'BACKEND_OFFLINE' || !state.news || state.news.length === 0) {
          const cachedNews = loadState('news') || MOCK_NEWS;
          if (cachedNews.length > 0) {
            state.news = cachedNews;
            console.log('[Store] Sử dụng cached news từ localStorage');
          }
        }
      })
      .addCase(thunks.createNews.fulfilled, (state, action) => {
        state.news.push(action.payload);
      })
      .addCase(thunks.updateNewsArticle.fulfilled, (state, action) => {
        const index = state.news.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
      })
      .addCase(thunks.deleteNews.fulfilled, (state, action) => {
        state.news = state.news.filter(n => n.id !== action.payload);
      });

    // Orders
    builder
      .addCase(thunks.fetchOrders.pending, (state) => {
        state.loading.orders = true;
      })
      .addCase(thunks.fetchOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload;
        // Lưu orders vào localStorage để giữ lịch sử lâu dài
        saveState('orders', state.orders);
        
        // QUAN TRỌNG: Sync localStorage theo cookieId với API response
        // Điều này đảm bảo rằng nếu admin xóa đơn, user sẽ không còn thấy nó
        const cookieId = getCookieId();
        if (cookieId) {
          // Filter orders của user này từ API response
          const userOrdersFromAPI = filterOrdersByCookie(action.payload, cookieId, state.user);
          // Ghi đè localStorage với orders từ API (source of truth)
          saveUserOrders(userOrdersFromAPI, cookieId, state.user);
          console.log(`[Store] Synced ${userOrdersFromAPI.length} orders to localStorage for cookieId: ${cookieId}`);
        }
      })
      .addCase(thunks.fetchOrders.rejected, (state, action) => {
        state.loading.orders = false;
        const error = action.payload as string;
        if (error === 'BACKEND_OFFLINE') {
          const cachedOrders = loadState('orders') || [];
          if (cachedOrders.length > 0) {
            state.orders = cachedOrders;
            console.log('[Store] Sử dụng cached orders từ localStorage');
          }
        }
      })
      .addCase(thunks.createOrder.fulfilled, (state, action) => {
        // Thêm order mới vào đầu danh sách
        state.orders.unshift(action.payload);
        state.cart = [];
        // Lưu orders và xóa cart trong localStorage
        saveState('orders', state.orders);
        
        // Lưu order vào localStorage theo cookieId
        const cookieId = getCookieId();
        // Lấy tất cả orders của cookieId này (bao gồm order mới)
        const userOrders = filterOrdersByCookie(state.orders, cookieId, state.user);
        // Đảm bảo order mới được thêm vào (nếu filter không match)
        const newOrder = action.payload;
        const hasOrder = userOrders.find((o: Order) => o.id === newOrder.id);
        if (!hasOrder) {
          userOrders.unshift(newOrder);
        }
        saveUserOrders(userOrders, cookieId, state.user);
        console.log(`[Store] Đã lưu ${userOrders.length} orders cho cookieId ${cookieId}`);
        
        localStorage.removeItem('cart');
        console.log('[Store] Đã lưu order mới và xóa cart');
      })
      .addCase(thunks.createOrder.rejected, (state, action) => {
        // Nếu createOrder thất bại (backend offline), vẫn lưu vào localStorage
        // Lưu ý: Order đã được lưu trong Cart component nếu backend offline
        // Nên không cần xử lý ở đây
      })
      .addCase(thunks.updateOrderStatus.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload.id);
        if (order) {
          order.status = action.payload.status;
          // Lưu lại orders sau khi update để đồng bộ với localStorage
          saveState('orders', state.orders);
          
          // Cập nhật trong localStorage theo cookieId
          const cookieId = getCookieId();
          const userOrders = filterOrdersByCookie(state.orders, cookieId, state.user);
          saveUserOrders(userOrders, cookieId, state.user);
          
          console.log(`[Store] Đã cập nhật trạng thái đơn hàng ${action.payload.id} thành ${action.payload.status}`);
        }
      })
      .addCase(thunks.deleteOrder.fulfilled, (state, action) => {
        // Tìm order trước khi xóa để lấy thông tin cookieId và email
        const orderToDelete = state.orders.find(o => o.id === action.payload);
        
        // Xóa order khỏi state (doanh thu tự động giảm vì Dashboard tính từ state.app.orders)
        state.orders = state.orders.filter(o => o.id !== action.payload);
        
        // Xóa order khỏi TẤT CẢ localStorage keys (orders chung, orders theo cookieId, orders theo email)
        if (orderToDelete) {
          deleteOrderFromAllStorage(action.payload, orderToDelete);
        } else {
          // Fallback: nếu không tìm thấy order trong state, vẫn cố xóa theo orderId
          deleteOrderFromAllStorage(action.payload);
        }
        
        // Cập nhật localStorage orders chung
        saveState('orders', state.orders);
        
        // Cập nhật orders theo cookieId hiện tại trong localStorage (để đồng bộ)
        const cookieId = getCookieId();
        const userOrders = filterOrdersByCookie(state.orders, cookieId, state.user);
        saveUserOrders(userOrders, cookieId, state.user);
        
        console.log(`[Store] Đã xóa đơn hàng ${action.payload} khỏi tất cả storage locations`);
      })
      .addCase(thunks.deleteOrder.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Coupons
    builder
      .addCase(thunks.fetchCoupons.pending, (state) => {
        state.loading.coupons = true;
      })
      .addCase(thunks.fetchCoupons.fulfilled, (state, action) => {
        state.loading.coupons = false;
        state.coupons = action.payload;
      })
      .addCase(thunks.fetchCoupons.rejected, (state, action) => {
        state.loading.coupons = false;
        const error = action.payload as string;
        if (error === 'BACKEND_OFFLINE' || !state.coupons || state.coupons.length === 0) {
          const cachedCoupons = loadState('coupons') || MOCK_COUPONS;
          if (cachedCoupons.length > 0) {
            state.coupons = cachedCoupons;
            console.log('[Store] Sử dụng cached coupons từ localStorage');
          }
        }
      })
      .addCase(thunks.createCoupon.fulfilled, (state, action) => {
        state.coupons.push(action.payload);
      })
      .addCase(thunks.updateCoupon.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(thunks.deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c.id !== action.payload);
      });

    // Reviews
    builder
      .addCase(thunks.addReview.fulfilled, (state, action) => {
        const product = state.products.find(p => p.id === action.payload.productId);
        if (product) {
          if (!product.reviews) product.reviews = [];
          product.reviews.unshift(action.payload.review);
          const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
          product.averageRating = totalRating / product.reviews.length;
        }
      });
  }
});

export const { 
  addToCart, removeFromCart, updateQuantity,
  login, logout, clearCart
} = appSlice.actions;

// Export thunks và API
export {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchNews, createNews, updateNewsArticle, deleteNews,
  fetchOrders, createOrder, updateOrderStatus, deleteOrder,
  fetchCoupons, createCoupon, updateCoupon, deleteCoupon,
  addReview
} from './thunks';

export { productsAPI, newsAPI } from '../utils/api';

export const store = configureStore({
  reducer: { app: appSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['app/createOrder/fulfilled'],
      },
    }),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// API Service Layer - Kết nối với backend database
import { BACKEND_URL } from '../config.js';

// API URL - luôn dùng localhost
const API_BASE_URL = 'http://localhost:3001/api';

console.log('🔗 API Base URL:', API_BASE_URL);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function để gọi API với retry và better error handling
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data.data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Kiểm tra nếu là network error (backend không chạy) hoặc timeout
    if (error.name === 'AbortError' || 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError') {
      console.warn(`[API] Backend không khả dụng tại ${API_BASE_URL}. Endpoint: ${endpoint}`);
      const backendOfflineError = new Error('BACKEND_OFFLINE');
      (backendOfflineError as any).isBackendOffline = true;
      throw backendOfflineError;
    }
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
};

// Products API
export const productsAPI = {
  getAll: (): Promise<any[]> => apiCall('/products'),
  getById: (id: string): Promise<any> => apiCall(`/products/${id}`),
  create: (product: any): Promise<any> => 
    apiCall('/products', { method: 'POST', body: JSON.stringify(product) }),
  update: (id: string, product: any): Promise<any> => 
    apiCall(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  delete: (id: string): Promise<void> => 
    apiCall(`/products/${id}`, { method: 'DELETE' }),
  uploadImage: async (file: File): Promise<string> => {
    // Convert ảnh sang base64 để lưu trực tiếp vào database
    // Tránh vấn đề URL localhost khi deploy
    return new Promise((resolve, reject) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        reject(new Error('Vui lòng chọn file ảnh hợp lệ'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Kích thước file không được vượt quá 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Nén ảnh trước khi convert base64
          const canvas = document.createElement('canvas');
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          console.log(`[Upload] Image converted to base64: ${file.name} (${(base64.length / 1024).toFixed(2)}KB)`);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Không thể đọc file ảnh'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsDataURL(file);
    });
  },
};

// News API
export const newsAPI = {
  getAll: (): Promise<any[]> => apiCall('/news'),
  getById: (id: string): Promise<any> => apiCall(`/news/${id}`),
  create: (article: any): Promise<any> => 
    apiCall('/news', { method: 'POST', body: JSON.stringify(article) }),
  update: (id: string, article: any): Promise<any> => 
    apiCall(`/news/${id}`, { method: 'PUT', body: JSON.stringify(article) }),
  delete: (id: string): Promise<void> => 
    apiCall(`/news/${id}`, { method: 'DELETE' }),
  uploadImage: async (file: File): Promise<string> => {
    // Convert ảnh sang base64 để lưu trực tiếp vào database
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Vui lòng chọn file ảnh hợp lệ'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Kích thước file không được vượt quá 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          console.log(`[Upload] News image converted to base64: ${file.name}`);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Không thể đọc file ảnh'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsDataURL(file);
    });
  },
  uploadVideo: async (file: File): Promise<string> => {
    // Convert video sang base64 (lưu ý: video lớn sẽ tốn nhiều dung lượng DB)
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        reject(new Error('Vui lòng chọn file video hợp lệ'));
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        reject(new Error('Kích thước video không được vượt quá 20MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log(`[Upload] Video converted to base64: ${file.name} (${(base64.length / 1024 / 1024).toFixed(2)}MB)`);
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Không thể đọc file video'));
      reader.readAsDataURL(file);
    });
  },
};

// Orders API
export const ordersAPI = {
  getAll: (): Promise<any[]> => apiCall('/orders'),
  getById: (id: string): Promise<any> => apiCall(`/orders/${id}`),
  create: (order: any): Promise<any> => 
    apiCall('/orders', { method: 'POST', body: JSON.stringify(order) }),
  update: (id: string, status: string): Promise<any> => 
    apiCall(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string): Promise<void> => 
    apiCall(`/orders/${id}`, { method: 'DELETE' }),
  getByUser: (userId: string): Promise<any[]> => apiCall(`/orders/user/${userId}`),
  getByCookieId: (cookieId: string): Promise<any[]> => apiCall(`/orders/cookie/${cookieId}`),
  track: (orderId: string): Promise<any> => apiCall(`/orders/track/${orderId}`),
};

// Coupons API
export const couponsAPI = {
  getAll: (): Promise<any[]> => apiCall('/coupons'),
  getById: (id: string): Promise<any> => apiCall(`/coupons/${id}`),
  create: (coupon: any): Promise<any> => 
    apiCall('/coupons', { method: 'POST', body: JSON.stringify(coupon) }),
  update: (id: string, coupon: any): Promise<any> => 
    apiCall(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(coupon) }),
  delete: (id: string): Promise<void> => 
    apiCall(`/coupons/${id}`, { method: 'DELETE' }),
  validate: (code: string): Promise<any> => apiCall(`/coupons/validate/${code}`),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<any> => 
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData: any): Promise<any> => 
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: (): Promise<void> => apiCall('/auth/logout', { method: 'POST' }),
  getCurrentUser: (): Promise<any> => apiCall('/auth/me'),
};

// Admin Auth API
export const adminAuthAPI = {
  login: (username: string, password: string): Promise<any> => 
    apiCall('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  changePassword: (username: string, oldPassword: string, newPassword: string): Promise<any> => 
    apiCall('/admin/change-password', { method: 'POST', body: JSON.stringify({ username, oldPassword, newPassword }) }),
};

// Reviews API
export const reviewsAPI = {
  add: (productId: string, review: any): Promise<any> => 
    apiCall(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(review) }),
  getByProduct: (productId: string): Promise<any[]> => apiCall(`/products/${productId}/reviews`),
};


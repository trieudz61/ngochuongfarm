// API Service Layer - Kết nối với backend database
import { BACKEND_URL } from '../config.js';

// Detect environment và set API URL
const getApiBaseUrl = () => {
  // Nếu có VITE_API_URL trong env, dùng nó
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detect production environment
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0';
  
  if (isDevelopment) {
    return 'http://localhost:3001/api';
  } else {
    // Production: sử dụng URL từ config
    return `${BACKEND_URL}/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();

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
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Sử dụng cùng logic detect môi trường với API_BASE_URL global
      const uploadBaseUrl = API_BASE_URL.replace('/api', '');
      console.log(`[Upload] Uploading image: ${file.name} (${(file.size / 1024).toFixed(2)}KB) to ${uploadBaseUrl}/api/products/upload-image`);
      
      const response = await fetch(`${uploadBaseUrl}/api/products/upload-image`, {
        method: 'POST',
        body: formData,
        // KHÔNG set Content-Type header, browser sẽ tự động set với boundary
      });
      
      console.log(`[Upload] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // Trả về full URL hoặc relative URL
      const imageUrl = data.data?.url || data.url || data.imageUrl;
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      // Nếu là relative URL, convert thành full URL
      if (imageUrl.startsWith('/uploads/')) {
        const fullUrl = `${uploadBaseUrl}${imageUrl}`;
        console.log(`[Upload] Image uploaded successfully: ${fullUrl}`);
        return fullUrl;
      }
      
      console.log(`[Upload] Image uploaded successfully: ${imageUrl}`);
      return imageUrl;
    } catch (error: any) {
      console.error('Upload image error:', error);
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('BACKEND_OFFLINE');
      }
      throw error;
    }
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
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Sử dụng cùng logic detect môi trường với API_BASE_URL global
      const uploadBaseUrl = API_BASE_URL.replace('/api', '');
      const response = await fetch(`${uploadBaseUrl}/api/news/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      const imageUrl = data.data?.url || data.url || data.imageUrl;
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      if (imageUrl.startsWith('/uploads/')) {
        return `${uploadBaseUrl}${imageUrl}`;
      }
      
      return imageUrl;
    } catch (error: any) {
      console.error('Upload image error:', error);
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('BACKEND_OFFLINE');
      }
      throw error;
    }
  },
  uploadVideo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      // Sử dụng cùng logic detect môi trường với API_BASE_URL global
      const uploadBaseUrl = API_BASE_URL.replace('/api', '');
      const response = await fetch(`${uploadBaseUrl}/api/news/upload-video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      const videoUrl = data.data?.url || data.data?.videoUrl || data.url || data.videoUrl;
      if (!videoUrl) {
        throw new Error('No video URL returned from server');
      }
      
      if (videoUrl.startsWith('/uploads/')) {
        return `${uploadBaseUrl}${videoUrl}`;
      }
      
      return videoUrl;
    } catch (error: any) {
      console.error('Upload video error:', error);
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('BACKEND_OFFLINE');
      }
      throw error;
    }
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

// Reviews API
export const reviewsAPI = {
  add: (productId: string, review: any): Promise<any> => 
    apiCall(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(review) }),
  getByProduct: (productId: string): Promise<any[]> => apiCall(`/products/${productId}/reviews`),
};


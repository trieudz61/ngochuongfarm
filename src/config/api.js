// API Configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001'
  : 'https://your-backend-app.railway.app'; // SẼ CẬP NHẬT SAU KHI DEPLOY BACKEND

export const API_ENDPOINTS = {
  base: `${API_BASE_URL}/api`,
  products: `${API_BASE_URL}/api/products`,
  orders: `${API_BASE_URL}/api/orders`,
  news: `${API_BASE_URL}/api/news`,
  auth: `${API_BASE_URL}/api/auth`,
  upload: `${API_BASE_URL}/api/upload`,
  health: `${API_BASE_URL}/api/health`,
  uploads: `${API_BASE_URL}/uploads`
};

// Helper function để get API URL
export const getApiUrl = (endpoint = '') => {
  return endpoint ? `${API_BASE_URL}${endpoint}` : API_BASE_URL;
};

console.log('🔗 API Configuration:', {
  isDevelopment,
  API_BASE_URL,
  hostname: window.location.hostname
});
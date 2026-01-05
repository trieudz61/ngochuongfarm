// ============================================
// CẤU HÌNH TẬP TRUNG - CHỈ CẦN THAY ĐỔI Ở ĐÂY
// ============================================

// Detect environment at runtime
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  // Production: API is on same origin
  return '';
};

// URL Backend API
export const BACKEND_URL = getBackendUrl();

// API endpoint
export const API_URL = `${BACKEND_URL}/api`;

// Admin secret key
export const ADMIN_SECRET = 'ngochuongfarm2024';

// Export cho CommonJS (nếu cần)
export default {
  BACKEND_URL,
  API_URL,
  ADMIN_SECRET
};

// ============================================
// CẤU HÌNH TẬP TRUNG - CHỈ CẦN THAY ĐỔI Ở ĐÂY
// ============================================

// Auto-detect backend URL based on environment
const isProduction = typeof window !== 'undefined' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('127.0.0.1');

// URL Backend API
export const BACKEND_URL = isProduction 
  ? '' // Production: same origin (Render serves both frontend & backend)
  : 'http://localhost:3001'; // Development: local server

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

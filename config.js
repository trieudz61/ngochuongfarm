// ============================================
// CẤU HÌNH TẬP TRUNG - CHỈ CẦN THAY ĐỔI Ở ĐÂY
// ============================================

// URL Backend API (thay đổi khi deploy sang hosting khác)
export const BACKEND_URL = 'https://web-production-335ab.up.railway.app';

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

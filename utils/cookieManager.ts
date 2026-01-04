// Utility để quản lý cookie ID cho mỗi user/browser
// Cookie ID này sẽ được dùng để xác định user và lưu lịch sử đơn hàng

const COOKIE_ID_KEY = 'nhf_customer_id';

/**
 * Tạo cookie ID duy nhất cho user/browser
 */
const generateCookieId = (): string => {
  return 'CUST-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

/**
 * Lấy cookie ID hiện tại hoặc tạo mới nếu chưa có
 */
export const getCookieId = (): string => {
  try {
    let cookieId = localStorage.getItem(COOKIE_ID_KEY);
    
    if (!cookieId) {
      // Tạo cookie ID mới nếu chưa có
      cookieId = generateCookieId();
      localStorage.setItem(COOKIE_ID_KEY, cookieId);
      console.log(`[CookieManager] Đã tạo cookie ID mới: ${cookieId}`);
    }
    
    return cookieId;
  } catch (err) {
    console.error('[CookieManager] Lỗi khi lấy cookie ID:', err);
    // Fallback: tạo ID tạm thời
    return generateCookieId();
  }
};

/**
 * Kiểm tra xem cookie ID có tồn tại không
 */
export const hasCookieId = (): boolean => {
  try {
    return localStorage.getItem(COOKIE_ID_KEY) !== null;
  } catch (err) {
    return false;
  }
};

/**
 * Lấy cookie ID hiện tại (không tạo mới)
 */
export const getExistingCookieId = (): string | null => {
  try {
    return localStorage.getItem(COOKIE_ID_KEY);
  } catch (err) {
    return null;
  }
};

/**
 * Xóa cookie ID (khi logout hoặc clear data)
 */
export const clearCookieId = (): void => {
  try {
    localStorage.removeItem(COOKIE_ID_KEY);
    console.log('[CookieManager] Đã xóa cookie ID');
  } catch (err) {
    console.error('[CookieManager] Lỗi khi xóa cookie ID:', err);
  }
};



// Utility để lưu và load thông tin khách hàng theo cookieId
import { CustomerInfo } from '../types';
import { getCookieId, getExistingCookieId } from './cookieManager';

const CUSTOMER_INFO_KEY_PREFIX = 'customer_info_';

/**
 * Lấy key localStorage cho thông tin khách hàng theo cookieId
 */
const getCustomerInfoKey = (cookieId?: string | null): string => {
  const currentCookieId = cookieId || getExistingCookieId();
  if (currentCookieId) {
    return `${CUSTOMER_INFO_KEY_PREFIX}${currentCookieId}`;
  }
  return 'customer_info_guest';
};

/**
 * Lưu thông tin khách hàng theo cookieId
 */
export const saveCustomerInfo = (info: CustomerInfo, cookieId?: string | null): void => {
  const key = getCustomerInfoKey(cookieId);
  const currentCookieId = cookieId || getExistingCookieId();
  
  try {
    const storageData = {
      ...info,
      cookieId: currentCookieId,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(key, JSON.stringify(storageData));
    console.log(`[CustomerInfo] Đã lưu thông tin khách hàng cho cookieId: ${currentCookieId}`);
  } catch (err) {
    console.error('[CustomerInfo] Lỗi khi lưu thông tin khách hàng:', err);
  }
};

/**
 * Load thông tin khách hàng theo cookieId
 */
export const loadCustomerInfo = (cookieId?: string | null): CustomerInfo | null => {
  const key = getCustomerInfoKey(cookieId);
  const currentCookieId = cookieId || getExistingCookieId();
  
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      console.log(`[CustomerInfo] Không tìm thấy thông tin khách hàng cho cookieId: ${currentCookieId || 'none'}`);
      return null;
    }
    
    const parsed = JSON.parse(item);
    
    // Trả về CustomerInfo (loại bỏ các trường metadata)
    const customerInfo: CustomerInfo = {
      name: parsed.name || '',
      phone: parsed.phone || '',
      email: parsed.email || '',
      address: parsed.address || '',
      note: parsed.note || ''
    };
    
    console.log(`[CustomerInfo] Đã load thông tin khách hàng cho cookieId: ${currentCookieId}`);
    return customerInfo;
  } catch (err) {
    console.error('[CustomerInfo] Lỗi khi load thông tin khách hàng:', err);
    return null;
  }
};

/**
 * Xóa thông tin khách hàng (nếu cần)
 */
export const clearCustomerInfo = (cookieId?: string | null): void => {
  const key = getCustomerInfoKey(cookieId);
  try {
    localStorage.removeItem(key);
    console.log('[CustomerInfo] Đã xóa thông tin khách hàng');
  } catch (err) {
    console.error('[CustomerInfo] Lỗi khi xóa thông tin khách hàng:', err);
  }
};



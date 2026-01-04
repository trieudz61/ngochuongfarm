// Utility để quản lý orders theo từng user riêng biệt
import { Order } from '../types';
import { User } from '../types';
import { getCookieId, getExistingCookieId } from './cookieManager';

/**
 * Lấy key localStorage cho orders của user cụ thể
 * Ưu tiên dùng cookieId, sau đó mới dùng email/user id
 */
export const getUserOrdersKey = (cookieId?: string | null, user?: User | null): string => {
  // Ưu tiên dùng cookieId
  if (cookieId) {
    return `orders_cookie_${cookieId}`;
  }
  
  // Fallback: dùng cookieId hiện tại nếu có
  const currentCookieId = getExistingCookieId();
  if (currentCookieId) {
    return `orders_cookie_${currentCookieId}`;
  }
  
  // Cuối cùng mới dùng user email/id
  if (user) {
    return `orders_user_${user.email || user.id}`;
  }
  
  return 'orders_guest';
};

/**
 * Lưu orders của user cụ thể vào localStorage
 */
export const saveUserOrders = (orders: Order[], cookieId?: string | null, user?: User | null) => {
  const key = getUserOrdersKey(cookieId, user);
  const identifier = cookieId || (user ? (user.email || user.id) : 'guest');
  
  try {
    const storageData = {
      data: orders,
      timestamp: new Date().toISOString(),
      cookieId: cookieId || getExistingCookieId(),
      userId: user?.email || user?.id,
      version: '1.0'
    };
    localStorage.setItem(key, JSON.stringify(storageData));
    console.log(`[UserOrders] Đã lưu ${orders.length} orders cho ${identifier}`);
  } catch (err) {
    console.error(`[UserOrders] Lỗi khi lưu orders:`, err);
  }
};

/**
 * Load orders của user cụ thể từ localStorage
 * Ưu tiên dùng cookieId
 */
export const loadUserOrders = (cookieId?: string | null, user?: User | null): Order[] => {
  const key = getUserOrdersKey(cookieId, user);
  const identifier = cookieId || (user ? (user.email || user.id) : 'guest');
  
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      console.log(`[UserOrders] No orders found in localStorage for key: ${key}`);
      return [];
    }
    
    const parsed = JSON.parse(item);
    // Hỗ trợ cả format mới (object có data) và format cũ (array trực tiếp)
    const orders = Array.isArray(parsed) ? parsed : (parsed.data || []);
    console.log(`[UserOrders] Loaded ${orders.length} orders from localStorage for ${identifier}`);
    return orders;
  } catch (err) {
    console.error(`[UserOrders] Lỗi khi load orders:`, err);
    return [];
  }
};

/**
 * Kiểm tra order có thuộc về user không
 */
export const isOrderBelongsToUser = (order: Order, user: User | null): boolean => {
  if (!user) return false;
  
  // So sánh theo email (nếu có)
  if (user.email && order.customerInfo.email) {
    return user.email.toLowerCase() === order.customerInfo.email.toLowerCase();
  }
  
  // Fallback: so sánh theo phone (nếu user có lưu phone trong profile)
  // Hoặc có thể dùng user.name match với customerInfo.name
  // Tuy nhiên, cách tốt nhất là dùng email hoặc user ID
  
  return false;
};

/**
 * Filter orders theo cookieId (ưu tiên) hoặc user
 */
export const filterOrdersByCookie = (orders: Order[], cookieId?: string | null, user?: User | null): Order[] => {
  const currentCookieId = cookieId || getExistingCookieId();
  
  console.log(`[UserOrders] Filtering orders for cookieId: ${currentCookieId || 'none'}`);
  console.log(`[UserOrders] Total orders to filter: ${orders.length}`);
  
  if (!currentCookieId && !user) {
    console.log('[UserOrders] No cookieId or user, returning empty');
    return [];
  }
  
  // Filter orders dựa trên cookieId (ưu tiên) hoặc email
  const filtered = orders.filter(order => {
    // Trường hợp 1: Order có cookieId và khớp với currentCookieId
    if (currentCookieId && order.cookieId && currentCookieId === order.cookieId) {
      console.log(`[UserOrders] Order ${order.id} matched by cookieId: ${order.cookieId}`);
      return true;
    }
    
    // Trường hợp 2: Order có cookieId nhưng KHÔNG khớp -> bỏ qua (order của user khác)
    if (order.cookieId && currentCookieId && order.cookieId !== currentCookieId) {
      return false;
    }
    
    // Trường hợp 3: Order KHÔNG có cookieId (orders cũ) -> match theo email nếu có user
    if (!order.cookieId && user?.email && order.customerInfo?.email) {
      const emailMatch = user.email.toLowerCase().trim() === order.customerInfo.email.toLowerCase().trim();
      if (emailMatch) {
        console.log(`[UserOrders] Order ${order.id} matched by email: ${order.customerInfo.email} (old order, no cookieId)`);
        return true;
      }
    }
    
    // Trường hợp 4: Order có cookieId null/undefined và không có user -> chỉ hiển thị nếu không có cookieId nào (guest)
    // Nhưng để bảo mật, chỉ hiển thị nếu có cookieId match hoặc email match
    // Nếu không có cả hai, không hiển thị
    return false;
  });
  
  console.log(`[UserOrders] Filtered orders count: ${filtered.length}`);
  return filtered;
};

/**
 * Xóa một order khỏi TẤT CẢ localStorage keys có thể chứa nó
 * Dùng khi admin xóa order, cần xóa khỏi localStorage của user đó
 */
export const deleteOrderFromAllStorage = (orderId: string, order?: Order) => {
  console.log(`[UserOrders] Deleting order ${orderId} from all storage locations`);
  let deletedCount = 0;
  
  // 1. Xóa khỏi orders chung
  try {
    const ordersKey = 'orders';
    const ordersData = localStorage.getItem(ordersKey);
    if (ordersData) {
      const orders = JSON.parse(ordersData);
      if (Array.isArray(orders)) {
        const filtered = orders.filter((o: Order) => o.id !== orderId);
        if (filtered.length < orders.length) {
          localStorage.setItem(ordersKey, JSON.stringify(filtered));
          deletedCount++;
          console.log(`[UserOrders] Deleted from '${ordersKey}'`);
        }
      }
    }
  } catch (err) {
    console.error('[UserOrders] Error deleting from orders:', err);
  }
  
  // 2. Xóa khỏi orders theo cookieId (nếu order có cookieId)
  if (order?.cookieId) {
    try {
      const cookieKey = `orders_cookie_${order.cookieId}`;
      const cookieData = localStorage.getItem(cookieKey);
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        const orders = Array.isArray(parsed) ? parsed : (parsed.data || []);
        const filtered = orders.filter((o: Order) => o.id !== orderId);
        if (filtered.length < orders.length) {
          const storageData = {
            data: filtered,
            timestamp: new Date().toISOString(),
            cookieId: order.cookieId,
            version: '1.0'
          };
          localStorage.setItem(cookieKey, JSON.stringify(storageData));
          deletedCount++;
          console.log(`[UserOrders] Deleted from '${cookieKey}'`);
        }
      }
    } catch (err) {
      console.error('[UserOrders] Error deleting from cookie storage:', err);
    }
  }
  
  // 3. Xóa khỏi orders theo email (nếu order có email)
  if (order?.customerInfo?.email) {
    try {
      const emailKey = `orders_user_${order.customerInfo.email}`;
      const emailData = localStorage.getItem(emailKey);
      if (emailData) {
        const parsed = JSON.parse(emailData);
        const orders = Array.isArray(parsed) ? parsed : (parsed.data || []);
        const filtered = orders.filter((o: Order) => o.id !== orderId);
        if (filtered.length < orders.length) {
          const storageData = {
            data: filtered,
            timestamp: new Date().toISOString(),
            userId: order.customerInfo.email,
            version: '1.0'
          };
          localStorage.setItem(emailKey, JSON.stringify(storageData));
          deletedCount++;
          console.log(`[UserOrders] Deleted from '${emailKey}'`);
        }
      }
    } catch (err) {
      console.error('[UserOrders] Error deleting from user storage:', err);
    }
  }
  
  // 4. Xóa khỏi orders_guest (nếu có)
  try {
    const guestKey = 'orders_guest';
    const guestData = localStorage.getItem(guestKey);
    if (guestData) {
      const parsed = JSON.parse(guestData);
      const orders = Array.isArray(parsed) ? parsed : (parsed.data || []);
      const filtered = orders.filter((o: Order) => o.id !== orderId);
      if (filtered.length < orders.length) {
        const storageData = {
          data: filtered,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        localStorage.setItem(guestKey, JSON.stringify(storageData));
        deletedCount++;
        console.log(`[UserOrders] Deleted from '${guestKey}'`);
      }
    }
  } catch (err) {
    console.error('[UserOrders] Error deleting from guest storage:', err);
  }
  
  console.log(`[UserOrders] Successfully deleted order from ${deletedCount} storage location(s)`);
  return deletedCount > 0;
};


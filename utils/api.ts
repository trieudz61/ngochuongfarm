// API Service Layer - Kết nối trực tiếp với Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase config
const SUPABASE_URL = 'https://zdkxkzpzxwqvurxrtnnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpka3hrenB6eHdxdnVyeHJ0bm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODYwNjQsImV4cCI6MjA4MzE2MjA2NH0.HjhS31YG_kSvDLW7KNiVez_immv1RoCn6D3ELO0mSkM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔗 Connected to Supabase:', SUPABASE_URL);

// Products API
export const productsAPI = {
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  create: async (product: any): Promise<any> => {
    const now = new Date().toISOString();
    const newProduct = {
      ...product,
      id: product.id || `P${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, product: any): Promise<any> => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
  
  uploadImage: async (file: File): Promise<string> => {
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
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  create: async (article: any): Promise<any> => {
    const now = new Date().toISOString();
    const newArticle = {
      ...article,
      id: article.id || `N${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const { data, error } = await supabase
      .from('news')
      .insert([newArticle])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, article: any): Promise<any> => {
    const { data, error } = await supabase
      .from('news')
      .update({ ...article, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw error;
  },
  
  uploadImage: async (file: File): Promise<string> => {
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
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Không thể đọc file video'));
      reader.readAsDataURL(file);
    });
  },
};


// Orders API
export const ordersAPI = {
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  create: async (order: any): Promise<any> => {
    const now = new Date().toISOString();
    const newOrder = {
      ...order,
      id: order.id || `ORD-${Date.now().toString(36).toUpperCase()}`,
      createdAt: now,
      updatedAt: now
    };
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, status: string): Promise<any> => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },
  
  getByUser: async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  getByCookieId: async (cookieId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('cookieId', cookieId)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  track: async (orderId: string): Promise<any> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  },
};

// Coupons API
export const couponsAPI = {
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  create: async (coupon: any): Promise<any> => {
    const now = new Date().toISOString();
    const newCoupon = {
      ...coupon,
      id: coupon.id || `C${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const { data, error } = await supabase
      .from('coupons')
      .insert([newCoupon])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, coupon: any): Promise<any> => {
    const { data, error } = await supabase
      .from('coupons')
      .update({ ...coupon, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  },
  
  validate: async (code: string): Promise<any> => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('isActive', true)
      .single();
    if (error) throw new Error('Mã giảm giá không hợp lệ');
    if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
      throw new Error('Mã giảm giá đã hết hạn');
    }
    return data;
  },
};

// Reviews API
export const reviewsAPI = {
  add: async (productId: string, review: any): Promise<any> => {
    const newReview = {
      ...review,
      id: `R${Date.now()}`,
      productId,
      date: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  getByProduct: async (productId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('productId', productId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

// Admin Auth API - sử dụng bcrypt compare trên client không an toàn
// Nên giữ auth qua backend hoặc dùng Supabase Auth
export const adminAuthAPI = {
  login: async (username: string, password: string): Promise<any> => {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !admin) {
      throw new Error('Tài khoản admin không tồn tại');
    }
    
    // Simple password check (không an toàn cho production)
    // Trong production nên dùng Supabase Auth hoặc backend
    if (password === '123' && admin.username === 'admin') {
      return {
        token: 'admin-token-' + Date.now(),
        user: {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: 'admin'
        }
      };
    }
    
    throw new Error('Mật khẩu không chính xác');
  },
  
  changePassword: async (username: string, oldPassword: string, newPassword: string): Promise<any> => {
    // Simplified - trong production cần hash password
    throw new Error('Chức năng đổi mật khẩu cần backend server');
  },
};

// Auth API (cho user thường - placeholder)
export const authAPI = {
  login: async (email: string, password: string): Promise<any> => {
    throw new Error('Chức năng đăng nhập user chưa được triển khai');
  },
  register: async (userData: any): Promise<any> => {
    throw new Error('Chức năng đăng ký chưa được triển khai');
  },
  logout: async (): Promise<void> => {},
  getCurrentUser: async (): Promise<any> => null,
};

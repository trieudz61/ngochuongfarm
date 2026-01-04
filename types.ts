
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string; // Ví dụ: kg, Lít, Thùng, Hũ, Combo
  category: 'Trái cây' | 'Khác';
  origin: string;
  harvestDate: string;
  certifications: string[];
  images: string[];
  stock: number;
  description: string;
  cultivationProcess: string;
  isFeatured?: boolean;
  reviews?: Review[];
  averageRating?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: 'Kỹ thuật' | 'Sự kiện' | 'Mùa vụ';
  author: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  isActive: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
}

export type PaymentMethod = 'COD' | 'BankTransfer';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  discountTotal: number;
  finalTotal: number;
  couponCode?: string;
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  status: 'Pending' | 'Processing' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  cookieId?: string; // Cookie ID để xác định user/browser
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

import { Order } from '../types';

// Translation và styling cho order status
export const getStatusTranslation = (status: Order['status']): string => {
  const translations: Record<Order['status'], string> = {
    'Pending': 'Chờ Xử Lý',
    'Processing': 'Đang Xử Lý',
    'Paid': 'Đã Thanh Toán',
    'Shipped': 'Đang Giao Hàng',
    'Delivered': 'Đã Giao Hàng',
    'Cancelled': 'Đã Hủy'
  };
  return translations[status] || status;
};

// Màu sắc đồng bộ cho status (dùng ở cả Admin và User)
export const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'Processing': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'Paid': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'Shipped': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    case 'Delivered': return 'text-emerald-800 bg-emerald-100 border-emerald-200';
    case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
};

// Icon cho status
export const getStatusIcon = (status: Order['status']) => {
  const icons = {
    'Pending': 'Clock',
    'Processing': 'Clock',
    'Paid': 'CheckCircle',
    'Shipped': 'Truck',
    'Delivered': 'CheckCircle',
    'Cancelled': 'XCircle'
  };
  return icons[status] || 'Circle';
};

// Format ngày giờ đầy đủ
export const formatDateTime = (dateString: string): { date: string; time: string; full: string } => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    full: date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };
};


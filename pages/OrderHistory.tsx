
import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchOrders } from '../store';
import { Clock, Package, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStatusTranslation, getStatusColor, formatDateTime } from '../utils/orderStatus';
import { filterOrdersByCookie, loadUserOrders } from '../utils/userOrders';
import { getCookieId } from '../utils/cookieManager';

const OrderHistory: React.FC = () => {
  const allOrders = useSelector((state: RootState) => state.app.orders);
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch<AppDispatch>();

  // QUAN TRỌNG: Chỉ hiển thị orders theo cookieId của user hiện tại
  const cookieId = getCookieId();
  
  // Fetch orders từ API khi component mount và khi cookieId thay đổi
  useEffect(() => {
    if (cookieId) {
      console.log(`[OrderHistory] Fetching orders for cookieId: ${cookieId}`);
      dispatch(fetchOrders(cookieId));
    }
    
    // Fetch lại mỗi 30 giây để sync trạng thái với admin
    const interval = setInterval(() => {
      if (cookieId) {
        dispatch(fetchOrders(cookieId));
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [dispatch, cookieId]);
  
  const orders = useMemo(() => {
    console.log(`[OrderHistory] Building orders list for cookieId: ${cookieId}`);
    console.log(`[OrderHistory] Total orders in store: ${allOrders.length}`);
    
    // Filter orders từ Redux store theo cookieId (source of truth from API)
    const filteredFromStore = filterOrdersByCookie(allOrders, cookieId, user);
    console.log(`[OrderHistory] Filtered from store: ${filteredFromStore.length}`);
    
    // Nếu có orders từ API/store, ưu tiên sử dụng (đã được sync với database)
    if (filteredFromStore.length > 0 || allOrders.length > 0) {
      // Đã fetch từ API, sử dụng kết quả này (source of truth)
      console.log(`[OrderHistory] Using orders from API (source of truth)`);
      
      // Sắp xếp theo thời gian tạo (mới nhất trước)
      const sorted = [...filteredFromStore].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      return sorted;
    }
    
    // Fallback: Chỉ dùng localStorage khi chưa fetch API hoặc API fail
    const cachedOrders = loadUserOrders(cookieId, user);
    console.log(`[OrderHistory] Fallback to cached orders: ${cachedOrders.length}`);
    
    // Sắp xếp theo thời gian tạo (mới nhất trước)
    const sorted = [...cachedOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return sorted;
  }, [allOrders, cookieId, user]);


  if (orders.length === 0) {
    return (
      <div className="py-24 text-center px-4 bg-gray-50 min-h-screen">
        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-gray-200" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Chưa có đơn hàng nào</h2>
        <p className="text-gray-500 mb-10 max-w-xs mx-auto font-medium">Bạn chưa thực hiện bất kỳ giao dịch nào trên Ngọc Hường Farm.</p>
        <Link to="/products" className="inline-block bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all">Ghé thăm vườn ngay</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-tight">Lịch sử đơn hàng</h1>
          <p className="text-gray-500 font-medium mt-2">Theo dõi và quản lý {orders.length} đơn hàng bạn đã đặt.</p>
        </div>

        <div className="space-y-10">
          {orders.slice().reverse().map(order => (
            <div key={order.id} className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all group">
              <div className="bg-gray-50/50 p-6 sm:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <div className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em] mb-1">Mã định danh đơn hàng</div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none group-hover:text-orange-600 transition-colors uppercase tracking-tight">{order.id}</h3>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">{formatDateTime(order.createdAt).full}</div>
                </div>
                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-black uppercase text-[10px] tracking-widest shadow-sm ${getStatusColor(order.status)}`}>
                  {order.status === 'Pending' || order.status === 'Processing' ? <Clock className="w-4 h-4" /> :
                   order.status === 'Paid' || order.status === 'Delivered' ? <CheckCircle className="w-4 h-4" /> :
                   order.status === 'Shipped' ? <Truck className="w-4 h-4" /> :
                   order.status === 'Cancelled' ? <XCircle className="w-4 h-4" /> : null}
                  {getStatusTranslation(order.status)}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 sm:gap-6 group/item">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                        <img src={item.images[0]} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-black text-gray-900 leading-tight text-sm sm:text-lg truncate">{item.name}</h4>
                        <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">
                          Số lượng: <span className="text-gray-900">{item.quantity} {item.unit}</span> | Đơn giá: {item.price.toLocaleString()}đ
                        </div>
                      </div>
                      <div className="font-black text-gray-900 text-sm sm:text-lg whitespace-nowrap">{(item.price * item.quantity).toLocaleString()}đ</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6">
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng tiền thanh toán</div>
                    <div className="text-2xl sm:text-3xl font-black text-orange-700">{order.finalTotal.toLocaleString()}đ</div>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    {/* QUAN TRỌNG: Truyền ID qua query string để OrderTracking tự động tìm kiếm */}
                    <Link to={`/track-order?id=${order.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95">
                      Tra cứu hành trình <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;

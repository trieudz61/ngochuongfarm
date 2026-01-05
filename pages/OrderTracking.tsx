
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState, AppDispatch, fetchOrders } from '../store';
import { ordersAPI } from '../utils/api';
import { Search, Package, MapPin, CreditCard, Wallet, Clock, CheckCircle, Truck, XCircle, ChevronRight, Printer, Info, ShoppingBag } from 'lucide-react';
import { getStatusTranslation, formatDateTime } from '../utils/orderStatus';
import { loadUserOrders, filterOrdersByCookie } from '../utils/userOrders';
import { getCookieId } from '../utils/cookieManager';

const OrderTracking: React.FC = () => {
  const allOrders = useSelector((state: RootState) => state.app.orders);
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  
  // Chỉ lấy orders của cookieId hiện tại (để search)
  const cookieId = getCookieId();
  const orders = React.useMemo(() => {
    // Filter orders của cookieId hiện tại từ Redux store
    return filterOrdersByCookie(allOrders, cookieId, user);
  }, [allOrders, cookieId, user]);

  // Tự động fetch orders để sync với admin
  useEffect(() => {
    dispatch(fetchOrders(cookieId));
    // Refresh mỗi 30 giây để sync trạng thái
    const interval = setInterval(() => {
      dispatch(fetchOrders(cookieId));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, cookieId]);

  // Hàm thực hiện tìm kiếm logic tách riêng để dùng chung
  const executeSearch = useCallback(async (id: string) => {
    if (!id.trim()) return;
    
    // Tìm trong local state (orders của user) trước
    const localOrder = orders.find(o => 
      o.id.toLowerCase() === id.toLowerCase().trim() || 
      o.id.includes(id.toUpperCase().trim())
    );
    
    if (localOrder) {
      setFoundOrder(localOrder);
      setSearched(true);
      return;
    }
    
    // Nếu không tìm thấy trong Redux, thử tìm trong localStorage theo cookieId
    const userOrders = loadUserOrders(cookieId, user);
    const cachedOrder = userOrders.find(o => 
      o.id.toLowerCase() === id.toLowerCase().trim()
    );
    if (cachedOrder) {
      setFoundOrder(cachedOrder);
      setSearched(true);
      return;
    }
    
    // Nếu không tìm thấy, fetch từ API
    try {
      const order = await ordersAPI.track(id.trim());
      setFoundOrder(order || null);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching order:', error);
      setFoundOrder(null);
      setSearched(true);
    }
  }, [orders, cookieId, user]);

  // Tự động tìm kiếm nếu có ID từ URL (Deep Link từ Giỏ hàng/Lịch sử)
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      executeSearch(idFromUrl);
    }
  }, [searchParams, executeSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(orderId);
  };

  const steps = [
    { label: getStatusTranslation('Pending'), status: 'Pending', icon: Clock },
    { label: getStatusTranslation('Processing'), status: 'Processing', icon: Info },
    { label: getStatusTranslation('Paid'), status: 'Paid', icon: Package },
    { label: getStatusTranslation('Shipped'), status: 'Shipped', icon: Truck },
    { label: getStatusTranslation('Delivered'), status: 'Delivered', icon: CheckCircle },
  ];
  
  // Handle cancelled status
  const cancelledSteps = [
    { label: getStatusTranslation('Pending'), status: 'Pending', icon: Clock },
    { label: getStatusTranslation('Cancelled'), status: 'Cancelled', icon: XCircle },
  ];
  
  const displaySteps = foundOrder?.status === 'Cancelled' ? cancelledSteps : steps;
  const currentStepIdx = foundOrder ? displaySteps.findIndex(s => s.status === foundOrder.status) : -1;

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Search Section */}
        <div className="text-center mb-12">
           <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Tra cứu trực tuyến</span>
           <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase tracking-tight mb-4 leading-tight">Hành trình <br/> <span className="text-orange-600">Đơn hàng sạch</span></h1>
           <p className="text-gray-500 font-medium max-w-sm mx-auto text-sm sm:text-base">Nhập mã đơn hàng của bạn để cập nhật trạng thái mới nhất từ Ngọc Hường Farm.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-12 relative group z-10">
          <div className="absolute inset-0 bg-orange-600 opacity-0 group-focus-within:opacity-5 blur-3xl transition-opacity rounded-full"></div>
          <input 
            type="text" 
            placeholder="Mã đơn (VD: ORD-XXXXXX)" 
            className="w-full p-6 sm:p-8 pr-20 sm:pr-24 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border-2 border-gray-100 focus:border-orange-500 outline-none font-black text-lg sm:text-2xl uppercase transition-all placeholder:normal-case placeholder:font-bold relative z-20"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-600 text-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 z-30">
            <Search className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </form>

        {foundOrder ? (
          <div className="space-y-6 sm:space-y-10 animate-in fade-in zoom-in duration-500">
            {/* Status Timeline - Responsive: Vertical on mobile, Horizontal on desktop */}
            <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-sm border border-gray-100">
              {/* Mobile: Vertical Timeline */}
              <div className="block sm:hidden">
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100">
                    <div 
                      className="w-full bg-orange-600 transition-all duration-1000 ease-out rounded-full" 
                      style={{ height: displaySteps.length > 1 ? `${(currentStepIdx / (displaySteps.length - 1)) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  
                  <div className="space-y-6">
                    {displaySteps.map((step, idx) => {
                      const isActive = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={idx} className="flex items-center gap-4 relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-500 z-10 flex-shrink-0 ${
                            isCurrent ? 'bg-orange-600 text-white scale-110 ring-4 ring-orange-100' : 
                            isActive ? 'bg-orange-50 text-orange-600 border-2 border-orange-200' : 
                            'bg-white text-gray-300 border-2 border-gray-100'
                          }`}>
                            <step.icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                          </div>
                          <div className="flex-grow">
                            <span className={`block text-sm font-black uppercase tracking-wide ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                              {step.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tight flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                Trạng thái hiện tại
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isCurrent ? 'text-orange-600' : 'text-green-500'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Desktop: Horizontal Timeline */}
              <div className="hidden sm:block">
                <div className="flex justify-between items-center px-4 relative">
                  {/* Connector Line */}
                  <div className="absolute top-8 left-16 right-16 h-1 bg-gray-100 rounded-full z-0">
                    <div 
                      className="h-full bg-orange-600 transition-all duration-1000 ease-out rounded-full" 
                      style={{ width: displaySteps.length > 1 ? `${(currentStepIdx / (displaySteps.length - 1)) * 100}%` : '0%' }}
                    ></div>
                  </div>

                  {displaySteps.map((step, idx) => {
                    const isActive = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                          isCurrent ? 'bg-orange-600 text-white scale-110' : 
                          isActive ? 'bg-orange-50 text-orange-600' : 
                          'bg-white text-gray-200 border-2 border-gray-50'
                        }`}>
                          <step.icon className={`w-8 h-8 ${isCurrent ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="text-center">
                          <span className={`block text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</span>
                          {isCurrent && <span className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">Đang ở bước này</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
               {/* Shipping Info */}
               <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-sm border border-gray-100 group hover:shadow-lg transition-shadow">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <MapPin className="text-orange-600 w-4 h-4" /> Thông tin nhận hàng
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-1">Họ tên khách hàng</p>
                      <p className="font-black text-gray-900 text-lg sm:text-xl leading-none">{foundOrder.customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-1">Số điện thoại liên hệ</p>
                      <p className="font-black text-gray-900 text-lg sm:text-xl leading-none">{foundOrder.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-1">Địa chỉ giao hàng</p>
                      <p className="font-bold text-gray-600 text-sm leading-relaxed">{foundOrder.customerInfo.address}</p>
                    </div>
                    {foundOrder.customerInfo.note && (
                      <div>
                        <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-1">Ghi chú đơn hàng</p>
                        <p className="font-bold text-gray-600 text-sm leading-relaxed italic">{foundOrder.customerInfo.note}</p>
                      </div>
                    )}
                  </div>
               </div>

               {/* Payment Info */}
               <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-sm border border-gray-100 group hover:shadow-lg transition-shadow">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <CreditCard className="text-orange-600 w-4 h-4" /> Phương thức thanh toán
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-50 p-4 rounded-2xl text-orange-600">
                        {foundOrder.paymentMethod === 'BankTransfer' ? <CreditCard className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                      </div>
                      <div>
                         <span className="block font-black uppercase text-xs tracking-widest text-gray-900">{foundOrder.paymentMethod === 'BankTransfer' ? 'Chuyển khoản' : 'Tiền mặt (COD)'}</span>
                         <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                           Trạng thái: {getStatusTranslation(foundOrder.status)}
                         </span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                       <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-1">Tổng cộng hóa đơn</p>
                       <p className="text-3xl sm:text-4xl font-black text-orange-700 leading-none">{foundOrder.finalTotal.toLocaleString()}đ</p>
                    </div>
                  </div>
               </div>

               {/* Items List */}
               <div className="md:col-span-2 bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] shadow-sm border border-gray-100">
                  <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                     <Package className="w-5 h-5 text-orange-600" /> Chi tiết đơn hàng
                  </h3>
                  <div className="space-y-4">
                     {foundOrder.items.map((item: any) => (
                       <div key={item.id} className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-50 group/item hover:bg-orange-50/50 transition-colors">
                          <div className="flex items-center gap-4 sm:gap-6">
                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                <img src={item.images[0]} className="w-full h-full object-cover group-item:scale-110 transition-transform duration-500" alt="" />
                             </div>
                             <div className="min-w-0">
                                <div className="font-black text-gray-900 text-sm sm:text-lg truncate tracking-tight">{item.name}</div>
                                <div className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  {item.quantity} {item.unit} x {item.price.toLocaleString()}đ
                                </div>
                             </div>
                          </div>
                          <div className="font-black text-gray-900 text-sm sm:text-xl shrink-0">{(item.price * item.quantity).toLocaleString()}đ</div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex justify-center gap-6 pb-10">
               <button onClick={() => window.print()} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-orange-600 transition-all group">
                 <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" /> In đơn hàng
               </button>
            </div>
          </div>
        ) : searched && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <XCircle className="w-10 h-10 text-red-200" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tight mb-4">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm sm:text-base">Vui lòng kiểm tra lại mã đơn hàng trong email xác nhận hoặc liên hệ hotline để được hỗ trợ.</p>
            <button 
              onClick={() => {setOrderId(''); setSearched(false);}} 
              className="mt-10 text-orange-600 font-black uppercase text-xs tracking-widest underline underline-offset-8"
            >
              Thử lại mã khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

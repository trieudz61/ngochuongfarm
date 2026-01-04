
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  Wallet, 
  MapPin, 
  Phone, 
  Ticket, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Truck,
  ShieldCheck,
  AlertCircle,
  History,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Heart,
  Sparkles,
  User as UserIcon,
  Mail,
  MessageCircle,
  Clock
} from 'lucide-react'; 
import { RootState, AppDispatch, removeFromCart, updateQuantity, addToCart, createOrder, clearCart, fetchOrders } from '../store';
import { couponsAPI } from '../utils/api';
import { CustomerInfo, PaymentMethod, Coupon, Order } from '../types';
import { filterOrdersByCookie, loadUserOrders, saveUserOrders } from '../utils/userOrders';
import { getCookieId } from '../utils/cookieManager';
import { saveCustomerInfo, loadCustomerInfo } from '../utils/customerInfo';

// Modal Cảm ơn sau khi đặt hàng thành công
interface SuccessModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

const OrderSuccessModal: React.FC<SuccessModalProps> = ({ isOpen, orderId, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-orange-950/80 backdrop-blur-2xl animate-in fade-in duration-500"></div>
      <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full relative z-10 text-center shadow-2xl animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
          <Sparkles className="absolute -top-2 -right-2 text-amber-400 w-8 h-8" />
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 uppercase mb-4 leading-tight">Đã đặt hàng thành công!</h2>
        
        <div className="bg-emerald-50 rounded-2xl py-3 px-6 inline-block mb-6 border border-emerald-100">
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block">Mã đơn hàng của bạn</span>
          <span className="text-xl font-black text-emerald-700 tracking-tight">{orderId}</span>
        </div>

        <div className="space-y-4 mb-10 text-gray-500 font-medium px-4">
          <p className="text-sm leading-relaxed">
            Cảm ơn bạn đã tin tưởng chọn lựa nông sản từ <span className="text-orange-600 font-black uppercase">Ngọc Hường Farm</span>.
          </p>
          <p className="text-xs italic flex items-center justify-center gap-2">
            Đơn hàng của bạn đang được chúng tôi chuẩn bị bằng tất cả tâm huyết. <Heart className="w-3 h-3 text-red-500 fill-current" />
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link 
            to={`/track-order?id=${orderId}`}
            className="bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" /> Tra cứu đơn hàng
          </Link>
          <button 
            onClick={onClose}
            className="text-gray-400 font-black uppercase text-[10px] tracking-widest py-4 hover:text-gray-900 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal thông tin chuyển khoản chuyên nghiệp với tính năng Copy
interface BankModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  total: number;
  orderId?: string;
}

const BankTransferModal: React.FC<BankModalProps> = ({ isOpen, onConfirm, onCancel, total, orderId }) => {
  const [copiedField, setCopiedField] = useState<'account' | 'content' | null>(null);
  
  if (!isOpen) return null;

  const accountNumber = "0987936737";
  const transferContent = `THANH TOAN ${orderId || 'DONHANG'}`;

  const handleCopy = (text: string, field: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-orange-950/60 backdrop-blur-xl" onClick={onCancel}></div>
      <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full relative z-10 text-center shadow-2xl animate-in zoom-in duration-300 my-4 max-h-[95vh] overflow-y-auto">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7 text-orange-600" />
        </div>
        <h2 className="text-xl font-black uppercase mb-4 text-gray-900">Thanh toán chuyển khoản</h2>
        
        <div className="bg-gray-50 p-4 rounded-2xl mb-5 space-y-3 text-left border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Ngân hàng</span>
            <span className="font-black text-gray-900 text-sm">MB BANK</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Số tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-base tracking-tight">0987.936.737</span>
              <button 
                onClick={() => handleCopy(accountNumber, 'account')}
                className={`p-1.5 rounded-lg transition-all ${copiedField === 'account' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-orange-600 hover:bg-orange-100 border border-orange-100'}`}
                title="Sao chép số tài khoản"
              >
                {copiedField === 'account' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Chủ tài khoản</span>
            <span className="font-black text-gray-900 uppercase text-[10px] text-right max-w-[60%] leading-tight">NGUYEN THI NGOC HUONG</span>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[9px] font-black uppercase text-orange-400 tracking-widest">Nội dung chuyển khoản</p>
              <button 
                onClick={() => handleCopy(transferContent, 'content')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase transition-all ${copiedField === 'content' ? 'bg-emerald-500 text-white' : 'bg-orange-600 text-white shadow-sm hover:bg-orange-700'}`}
              >
                {copiedField === 'content' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                {copiedField === 'content' ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
            <p className="font-black text-orange-700 bg-orange-100/50 px-3 py-2 rounded-xl text-xs border border-orange-200/50 break-all">
              {transferContent}
            </p>
          </div>
        </div>
        
        <p className="text-[10px] text-gray-400 mb-5 font-bold leading-relaxed px-3 italic">
          * Vui lòng nhập <span className="text-orange-600">chính xác</span> nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng nhanh nhất.
        </p>
        
        <div className="space-y-2">
          <button 
            onClick={onConfirm} 
            className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 active:scale-[0.98] text-sm"
          >
            Tôi đã chuyển khoản
          </button>
          <button 
            onClick={onCancel} 
            className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all text-[10px]"
          >
            Hủy / Thanh toán sau
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart: React.FC = () => {
  const cart = useSelector((state: RootState) => state.app.cart);
  const allOrders = useSelector((state: RootState) => state.app.orders);
  const coupons = useSelector((state: RootState) => state.app.coupons);
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // QUAN TRỌNG: Lấy orders theo cookieId của user hiện tại
  const cookieId = getCookieId();
  
  // Fetch orders từ API khi component mount và khi cookieId thay đổi
  React.useEffect(() => {
    if (cookieId) {
      console.log(`[Cart] Fetching orders for cookieId: ${cookieId}`);
      dispatch(fetchOrders(cookieId));
    }
  }, [dispatch, cookieId]);
  
  const orders = React.useMemo(() => {
    console.log(`[Cart] Building orders list for cookieId: ${cookieId}`);
    console.log(`[Cart] Total orders in Redux store: ${allOrders.length}`);
    
    // Filter orders từ Redux store theo cookieId (source of truth from API)
    const filteredFromStore = filterOrdersByCookie(allOrders, cookieId, user);
    console.log(`[Cart] Filtered from Redux store: ${filteredFromStore.length}`);
    
    // Nếu có orders từ API/store, ưu tiên sử dụng (đã được sync với database)
    if (filteredFromStore.length > 0 || allOrders.length > 0) {
      // Đã fetch từ API, sử dụng kết quả này (source of truth)
      console.log(`[Cart] Using orders from API (source of truth)`);
      
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
    console.log(`[Cart] Fallback to cached orders: ${cachedOrders.length}`);
    
    // Sắp xếp theo thời gian tạo (mới nhất trước)
    const sorted = [...cachedOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return sorted;
  }, [allOrders, cookieId, user]);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showHistory, setShowHistory] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');

  // Load thông tin khách hàng đã lưu khi component mount
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => {
    // Thử load từ localStorage theo cookieId
    const savedInfo = loadCustomerInfo(cookieId);
    if (savedInfo && (savedInfo.name || savedInfo.phone || savedInfo.address)) {
      // Merge với user email nếu có
      return {
        ...savedInfo,
        email: savedInfo.email || (user?.email || '')
      };
    }
    // Nếu không có thông tin đã lưu, sử dụng user email nếu có
    return {
      name: '',
      phone: '',
      email: user?.email || '',
      address: '',
      note: ''
    };
  });
  
  // Khi cookieId hoặc user thay đổi, reload thông tin khách hàng
  React.useEffect(() => {
    const savedInfo = loadCustomerInfo(cookieId);
    if (savedInfo && (savedInfo.name || savedInfo.phone || savedInfo.address)) {
      setCustomerInfo({
        ...savedInfo,
        email: savedInfo.email || (user?.email || '')
      });
    } else if (user?.email) {
      // Nếu có user email nhưng chưa có thông tin đã lưu, thêm email vào form
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email || prev.email
      }));
    }
  }, [cookieId, user?.email]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.discountType === 'percent' 
      ? (subtotal * appliedCoupon.discountValue) / 100 
      : appliedCoupon.discountValue;
  }
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    setCouponError('');
    
    // Tìm trong local state trước
    let coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    
    // Nếu không tìm thấy, validate từ API
    if (!coupon) {
      try {
        coupon = await couponsAPI.validate(couponCode.toUpperCase());
      } catch (error) {
        setCouponError('Mã không hợp lệ hoặc đã hết hạn');
        return;
      }
    }
    
    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ`);
    } else {
      setAppliedCoupon(coupon);
    }
  };

  const handleFinalCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      setStep(2);
      return;
    }
    // Tạo orderId một lần duy nhất
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setCurrentOrderId(orderId);
    
    // Đảm bảo email được lưu vào customerInfo từ user hiện tại (nếu có)
    const orderCustomerInfo = {
      ...customerInfo,
      email: customerInfo.email || (user?.email || '') // Lấy email từ user nếu không có trong form
    };
    
    // Lấy cookieId hiện tại
    const currentCookieId = getCookieId();
    
    // Lưu thông tin khách hàng để sử dụng lần sau
    saveCustomerInfo(orderCustomerInfo, currentCookieId);
    
    const newOrder: Order = {
      id: orderId,
      items: cart,
      total: subtotal,
      discountTotal: discount,
      finalTotal: total,
      couponCode: appliedCoupon?.code,
      customerInfo: orderCustomerInfo,
      paymentMethod,
      status: paymentMethod === 'BankTransfer' ? 'Pending' as const : 'Processing' as const,
      createdAt: new Date().toISOString(),
      cookieId: currentCookieId // Lưu cookieId vào order
    };
    
    console.log(`[Cart] Creating order ${orderId} with cookieId: ${currentCookieId}`);

    if (paymentMethod === 'BankTransfer') {
      setIsBankModalOpen(true);
    } else {
      try {
        await dispatch(createOrder(newOrder)).unwrap();
        setIsSuccessModalOpen(true);
      } catch (error: any) {
        // Nếu backend offline, vẫn lưu order vào localStorage để giữ lịch sử (theo user)
        if (error === 'BACKEND_OFFLINE' || error?.includes('BACKEND_OFFLINE')) {
          // Lưu order vào localStorage theo user (nếu có)
          if (user) {
            const userOrdersKey = `orders_user_${user.email || user.id}`;
            try {
              const ordersData = localStorage.getItem(userOrdersKey);
              const parsed = ordersData ? JSON.parse(ordersData) : [];
              const existingOrders = Array.isArray(parsed) ? parsed : (parsed.data || []);
              existingOrders.unshift(newOrder);
              localStorage.setItem(userOrdersKey, JSON.stringify(existingOrders));
            } catch (err) {
              console.error('[Cart] Error saving to user orders:', err);
            }
          } else {
            // Fallback: lưu vào orders chung (sẽ được filter sau)
            try {
              const ordersData = localStorage.getItem('orders');
              const parsed = ordersData ? JSON.parse(ordersData) : [];
              const existingOrders = Array.isArray(parsed) ? parsed : (parsed.data || []);
              existingOrders.unshift(newOrder);
              localStorage.setItem('orders', JSON.stringify(existingOrders));
            } catch (err) {
              console.error('[Cart] Error saving to orders:', err);
            }
          }
          
          // Xóa cart
          dispatch(clearCart());
          
          // Vẫn hiển thị success modal
          setIsSuccessModalOpen(true);
          console.log('[Cart] Đã lưu order vào localStorage (backend offline)');
        } else {
          alert(error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        }
      }
    }
  };

  const confirmBankTransfer = async () => {
    // Sử dụng orderId đã tạo từ handleFinalCheckout
    if (!currentOrderId) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }
    // Đảm bảo email được lưu vào customerInfo từ user hiện tại (nếu có)
    const orderCustomerInfo = {
      ...customerInfo,
      email: customerInfo.email || (user?.email || '') // Lấy email từ user nếu không có trong form
    };
    
    // Lấy cookieId hiện tại
    const currentCookieId = getCookieId();
    
    // Lưu thông tin khách hàng để sử dụng lần sau
    saveCustomerInfo(orderCustomerInfo, currentCookieId);
    
    const newOrder: Order = {
      id: currentOrderId,
      items: cart,
      total: subtotal,
      discountTotal: discount,
      finalTotal: total,
      couponCode: appliedCoupon?.code,
      customerInfo: orderCustomerInfo,
      paymentMethod,
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
      cookieId: currentCookieId // Lưu cookieId vào order
    };
    
    console.log(`[Cart] Creating order ${currentOrderId} with cookieId: ${currentCookieId}`);

    try {
      await dispatch(createOrder(newOrder)).unwrap();
      setIsBankModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
        // Nếu backend offline, vẫn lưu order vào localStorage để giữ lịch sử (theo cookieId)
        if (error === 'BACKEND_OFFLINE' || error?.includes('BACKEND_OFFLINE')) {
          // Load orders hiện tại của cookieId này
          const existingOrders = loadUserOrders(currentCookieId, user);
          
          // Đảm bảo order mới được thêm vào
          const hasOrder = existingOrders.find((o: Order) => o.id === newOrder.id);
          if (!hasOrder) {
            existingOrders.unshift(newOrder);
          }
          
          // Lưu lại với cookieId
          saveUserOrders(existingOrders, currentCookieId, user);
          console.log(`[Cart] Đã lưu order vào localStorage cho cookieId: ${currentCookieId}`);
        
        // Xóa cart
        dispatch(clearCart());
        
        // Đóng modal và hiển thị success
        setIsBankModalOpen(false);
        setIsSuccessModalOpen(true);
        console.log('[Cart] Đã lưu order vào localStorage (backend offline)');
      } else {
        alert(error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    navigate('/');
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      dispatch(addToCart({ product: item, quantity: item.quantity }));
    });
    setShowHistory(false);
    setStep(1); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCouponUI = () => (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Ticket className="w-4 h-4 text-orange-600" /> 
            Mã ưu đãi / Voucher
          </h3>
          {appliedCoupon && (
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Đã áp dụng
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <div className="flex-grow relative">
            <input 
              type="text" 
              placeholder="Nhập mã giảm giá..." 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-xl outline-none font-bold uppercase text-sm transition-all duration-300 hover:bg-gray-100 pr-12" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value)} 
              disabled={!!appliedCoupon} 
            />
            {couponCode && !appliedCoupon && (
              <button
                onClick={() => setCouponCode('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            type="button"
            onClick={handleApplyCoupon} 
            disabled={!couponCode || !!appliedCoupon} 
            className={`px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
              appliedCoupon 
                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100 cursor-default' 
                : couponCode
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {appliedCoupon ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                OK
              </div>
            ) : (
              'ÁP DỤNG'
            )}
          </button>
        </div>
        
        {/* Error message */}
        {couponError && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-xs font-bold uppercase">{couponError}</p>
            </div>
          </div>
        )}
        
        {/* Success message */}
        {appliedCoupon && (
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-25 rounded-xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      Mã {appliedCoupon.code}
                    </span>
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">
                      -{discount.toLocaleString()}đ
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">
                    Bạn đã tiết kiệm được {discount.toLocaleString()}đ
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {setAppliedCoupon(null); setCouponCode('');}} 
                className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors group"
                title="Hủy mã giảm giá"
              >
                <X className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
              </button>
            </div>
          </div>
        )}
        
        {/* Available coupons hint */}
        {!appliedCoupon && coupons.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-orange-700 uppercase mb-1">Mã giảm giá có sẵn</p>
                <div className="flex flex-wrap gap-2">
                  {coupons.filter(c => c.isActive).slice(0, 2).map(coupon => (
                    <button
                      key={coupon.id}
                      onClick={() => setCouponCode(coupon.code)}
                      className="text-[8px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg hover:bg-orange-200 transition-colors uppercase"
                    >
                      {coupon.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecentOrders = () => {
    if (orders.length === 0 || !showHistory || step !== 1) return null;
    return (
      <div className="mt-12 md:mt-16 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2">
            <History className="w-5 h-5 text-orange-600" /> Đơn hàng bạn đã mua ({orders.length})
          </h3>
          <button onClick={() => setShowHistory(false)} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase">Ẩn đi</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.slice().reverse().map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:border-orange-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">{order.id}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{order.status}</span>
              </div>
              <div className="flex -space-x-3 mb-6">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-2">
                <p className="font-black text-gray-900 whitespace-nowrap">{order.finalTotal.toLocaleString()}đ</p>
                <div className="flex gap-2">
                  <Link 
                    to={`/track-order?id=${order.id}`}
                    className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-all"
                  >
                    <Search className="w-3 h-3" /> Tra cứu
                  </Link>
                  <button 
                    onClick={() => handleReorder(order)}
                    className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 hover:text-white transition-all"
                  >
                    <RotateCcw className="w-3 h-3" /> Mua lại
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (cart.length === 0 && step === 1) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-16 h-16 text-orange-200" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 uppercase mb-4 text-center">Giỏ hàng trống</h2>
        <Link to="/products" className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-orange-100 text-center mb-12">Khám phá sản phẩm</Link>
        <div className="max-w-2xl w-full">
          {renderRecentOrders()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-40 md:pb-16">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
             <Link to="/products" className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 hover:text-orange-600 transition-colors group">
               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                 <ArrowLeft className="w-4 h-4" />
               </div>
               Quay lại cửa hàng
             </Link>
             <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               Thanh toán an toàn & bảo mật
             </div>
          </div>
          
          {/* Enhanced Progress Steps */}
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-gray-100 to-gray-50 -translate-y-1/2 z-0 rounded-full"></div>
            
            {/* Progress line with gradient */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 -translate-y-1/2 z-0 transition-all duration-700 ease-out rounded-full shadow-sm" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {/* Step indicators */}
            <div className="flex items-center justify-between relative z-10">
              {[
                { id: 1, label: 'Giỏ hàng', icon: ShoppingBag, desc: 'Xem lại sản phẩm' },
                { id: 2, label: 'Giao hàng', icon: MapPin, desc: 'Thông tin nhận hàng' },
                { id: 3, label: 'Thanh toán', icon: CreditCard, desc: 'Hoàn tất đơn hàng' }
              ].map((s, index) => (
                <div key={s.id} className="flex flex-col items-center gap-3 group">
                  {/* Step circle with enhanced styling */}
                  <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                    step >= s.id 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-white text-white shadow-lg shadow-orange-200 scale-110' 
                      : step === s.id - 1 
                        ? 'bg-white border-orange-200 text-orange-400 shadow-md animate-pulse' 
                        : 'bg-white border-gray-100 text-gray-300 shadow-sm'
                  }`}>
                    <s.icon className="w-6 h-6 md:w-7 md:h-7" />
                    
                    {/* Checkmark for completed steps */}
                    {step > s.id && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                    )}
                    
                    {/* Pulse animation for current step */}
                    {step === s.id && (
                      <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20"></div>
                    )}
                  </div>
                  
                  {/* Step labels with enhanced typography */}
                  <div className="text-center">
                    <span className={`block text-xs md:text-sm font-black uppercase tracking-wider transition-colors duration-300 ${
                      step >= s.id ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                    <span className={`hidden md:block text-[10px] font-medium mt-1 transition-colors duration-300 ${
                      step >= s.id ? 'text-orange-400' : 'text-gray-300'
                    }`}>
                      {s.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                <h2 className="text-xl font-black text-gray-900 uppercase px-2">Sản phẩm ({cart.length})</h2>
                {cart.map(item => (
                  <div key={item.id} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                      <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-gray-900 text-sm md:text-lg truncate">{item.name}</h3>
                        <button onClick={() => dispatch(removeFromCart(item.id))} className="text-gray-300 hover:text-red-500"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-gray-50 rounded-xl p-1">
                          <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))} className="w-8 h-8 font-black">-</button>
                          <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-8 h-8 font-black">+</button>
                        </div>
                        <span className="text-sm md:text-lg font-black text-orange-700">{(item.price * item.quantity).toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {renderRecentOrders()}

                <div className="lg:hidden mt-6">
                   {renderCouponUI()}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-right-4 duration-500 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-50 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 uppercase mb-2">Thông tin giao hàng</h2>
                      <p className="text-sm text-gray-500 font-medium">Vui lòng điền đầy đủ thông tin để chúng tôi giao hàng chính xác</p>
                    </div>
                    {customerInfo.name || customerInfo.phone || customerInfo.address ? (
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã tự động điền
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Enhanced form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name field */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <UserIcon className="w-3 h-3" />
                        Họ tên người nhận *
                      </label>
                      <input 
                        className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all duration-300 hover:bg-gray-100" 
                        value={customerInfo.name} 
                        onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                        placeholder="Nhập họ tên đầy đủ" 
                      />
                    </div>
                    
                    {/* Phone field */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Số điện thoại *
                      </label>
                      <input 
                        className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all duration-300 hover:bg-gray-100" 
                        value={customerInfo.phone} 
                        onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                        placeholder="Số điện thoại liên hệ" 
                        type="tel"
                      />
                    </div>
                    
                    {/* Address field */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Địa chỉ giao hàng *
                      </label>
                      <input 
                        className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all duration-300 hover:bg-gray-100" 
                        value={customerInfo.address} 
                        onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" 
                      />
                    </div>
                    
                    {/* Email field */}
                    {user?.email && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          Email (tùy chọn)
                        </label>
                        <input
                          className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all duration-300 hover:bg-gray-100"
                          type="email"
                          value={customerInfo.email || user.email}
                          onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                          placeholder="Email để nhận thông báo đơn hàng"
                        />
                      </div>
                    )}
                    
                    {/* Note field */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageCircle className="w-3 h-3" />
                        Ghi chú đơn hàng (tùy chọn)
                      </label>
                      <textarea
                        className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all duration-300 hover:bg-gray-100 resize-none"
                        rows={4}
                        value={customerInfo.note || ''}
                        onChange={e => setCustomerInfo({...customerInfo, note: e.target.value})}
                        placeholder="Ví dụ: Giao hàng buổi sáng, gọi trước 15 phút, để hàng tại bảo vệ..."
                      />
                    </div>
                  </div>
                  
                  {/* Auto-fill notification */}
                  {(customerInfo.name || customerInfo.phone || customerInfo.address) && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-blue-900 text-sm uppercase mb-1">Thông tin đã được lưu</h4>
                          <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            Chúng tôi đã tự động điền thông tin từ lần đặt hàng trước để tiết kiệm thời gian cho bạn. 
                            Bạn có thể chỉnh sửa bất kỳ thông tin nào nếu cần.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivery info */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-orange-25 rounded-2xl border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-black text-orange-900 uppercase">Thông tin giao hàng</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="font-black text-orange-800 text-xs uppercase">Thời gian</p>
                              <p className="text-orange-700 font-medium">1-3 ngày làm việc</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="font-black text-orange-800 text-xs uppercase">Phí ship</p>
                              <p className="text-orange-700 font-medium">Miễn phí toàn quốc</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="font-black text-orange-800 text-xs uppercase">Hỗ trợ</p>
                              <p className="text-orange-700 font-medium">0987.936.737</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                {/* Payment Method Selection - Enhanced */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-gray-900 uppercase">Phương thức thanh toán</h2>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      Bảo mật SSL
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* COD Payment Option */}
                    <button 
                      onClick={() => setPaymentMethod('COD')} 
                      className={`group relative p-8 rounded-[2rem] border-2 text-left transition-all duration-300 hover:shadow-lg ${
                        paymentMethod === 'COD' 
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-25 shadow-lg shadow-orange-100' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        paymentMethod === 'COD' 
                          ? 'border-orange-500 bg-orange-500' 
                          : 'border-gray-200 bg-white'
                      }`}>
                        {paymentMethod === 'COD' && (
                          <div className="w-full h-full rounded-full bg-white scale-50 animate-in zoom-in duration-200"></div>
                        )}
                      </div>
                      
                      {/* Icon with enhanced styling */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                        paymentMethod === 'COD' 
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200' 
                          : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                      }`}>
                        <Wallet className="w-8 h-8" />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-black text-gray-900 uppercase text-lg">Tiền mặt (COD)</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                          Thanh toán khi nhận hàng. Phù hợp cho mọi khách hàng.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                          <Truck className="w-3 h-3" />
                          Miễn phí vận chuyển
                        </div>
                      </div>
                      
                      {/* Hover effect */}
                      <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        paymentMethod === 'COD' ? 'opacity-100' : ''
                      }`}></div>
                    </button>

                    {/* Bank Transfer Payment Option */}
                    <button 
                      onClick={() => setPaymentMethod('BankTransfer')} 
                      className={`group relative p-8 rounded-[2rem] border-2 text-left transition-all duration-300 hover:shadow-lg ${
                        paymentMethod === 'BankTransfer' 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-25 shadow-lg shadow-blue-100' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        paymentMethod === 'BankTransfer' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-200 bg-white'
                      }`}>
                        {paymentMethod === 'BankTransfer' && (
                          <div className="w-full h-full rounded-full bg-white scale-50 animate-in zoom-in duration-200"></div>
                        )}
                      </div>
                      
                      {/* Icon with enhanced styling */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                        paymentMethod === 'BankTransfer' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                      }`}>
                        <CreditCard className="w-8 h-8" />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-black text-gray-900 uppercase text-lg">Chuyển khoản</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                          Chuyển khoản ngân hàng. Xử lý nhanh chóng và an toàn.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3" />
                          Bảo mật 256-bit SSL
                        </div>
                      </div>
                      
                      {/* Hover effect */}
                      <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        paymentMethod === 'BankTransfer' ? 'opacity-100' : ''
                      }`}></div>
                    </button>
                  </div>
                  
                  {/* Payment method details */}
                  <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-gray-900 text-sm uppercase">Lưu ý quan trọng</h4>
                        {paymentMethod === 'COD' ? (
                          <div className="space-y-1 text-sm text-gray-600 font-medium">
                            <p>• Vui lòng chuẩn bị đủ tiền mặt khi nhận hàng</p>
                            <p>• Kiểm tra kỹ sản phẩm trước khi thanh toán</p>
                            <p>• Đơn hàng sẽ được giao trong 1-3 ngày làm việc</p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm text-gray-600 font-medium">
                            <p>• Chuyển khoản đúng nội dung để xử lý nhanh chóng</p>
                            <p>• Đơn hàng được xác nhận sau khi nhận được tiền</p>
                            <p>• Hỗ trợ 24/7 qua hotline: <span className="font-black text-orange-600">0987.936.737</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile coupon section */}
                <div className="lg:hidden">
                   {renderCouponUI()}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-48">
            {renderCouponUI()}
            
            {/* Enhanced Order Summary */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-gray-900 uppercase">Tổng đơn hàng</h2>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Đã xác minh
                  </div>
                </div>
                
                {/* Order items preview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm ({cart.length})</span>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  <div className="space-y-2">
                    {cart.slice(0, 2).map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                          <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{item.quantity} × {item.price.toLocaleString()}đ</p>
                        </div>
                      </div>
                    ))}
                    {cart.length > 2 && (
                      <div className="text-[10px] text-gray-400 font-bold text-center py-2">
                        +{cart.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Price breakdown */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-gray-600 font-bold">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString()}đ</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-600 font-bold">
                    <span>Phí vận chuyển</span>
                    <span className="text-emerald-600 font-black">Miễn phí</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-black animate-in slide-in-from-right-2 duration-300">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        <span>Giảm giá</span>
                      </div>
                      <span>-{discount.toLocaleString()}đ</span>
                    </div>
                  )}
                  
                  {/* Divider with gradient */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-900"></div>
                    </div>
                  </div>
                  
                  {/* Total with enhanced styling */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-black text-gray-900 uppercase">Tổng cộng</span>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán chuyển khoản'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-orange-700 leading-none">
                        {total.toLocaleString()}đ
                      </div>
                      {discount > 0 && (
                        <div className="text-[10px] text-gray-400 font-bold line-through">
                          {subtotal.toLocaleString()}đ
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced CTA button */}
                <button 
                  onClick={step === 3 ? handleFinalCheckout : () => setStep((step + 1) as any)} 
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] relative overflow-hidden group"
                >
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {step === 3 ? (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Đặt hàng ngay
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-5 h-5" />
                        Tiếp tục
                      </>
                    )}
                  </div>
                </button>
                
                {/* Trust indicators */}
                <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Bảo mật
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-500" />
                    Giao nhanh
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-orange-500" />
                    Hỗ trợ 24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Checkout Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-[999] md:hidden">
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Price section with enhanced styling */}
            <div className="flex flex-col pl-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-orange-700">{total.toLocaleString()}đ</span>
                {discount > 0 && (
                  <span className="text-sm text-gray-400 font-bold line-through">{subtotal.toLocaleString()}đ</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {discount > 0 && (
                  <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-full">
                    Tiết kiệm {discount.toLocaleString()}đ
                  </span>
                )}
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                  {paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}
                </span>
              </div>
            </div>
            
            {/* Enhanced CTA button */}
            <button 
              onClick={step === 3 ? handleFinalCheckout : () => setStep((step + 1) as any)}
              className="flex-grow bg-gradient-to-r from-orange-600 to-orange-700 text-white h-16 px-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden group"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-center gap-2">
                {step === 3 ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Đặt hàng ngay
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Tiếp tục ({step}/3)
                  </>
                )}
              </div>
            </button>
          </div>
          
          {/* Progress indicator for mobile */}
          <div className="mt-3 flex justify-center">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-1 rounded-full transition-all duration-300 ${
                    step >= i ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BankTransferModal 
        isOpen={isBankModalOpen} 
        onConfirm={confirmBankTransfer} 
        onCancel={() => setIsBankModalOpen(false)}
        total={total} 
        orderId={currentOrderId} 
      />

      <OrderSuccessModal 
        isOpen={isSuccessModalOpen}
        orderId={currentOrderId}
        onClose={handleCloseSuccess}
      />
    </div>
  );
};

export default Cart;

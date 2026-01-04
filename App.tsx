
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User as UserIcon, Sprout, Phone, Facebook, MessageCircle, ArrowUp, X, MapPin, Mail, Clock, ChevronRight, History, AlertCircle, Menu } from 'lucide-react';
import { RootState, login, logout } from './store';
import { filterOrdersByCookie, loadUserOrders } from './utils/userOrders';
import { getCookieId } from './utils/cookieManager';
import { trackPageVisit } from './utils/analytics';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Trace from './pages/Trace';
import OrderHistory from './pages/OrderHistory';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import OrderTracking from './pages/OrderTracking';
import Dashboard from './admin/Dashboard';
import AdminProducts from './admin/Products';
import AdminNews from './admin/News';
import AdminCoupons from './admin/Coupons';
import AdminOrders from './admin/Orders';
import AdminClearData from './admin/ClearData';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import DataLoader from './components/DataLoader';
import BackendStatus from './components/BackendStatus';
import NewOrderNotification from './components/NewOrderNotification';
import AdminOrdersPoller from './components/AdminOrdersPoller';

// 1. Component Loading 1.2s chuyên nghiệp
const PageLoader = ({ isVisible, isFadingOut }: { isVisible: boolean, isFadingOut: boolean }) => {
  if (!isVisible) return null;
  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #fff7ed 100%)' }}
    >
      <style>{`
        .loader-shimmer {
          background: linear-gradient(to right, #431407 20%, #ea580c 40%, #f97316 50%, #ea580c 60%, #431407 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.5s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }
        @keyframes loading-bar {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(50%) scaleX(1); }
          100% { transform: translateX(250%) scaleX(0.5); }
        }
        .animate-loading-bar { animation: loading-bar 1.8s infinite cubic-bezier(0.65, 0, 0.35, 1); }
      `}</style>
      <div className="text-center flex flex-col items-center">
        <div className="w-20 h-20 text-orange-600 mb-6 animate-pulse">
          <Sprout size={80} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-[0.25em] mb-2 loader-shimmer">Ngọc Hường Farm</h1>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em] opacity-80">Nông sản sạch từ tâm</p>
        <div className="w-44 h-[3px] bg-slate-100 mt-8 rounded-full overflow-hidden shadow-inner">
          <div className="h-full w-2/5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
};

// 2. Nút cuộn lên đầu trang (Scroll To Top)
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!isVisible) return null;
  return (
    <button onClick={scrollToTop} className="fixed bottom-32 sm:bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-orange-600/90 backdrop-blur-md text-white rounded-full shadow-lg border border-white/20 hover:bg-orange-600 hover:-translate-y-1 transition-all active:scale-95 group">
      <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
};

// 3. Nút giỏ hàng nổi (Floating Cart Button)
const CartFloatingButton = () => {
  const cart = useSelector((state: RootState) => state.app.cart);
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isPulse, setIsPulse] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const totalItems = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  
  const totalPrice = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );
  
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Hiệu ứng pulse khi thêm sản phẩm
  useEffect(() => {
    if (totalItems > 0) {
      setIsPulse(true);
      const timer = setTimeout(() => setIsPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);
  
  // Ẩn nút khi đang ở trang giỏ hàng
  const isCartPage = location.pathname === '/cart';
  
  if (!isVisible || totalItems === 0 || isCartPage) return null;
  
  return (
    <div className="fixed bottom-48 sm:bottom-24 right-6 z-[100]">
      <Link 
        to="/cart"
        className={`relative w-14 h-14 flex items-center justify-center bg-green-600/90 backdrop-blur-md text-white rounded-full shadow-xl border-2 border-white/30 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95 group ${isPulse ? 'animate-bounce' : ''}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Giỏ hàng"
      >
        <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
        
        {/* Badge số lượng */}
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in-50 duration-200">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      </Link>
      
      {/* Tooltip chi tiết */}
      {showTooltip && (
        <div className="absolute bottom-0 right-16 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-200 min-w-[200px]">
          <div className="text-sm font-black text-gray-900 mb-2 uppercase tracking-tight">Giỏ hàng của bạn</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Số lượng:</span>
              <span className="font-black text-green-600">{totalItems} sản phẩm</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Tổng tiền:</span>
              <span className="font-black text-orange-600">{totalPrice.toLocaleString()}đ</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-[10px] text-gray-400 font-medium text-center">Click để xem chi tiết</div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cart = useSelector((state: RootState) => state.app.cart);
  const isAdmin = useSelector((state: RootState) => state.app.isAdmin);
  const user = useSelector((state: RootState) => state.app.user);
  const allOrders = useSelector((state: RootState) => state.app.orders);
  const dispatch = useDispatch();
  
  // Chỉ hiển thị số lượng orders của cookieId hiện tại
  const cookieId = getCookieId();
  const userOrdersCount = useMemo(() => {
    const filteredFromStore = filterOrdersByCookie(allOrders, cookieId, user);
    const cachedOrders = loadUserOrders(cookieId, user);
    const combined = [...filteredFromStore, ...cachedOrders];
    const uniqueOrders = combined.reduce((acc: any[], order: any) => {
      if (!acc.find((o: any) => o.id === order.id)) {
        acc.push(order);
      }
      return acc;
    }, []);
    return uniqueOrders.length;
  }, [allOrders, cookieId, user]);

  // Đóng mobile menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Đóng mobile menu khi resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Mobile Menu Button */}
            <div className="md:hidden mobile-menu-container">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Sprout className="text-orange-600 w-6 h-6" />
              <span className="text-xl font-bold text-orange-900">Ngọc Hường Farm</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Trang chủ</Link>
              <Link to="/products" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Sản phẩm</Link>
              <Link to="/orders" className="text-gray-600 hover:text-orange-600 font-medium transition-colors flex items-center gap-1">Đơn hàng {userOrdersCount > 0 && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">{userOrdersCount}</span>}</Link>
              <Link to="/news" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Tin tức</Link>
              <Link to="/track-order" className="text-orange-600 border border-orange-100 px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all">Tra cứu</Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-sm">{cart.length}</span>}
              </Link>
              {user ? (
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2 text-gray-600">
                    <UserIcon className="w-6 h-6" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                      {isAdmin && <Link to="/admin" className="block px-4 py-2 hover:bg-orange-50 font-bold" onClick={() => setIsUserMenuOpen(false)}>Quản trị</Link>}
                      {!isAdmin && <Link to="/orders" className="block px-4 py-2 hover:bg-orange-50 font-bold" onClick={() => setIsUserMenuOpen(false)}>Đơn hàng của tôi</Link>}
                      <button onClick={() => { dispatch(logout()); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold">Đăng xuất</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setIsLoginOpen(true)} className="p-2 text-gray-600"><UserIcon className="w-6 h-6" /></button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
               onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu Panel */}
        <div className={`md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out mobile-menu-container ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Mobile Menu Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-lg">Ngọc Hường Farm</h2>
                  <p className="text-[10px] text-orange-100 font-bold uppercase tracking-widest">Nông sản sạch từ tâm</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* User Info in Mobile Menu */}
            {user ? (
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className="text-[10px] text-orange-100 uppercase">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="w-full bg-white/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3 hover:bg-white/20 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span className="font-bold">Đăng nhập</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Items */}
          <div className="p-6 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Sprout className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Trang chủ</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Khám phá nông trại</p>
              </div>
            </Link>

            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Sản phẩm</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Nông sản tươi ngon</p>
              </div>
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">Đơn hàng</p>
                  {userOrdersCount > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-full">
                      {userOrdersCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Lịch sử mua hàng</p>
              </div>
            </Link>

            <Link
              to="/news"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Tin tức</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Kỹ thuật & mùa vụ</p>
              </div>
            </Link>

            <Link
              to="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 border-2 border-orange-100 hover:bg-orange-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <ChevronRight className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-orange-900">Tra cứu đơn hàng</p>
                <p className="text-[10px] text-orange-600 uppercase font-bold">Theo dõi vận chuyển</p>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-gray-50">
            {user && (
              <div className="space-y-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                  >
                    Quản trị hệ thống
                  </Link>
                )}
                <button
                  onClick={() => {
                    dispatch(logout());
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-center py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}
            
            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-orange-500" />
                  <span>0987.936.737</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  <span>Nghệ An</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {isLoginOpen && <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}
    </>
  );
};

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Kiểm tra đăng nhập admin (bảo mật, không hiển thị thông tin)
    if (email.trim() === 'admin' && password === '123') {
      dispatch(login({ 
        id: 'admin-1', 
        name: 'Quản Trị Viên', 
        email: 'admin', 
        role: 'admin' 
      }));
      onClose();
      // Redirect đến admin dashboard sau khi đăng nhập thành công
      setTimeout(() => {
        window.location.href = '#/admin';
      }, 100);
      return;
    }

    // Kiểm tra nếu là admin nhưng mật khẩu sai
    if (email.trim() === 'admin' && password !== '123') {
      setError('Thông tin đăng nhập không chính xác!');
      return;
    }

    // Đăng nhập người dùng thông thường
    dispatch(login({ 
      id: 'u' + Date.now(), 
      name: email.split('@')[0] || 'Khách hàng', 
      email, 
      role: 'user' 
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-orange-950/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-orange-600 p-8 text-white text-center">
          <Sprout className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase">Đăng Nhập</h2>
          <p className="text-[10px] text-orange-100 font-bold uppercase mt-2 tracking-widest opacity-80">Truy cập vào nông trại Ngọc Hường</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2 tracking-widest">Email / Tài khoản</label>
            <input 
              type="text" 
              required 
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 transition-all" 
              placeholder="Tài Khoản" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2 tracking-widest">Mật khẩu</label>
            <input 
              type="password" 
              required 
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-orange-500 transition-all" 
              placeholder="Mật khẩu của bạn" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase transition-transform active:scale-95 shadow-lg shadow-orange-100 mt-2">Đăng Nhập</button>
        </form>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X /></button>
        
        <div className="p-6 border-t border-gray-50 text-center">
           <p className="text-[10px] text-gray-400 font-bold uppercase">Chưa có tài khoản? <span className="text-orange-600 cursor-pointer">Đăng ký ngay</span></p>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-10">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex justify-center gap-2 mb-4">
        <Sprout className="text-orange-600 w-5 h-5" />
        <span className="text-sm font-black uppercase text-gray-900 tracking-wider">Ngọc Hường Farm</span>
      </div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">&copy; 2024 Ngọc Hường Farm. Cam kết nông sản Organic từ Hạnh Lâm.</p>
      <div className="flex justify-center gap-8">
        <Link to="/" className="text-[9px] font-black uppercase text-gray-500 hover:text-orange-600 transition-colors">Bảo mật</Link>
        <Link to="/" className="text-[9px] font-black uppercase text-gray-500 hover:text-orange-600 transition-colors">Giao hàng</Link>
        <Link to="/" className="text-[9px] font-black uppercase text-gray-500 hover:text-orange-600 transition-colors">Hỗ trợ</Link>
      </div>
    </div>
  </footer>
);

const ContactSection = () => {
  return (
    <section className="bg-gray-50 py-12 md:py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left space-y-3 lg:max-w-sm">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Ngọc Hường Farm</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Đặc sản cam Vinh - bưởi Da Xanh từ vùng đất Hạnh Lâm, Thanh Chương, Nghệ An.</p>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Thanh Chương, Nghệ An</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="tel:0987936737" className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all group">
              <div className="bg-orange-50 p-2 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Hotline</p>
                <p className="text-sm font-black text-gray-900">0987.936.737</p>
              </div>
            </a>
            <a href="https://zalo.me/0987936737" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Zalo OA</p>
                <p className="text-sm font-black text-gray-900">Nhắn tin ngay</p>
              </div>
            </a>
            <a href="https://facebook.com/Ngochuongfarm2016" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all group">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Facebook</p>
                <p className="text-sm font-black text-gray-900">Fanpage</p>
              </div>
            </a>
          </div>
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-2xl">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Hỗ trợ khách hàng</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-tight">06:00 - 18:00 Hàng ngày</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const location = useLocation();
  
  // Kiểm tra xem có đang ở trang admin không (trừ login page)
  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  // Track page visits (không track admin pages)
  useEffect(() => {
    if (!isAdminPage) {
      try {
        trackPageVisit(location.pathname);
      } catch (error) {
        console.error('[App] Error tracking page visit:', error);
      }
    }
  }, [location.pathname, isAdminPage]);

  useEffect(() => {
    setIsLoading(true);
    setIsFadingOut(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setIsLoading(false), 700);
    }, 1200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Quan trọng: Chỉ áp dụng transform/transition khi isLoading = true để tránh lỗi Fixed Positioning trên Mobile
  const containerClasses = isLoading 
    ? `flex flex-col flex-grow transition-all duration-700 ease-out ${isFadingOut ? 'opacity-0' : 'blur-md scale-95 opacity-50'}` 
    : "flex flex-col flex-grow opacity-100";

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden relative">
      <DataLoader />
      <PageLoader isVisible={isLoading} isFadingOut={isFadingOut} />
      
      <div className={containerClasses}>
        {/* Ẩn Navbar khi ở trang admin */}
        {!isAdminPage && <Navbar />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/trace" element={<Trace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNews /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/clear-data" element={<ProtectedRoute requireAdmin><AdminClearData /></ProtectedRoute>} />
          </Routes>
        </main>
        
        {/* Ẩn Footer khi ở trang admin */}
        {!isAdminPage && (
          <>
            <ContactSection />
            <Footer />
          </>
        )}
      </div>

      {/* Nút giỏ hàng nổi */}
      <CartFloatingButton />
      
      {/* Nút cuộn lên đầu trang */}
      <ScrollToTopButton />
      
      {/* Backend status indicator */}
      <BackendStatus />
      
      {/* Auto-polling orders for admin (chạy ngầm) */}
      <AdminOrdersPoller />
      
      {/* New order notification for admin */}
      <NewOrderNotification />
    </div>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;

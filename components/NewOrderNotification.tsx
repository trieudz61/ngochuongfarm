import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Order } from '../types';
import { ShoppingBag, X, Bell, User, DollarSign, Clock } from 'lucide-react';

const NewOrderNotification: React.FC = () => {
  const orders = useSelector((state: RootState) => state.app.orders);
  const isAdmin = useSelector((state: RootState) => state.app.isAdmin);
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFirstRender = useRef(true);

  // Khởi tạo audio notification (bell sound)
  useEffect(() => {
    // Tạo audio context để phát âm thanh thông báo
    const createNotificationSound = () => {
      // Sử dụng Web Audio API để tạo âm thanh bell đơn giản
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBellSound = () => {
        // Tạo oscillator cho âm thanh bell
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Âm thanh bell: 2 nốt liên tiếp
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Nốt thứ 2
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          
          osc2.frequency.setValueAtTime(1000, audioContext.currentTime);
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.5);
        }, 150);
      };
      
      return playBellSound;
    };

    if (isAdmin) {
      const playSound = createNotificationSound();
      audioRef.current = { play: playSound } as any;
    }
  }, [isAdmin]);

  // Theo dõi orders mới
  useEffect(() => {
    // Bỏ qua lần render đầu tiên
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setPreviousOrdersCount(orders.length);
      return;
    }

    // Chỉ thông báo khi admin đang online
    if (!isAdmin) return;

    // Kiểm tra nếu có đơn mới (số lượng tăng)
    if (orders.length > previousOrdersCount && previousOrdersCount > 0) {
      const numberOfNewOrders = orders.length - previousOrdersCount;
      
      // Lấy các đơn mới (giả sử orders được sort theo thời gian mới nhất trước)
      const latestOrders = orders.slice(0, numberOfNewOrders);
      
      console.log('[NewOrderNotification] Phát hiện đơn hàng mới:', latestOrders);
      
      setNewOrders(latestOrders);
      setShowNotification(true);
      
      // Phát âm thanh thông báo
      try {
        if (audioRef.current && audioRef.current.play) {
          audioRef.current.play();
        }
      } catch (error) {
        console.error('[NewOrderNotification] Lỗi phát âm thanh:', error);
      }
      
      // Tự động ẩn sau 10 giây
      setTimeout(() => {
        setShowNotification(false);
      }, 10000);
    }

    setPreviousOrdersCount(orders.length);
  }, [orders.length, previousOrdersCount, isAdmin]);

  const handleClose = () => {
    setShowNotification(false);
  };

  const handleViewOrder = (orderId: string) => {
    setShowNotification(false);
    // Navigate to orders page
    window.location.hash = `/admin/orders`;
  };

  if (!isAdmin || !showNotification || newOrders.length === 0) {
    return null;
  }

  const firstOrder = newOrders[0];

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 z-[999] pointer-events-none">
        {/* Notification popup */}
        <div className="absolute top-24 right-6 animate-in slide-in-from-right-5 duration-500 pointer-events-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-orange-500 overflow-hidden max-w-sm w-full">
            {/* Header với animation */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl animate-bounce">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">
                      Đơn Hàng Mới!
                    </h3>
                    <p className="text-orange-100 text-xs font-bold">
                      {newOrders.length} đơn hàng vừa được đặt
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Order info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Mã đơn hàng
                    </p>
                    <p className="font-black text-gray-900 text-sm truncate">
                      {firstOrder.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Khách hàng
                    </p>
                    <p className="font-black text-gray-900 text-sm truncate">
                      {firstOrder.customerInfo.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Tổng tiền
                    </p>
                    <p className="font-black text-green-600 text-lg">
                      {firstOrder.finalTotal.toLocaleString()}đ
                    </p>
                  </div>
                </div>

                {newOrders.length > 1 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                    <p className="text-sm font-black text-orange-600">
                      +{newOrders.length - 1} đơn hàng khác
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewOrder(firstOrder.id)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-orange-100"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-black uppercase text-xs transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Progress bar (auto close) */}
            <div className="h-1 bg-gray-100 overflow-hidden">
              <div 
                className="h-full bg-orange-500 animate-progress-shrink"
                style={{ animation: 'progressShrink 10s linear forwards' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-progress-shrink {
          animation: progressShrink 10s linear forwards;
        }
      `}</style>
    </>
  );
};

export default NewOrderNotification;



import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchOrders } from '../store';
import { Trash2, AlertTriangle, CheckCircle, Database, HardDrive, RefreshCw, BarChart3 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { clearAnalyticsData, getAnalytics } from '../utils/analytics';

const ClearData: React.FC = () => {
  const orders = useSelector((state: RootState) => state.app.orders);
  const dispatch = useDispatch<AppDispatch>();
  const [isClearing, setIsClearing] = useState(false);
  const [clearStatus, setClearStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState(() => {
    try {
      return getAnalytics();
    } catch (error) {
      console.error('[ClearData] Error loading analytics:', error);
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        todayVisits: 0,
        weeklyVisits: 0,
        monthlyVisits: 0,
        topPages: [],
        hourlyData: [],
        dailyData: [],
        recentVisitors: []
      };
    }
  });

  // Fetch all orders khi component mount để biết có bao nhiêu đơn
  useEffect(() => {
    console.log('[ClearData] Fetching all orders...');
    dispatch(fetchOrders(null)); // null = fetch all orders (admin mode)
  }, [dispatch]);

  // Refresh analytics data
  const refreshAnalytics = () => {
    try {
      setAnalytics(getAnalytics());
    } catch (error) {
      console.error('[ClearData] Error refreshing analytics:', error);
    }
  };

  const handleClearDatabase = async () => {
    const confirmText = `⚠️ CẢNH BÁO NGHIÊM TRỌNG!\n\nBạn sắp XÓA VĨNH VIỄN TẤT CẢ ${orders.length} ĐỚN HÀNG trong:\n- Database (SQLite)\n- Redux State\n- LocalStorage (tất cả user)\n\nHành động này KHÔNG THỂ HOÀN TÁC!\n\nGõ "XOA TAT CA" để xác nhận:`;
    
    const userInput = prompt(confirmText);
    
    if (userInput !== 'XOA TAT CA') {
      alert('❌ Đã hủy thao tác xóa.');
      return;
    }

    setIsClearing(true);
    setClearStatus('idle');
    setMessage('');

import { getApiUrl } from '../src/config/api.js';

// ... existing code ...

    try {
      // 1. Xóa tất cả orders trong database qua API
      const response = await fetch(`${getApiUrl('/api')}/orders/admin/clear-all?secret=ngochuongfarm2024`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': 'ngochuongfarm2024'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to clear database: ${response.status}`);
      }

      const result = await response.json();
      console.log('[ClearData] Database cleared:', result);

      // 2. Xóa tất cả orders trong Redux state
      // (Dispatch action để clear orders - tạm thời dùng cách trực tiếp)
      window.location.reload(); // Reload để fetch lại data từ API (đã rỗng)

      // 3. Clear ALL localStorage keys liên quan đến orders
      clearAllOrdersFromLocalStorage();

      setClearStatus('success');
      setMessage(`✅ Đã xóa thành công ${result.data?.count || 0} đơn hàng!\n\nTrang sẽ tự động reload sau 2 giây...`);
      
      // Reload sau 2 giây
      setTimeout(() => {
        window.location.href = '#/admin';
      }, 2000);

    } catch (error: any) {
      console.error('[ClearData] Error:', error);
      setClearStatus('error');
      setMessage(`❌ Lỗi: ${error.message || 'Không thể xóa dữ liệu'}`);
    } finally {
      setIsClearing(false);
    }
  };

  const clearAllOrdersFromLocalStorage = () => {
    console.log('[ClearData] Clearing all orders from localStorage...');
    let clearedCount = 0;

    // Lấy tất cả keys trong localStorage
    const allKeys = Object.keys(localStorage);
    
    // Xóa tất cả keys liên quan đến orders
    allKeys.forEach(key => {
      if (key.includes('orders') || key.includes('Orders')) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log(`[ClearData] Removed localStorage key: ${key}`);
      }
    });

    console.log(`[ClearData] Cleared ${clearedCount} localStorage keys`);
  };

  const handleClearLocalStorageOnly = () => {
    if (!confirm('⚠️ Xóa TẤT CẢ orders khỏi LocalStorage?\n\nChỉ xóa cache trên browser này, không ảnh hưởng database.')) {
      return;
    }

    clearAllOrdersFromLocalStorage();
    alert('✅ Đã xóa tất cả orders khỏi localStorage!\n\nTrang sẽ reload để cập nhật...');
    window.location.reload();
  };

  const handleClearAnalytics = () => {
    if (!confirm(`⚠️ Xóa tất cả ${analytics.totalVisits} lượt truy cập?\n\nDữ liệu analytics sẽ bị xóa vĩnh viễn!`)) {
      return;
    }

    clearAnalyticsData();
    refreshAnalytics();
    alert('✅ Đã xóa tất cả dữ liệu analytics!');
  };

  return (
    <AdminLayout 
      title="Xóa Dữ Liệu Hệ Thống" 
      subtitle="Công cụ quản trị cấp cao - Sử dụng thận trọng"
      backTo="/admin"
    >
      <div className="max-w-4xl mx-auto">
        {/* Warning Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 mb-8 flex items-start gap-6">
          <div className="bg-red-600 p-4 rounded-2xl text-white shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-red-900 uppercase mb-2">Cảnh Báo Quan Trọng</h2>
            <p className="text-red-700 font-bold text-sm leading-relaxed">
              Các thao tác dưới đây sẽ <span className="underline">XÓA VĨNH VIỄN</span> dữ liệu và <span className="underline">KHÔNG THỂ HOÀN TÁC</span>. 
              Chỉ sử dụng khi cần thiết (testing, reset hệ thống).
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4 ${
            clearStatus === 'success' 
              ? 'bg-green-50 border-2 border-green-200 text-green-900' 
              : 'bg-red-50 border-2 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {clearStatus === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <span className="font-black uppercase text-sm">
                {clearStatus === 'success' ? 'Thành Công' : 'Lỗi'}
              </span>
            </div>
            <p className="font-bold text-sm whitespace-pre-line">{message}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-orange-50 p-3 rounded-2xl w-fit mb-4">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Đơn hàng trong State
            </div>
            <div className="text-3xl font-black text-gray-900">{orders.length}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 p-3 rounded-2xl w-fit mb-4">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
              LocalStorage Keys
            </div>
            <div className="text-3xl font-black text-gray-900">
              {Object.keys(localStorage).filter(k => k.includes('order')).length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-green-50 p-3 rounded-2xl w-fit mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Lượt truy cập
            </div>
            <div className="text-3xl font-black text-gray-900">{analytics.totalVisits}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-purple-50 p-3 rounded-2xl w-fit mb-4">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Trạng thái
            </div>
            <div className="text-lg font-black text-gray-900">
              {isClearing ? 'Đang xóa...' : 'Sẵn sàng'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Clear All (Database + LocalStorage) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-red-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase mb-2 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-600" />
                  Xóa Tất Cả Đơn Hàng
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Xóa toàn bộ {orders.length} đơn hàng khỏi:<br/>
                  • Database SQLite<br/>
                  • Redux State<br/>
                  • LocalStorage (tất cả user)
                </p>
              </div>
            </div>
            <button
              onClick={handleClearDatabase}
              disabled={isClearing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <Trash2 className="w-5 h-5" />
              {isClearing ? 'Đang Xóa...' : orders.length > 0 ? `Xóa Tất Cả ${orders.length} Đơn Hàng` : 'Xóa Tất Cả (Database + Cache)'}
            </button>
          </div>

          {/* Clear LocalStorage Only */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase mb-2 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  Xóa Cache LocalStorage
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Chỉ xóa orders trong cache browser này.<br/>
                  Database vẫn giữ nguyên, orders sẽ load lại từ server.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearLocalStorageOnly}
              disabled={isClearing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 text-sm"
            >
              <HardDrive className="w-4 h-4" />
              Xóa Cache Browser
            </button>
          </div>

          {/* Clear Analytics Data */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Xóa Dữ Liệu Analytics
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Xóa tất cả {analytics.totalVisits} lượt truy cập và {analytics.uniqueVisitors} khách duy nhất.<br/>
                  Thống kê sẽ được reset về 0.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearAnalytics}
              disabled={isClearing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Xóa Analytics ({analytics.totalVisits} lượt)
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            Hướng dẫn sử dụng
          </h4>
          <ul className="text-sm text-gray-600 space-y-2 font-medium">
            <li>• <strong>Xóa Tất Cả:</strong> Dùng khi cần reset toàn bộ hệ thống (testing, demo)</li>
            <li>• <strong>Xóa Cache:</strong> Dùng khi gặp lỗi đồng bộ giữa browser và server</li>
            <li>• <strong>Xóa Analytics:</strong> Reset thống kê truy cập về 0</li>
            <li>• <strong>Sau khi xóa:</strong> Trang sẽ tự động reload để cập nhật dữ liệu mới</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClearData;


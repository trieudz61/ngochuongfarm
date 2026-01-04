
import React, { useEffect, useMemo } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Plus, 
  TrendingUp, 
  Newspaper,
  Ticket,
  ListOrdered,
  FileText,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchOrders } from '../store';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import RevenueChart from '../components/RevenueChart';
import AnalyticsChart from '../components/AnalyticsChart';
import { getAnalytics } from '../utils/analytics';

const Dashboard: React.FC = () => {
  const products = useSelector((state: RootState) => state.app.products);
  const orders = useSelector((state: RootState) => state.app.orders);
  const news = useSelector((state: RootState) => state.app.news);
  const coupons = useSelector((state: RootState) => state.app.coupons);
  const dispatch = useDispatch<AppDispatch>();

  // Fetch all orders khi Dashboard mount (để tính doanh thu)
  useEffect(() => {
    console.log('[Dashboard] Fetching all orders for statistics...');
    dispatch(fetchOrders(null)); // null = fetch all orders (admin mode)
  }, [dispatch]);

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.finalTotal, 0);
  
  const analytics = React.useMemo(() => {
    try {
      return getAnalytics();
    } catch (error) {
      console.error('[Dashboard] Error loading analytics:', error);
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
  }, []);

  const stats = [
    { label: 'Doanh thu tổng', value: totalRevenue.toLocaleString() + 'đ', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Tổng đơn hàng', value: orders.length.toString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lượt truy cập', value: analytics.totalVisits.toString(), icon: Eye, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Khách duy nhất', value: analytics.uniqueVisitors.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AdminLayout 
      title="Bảng Quản Trị" 
      subtitle="Chào mừng quay trở lại, Admin Ngọc Hường."
      backTo={undefined}
    >
      <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
            <Link to="/admin/orders" className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-1 md:gap-2 shadow-lg shadow-blue-100 transition-all text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest">
              <ListOrdered className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> 
              <span>Đơn Hàng</span>
            </Link>
            <Link to="/admin/products" className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-2 md:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-1 md:gap-2 shadow-lg shadow-orange-100 transition-all text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest">
              <Package className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> 
              <span>Sản Phẩm</span>
            </Link>
            <Link to="/admin/news" className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-2 md:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-1 md:gap-2 shadow-lg shadow-indigo-100 transition-all text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest">
              <Newspaper className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> 
              <span>Tin Tức</span>
            </Link>
            <Link to="/admin/coupons" className="flex-1 md:flex-none bg-white text-emerald-600 border border-emerald-100 px-2 md:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-1 md:gap-2 shadow-sm text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest">
              <Ticket className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> 
              <span>Mã Giảm Giá</span>
            </Link>
      </div>
      
      {/* Warning: Clear Data Tool */}
      {orders.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="bg-red-600 p-3 rounded-xl text-white flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-red-900 uppercase">Công cụ quản trị nâng cao</h3>
              <p className="text-xs text-red-700 font-medium">Xóa tất cả dữ liệu đơn hàng (Database + Cache)</p>
            </div>
          </div>
          <Link 
            to="/admin/clear-data"
            className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg whitespace-nowrap flex-shrink-0"
          >
            Xóa Dữ Liệu
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10 overflow-hidden">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl w-fit mb-4`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 truncate">{stat.label}</div>
              <div className="text-lg md:text-2xl font-black text-gray-900 tracking-tight truncate">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <RevenueChart orders={orders} />
          <AnalyticsChart />
        </div>

    </AdminLayout>
  );
};

export default Dashboard;

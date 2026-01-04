import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Clock, 
  Globe, 
  Smartphone,
  Monitor,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { getAnalytics, getRealTimeStats } from '../utils/analytics';

interface AnalyticsChartProps {
  className?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState(() => {
    try {
      return getAnalytics();
    } catch (error) {
      console.error('[AnalyticsChart] Error loading analytics:', error);
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
  
  const [realTimeStats, setRealTimeStats] = useState(() => {
    try {
      return getRealTimeStats();
    } catch (error) {
      console.error('[AnalyticsChart] Error loading real-time stats:', error);
      return {
        activeNow: 0,
        lastHour: 0,
        currentSessions: 0
      };
    }
  });
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'pages' | 'visitors'>('overview');

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getAnalytics());
      setRealTimeStats(getRealTimeStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    try {
      setAnalytics(getAnalytics());
      setRealTimeStats(getRealTimeStats());
    } catch (error) {
      console.error('[AnalyticsChart] Error refreshing data:', error);
    }
  };

  const formatPageName = (page: string): string => {
    const pageNames: { [key: string]: string } = {
      '/': 'Trang chủ',
      '/products': 'Sản phẩm',
      '/cart': 'Giỏ hàng',
      '/news': 'Tin tức',
      '/orders': 'Đơn hàng',
      '/track-order': 'Tra cứu'
    };
    return pageNames[page] || page;
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className={`bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Thống kê truy cập</h3>
              <p className="text-blue-100 text-sm font-medium">Lượt truy cập khách hàng real-time</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'overview', label: 'Tổng quan', icon: Eye },
            { id: 'pages', label: 'Trang phổ biến', icon: Globe },
            { id: 'visitors', label: 'Khách truy cập', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold transition-colors ${
                selectedTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Đang online</span>
                </div>
                <div className="text-2xl font-black text-green-800">{realTimeStats.activeNow}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">1 giờ qua</span>
                </div>
                <div className="text-2xl font-black text-blue-800">{realTimeStats.lastHour}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Hôm nay</span>
                </div>
                <div className="text-2xl font-black text-orange-800">{analytics.todayVisits}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Khách duy nhất</span>
                </div>
                <div className="text-2xl font-black text-purple-800">{analytics.uniqueVisitors}</div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-black text-gray-700 uppercase">Tuần này</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{analytics.weeklyVisits}</div>
                <div className="text-xs text-gray-500 font-medium">lượt truy cập</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-black text-gray-700 uppercase">Tháng này</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{analytics.monthlyVisits}</div>
                <div className="text-xs text-gray-500 font-medium">lượt truy cập</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-black text-gray-700 uppercase">Tổng cộng</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{analytics.totalVisits}</div>
                <div className="text-xs text-gray-500 font-medium">lượt truy cập</div>
              </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="text-sm font-black text-gray-700 uppercase mb-4">Lượt truy cập 30 ngày qua</h4>
              <div className="flex items-end gap-1 h-32">
                {analytics.dailyData.map((day, index) => {
                  const maxVisits = Math.max(...analytics.dailyData.map(d => d.visits));
                  const height = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-blue-200 hover:bg-blue-400 transition-colors rounded-t-sm relative group cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: ${day.visits} lượt truy cập, ${day.uniqueVisitors} khách duy nhất`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.date}<br/>
                        {day.visits} lượt<br/>
                        {day.uniqueVisitors} khách
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'pages' && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-700 uppercase">Trang được truy cập nhiều nhất</h4>
            {analytics.topPages.length > 0 ? (
              <div className="space-y-3">
                {analytics.topPages.map((page, index) => {
                  const maxVisits = analytics.topPages[0]?.visits || 1;
                  const percentage = (page.visits / maxVisits) * 100;
                  
                  return (
                    <div key={page.page} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900">{formatPageName(page.page)}</span>
                          <span className="text-sm font-black text-blue-600">{page.visits} lượt</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Chưa có dữ liệu truy cập</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'visitors' && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-700 uppercase">Khách truy cập gần đây</h4>
            {analytics.recentVisitors.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics.recentVisitors.map((visitor, index) => (
                  <div key={visitor.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(visitor.userAgent)}
                      <div className={`w-2 h-2 rounded-full ${visitor.isReturning ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">{formatPageName(visitor.page)}</span>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          visitor.isReturning 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {visitor.isReturning ? 'Quay lại' : 'Mới'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {new Date(visitor.timestamp).toLocaleString('vi-VN')} • 
                        {visitor.cookieId.slice(-8)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Chưa có khách truy cập</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;
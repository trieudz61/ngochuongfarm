import React from 'react';
import { Order } from '../types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface RevenueChartProps {
  orders: Order[];
}

interface RevenueData {
  completed: number;      // Delivered, Paid
  processing: number;     // Pending, Processing, Shipped
  cancelled: number;      // Cancelled
}

const RevenueChart: React.FC<RevenueChartProps> = ({ orders }) => {
  // Tính doanh thu theo trạng thái
  const revenueData: RevenueData = orders.reduce(
    (acc, order) => {
      const amount = order.finalTotal;
      
      // Đã hoàn thành (đã thu tiền)
      if (order.status === 'Delivered' || order.status === 'Paid') {
        acc.completed += amount;
      }
      // Đang xử lý (chưa thu tiền)
      else if (order.status === 'Pending' || order.status === 'Processing' || order.status === 'Shipped') {
        acc.processing += amount;
      }
      // Đã hủy (mất tiền)
      else if (order.status === 'Cancelled') {
        acc.cancelled += amount;
      }
      
      return acc;
    },
    { completed: 0, processing: 0, cancelled: 0 }
  );

  const total = revenueData.completed + revenueData.processing + revenueData.cancelled;
  
  // Tính phần trăm
  const completedPercent = total > 0 ? (revenueData.completed / total) * 100 : 0;
  const processingPercent = total > 0 ? (revenueData.processing / total) * 100 : 0;
  const cancelledPercent = total > 0 ? (revenueData.cancelled / total) * 100 : 0;

  // Tạo gradient cho biểu đồ tròn
  const createConicGradient = () => {
    if (total === 0) return 'conic-gradient(#e5e7eb 0% 100%)';
    
    let gradientStops = [];
    let currentAngle = 0;
    
    // Màu xanh lá (hoàn thành)
    if (completedPercent > 0) {
      const endAngle = currentAngle + completedPercent;
      gradientStops.push(`#10b981 ${currentAngle}% ${endAngle}%`);
      currentAngle = endAngle;
    }
    
    // Màu cam (đang xử lý)
    if (processingPercent > 0) {
      const endAngle = currentAngle + processingPercent;
      gradientStops.push(`#f97316 ${currentAngle}% ${endAngle}%`);
      currentAngle = endAngle;
    }
    
    // Màu đỏ (đã hủy)
    if (cancelledPercent > 0) {
      const endAngle = currentAngle + cancelledPercent;
      gradientStops.push(`#ef4444 ${currentAngle}% ${endAngle}%`);
      currentAngle = endAngle;
    }
    
    return `conic-gradient(${gradientStops.join(', ')})`;
  };

  const stats = [
    {
      label: 'Đã hoàn thành',
      value: revenueData.completed,
      percent: completedPercent,
      color: 'text-green-600',
      bg: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      count: orders.filter(o => o.status === 'Delivered' || o.status === 'Paid').length
    },
    {
      label: 'Đang xử lý',
      value: revenueData.processing,
      percent: processingPercent,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: Clock,
      count: orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped').length
    },
    {
      label: 'Đã hủy',
      value: revenueData.cancelled,
      percent: cancelledPercent,
      color: 'text-red-600',
      bg: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: XCircle,
      count: orders.filter(o => o.status === 'Cancelled').length
    }
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">
        Phân Tích Doanh Thu
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Biểu đồ tròn */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Vòng ngoài (biểu đồ) */}
            <div 
              className="w-64 h-64 rounded-full relative shadow-lg"
              style={{
                background: createConicGradient()
              }}
            >
              {/* Vòng trong (tạo hình donut) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 bg-white rounded-full shadow-inner flex flex-col items-center justify-center">
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                    Tổng doanh thu
                  </div>
                  <div className="text-3xl font-black text-gray-900">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-sm font-black text-gray-500">đồng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Số đơn hàng */}
          <div className="mt-6 text-center">
            <div className="text-sm font-black text-gray-500 uppercase tracking-widest">
              {orders.length} đơn hàng
            </div>
          </div>
        </div>

        {/* Thống kê chi tiết */}
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`${stat.bg} ${stat.borderColor} border-2 rounded-2xl p-5 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${stat.bg} p-2 rounded-xl ${stat.color} border ${stat.borderColor}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      {stat.label}
                    </div>
                    <div className={`text-xs font-bold ${stat.color}`}>
                      {stat.count} đơn hàng
                    </div>
                  </div>
                </div>
                <div className={`text-2xl font-black ${stat.color}`}>
                  {stat.percent.toFixed(1)}%
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-white rounded-full h-2 mb-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-full ${stat.color.replace('text-', 'bg-')} transition-all duration-500`}
                  style={{ width: `${stat.percent}%` }}
                ></div>
              </div>
              
              <div className={`text-xl font-black ${stat.color} text-right`}>
                {stat.value.toLocaleString()}đ
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chú thích màu */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Đã hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Đang xử lý</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Đã hủy</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;



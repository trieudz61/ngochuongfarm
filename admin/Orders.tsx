
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, updateOrderStatus as updateOrderStatusThunk, deleteOrder, fetchOrders } from '../store';
import { 
  ShoppingBag, Calendar, User, MapPin, Phone, 
  ChevronRight, Clock, CheckCircle, Truck, XCircle,
  CreditCard, Wallet, Search, Eye, X, Mail, FileText,
  AlertCircle, ArrowLeft, ChevronUp, ChevronDown, ArrowUpDown, Trash2
} from 'lucide-react';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import { getStatusTranslation, getStatusColor, formatDateTime } from '../utils/orderStatus';
import { vietnameseSearch } from '../utils/vietnameseHelper';
import AdminLayout from '../components/AdminLayout';

const OrderDetailsModal = ({ order, isOpen, onClose, onUpdateStatus, onDeleteOrder }: { 
  order: Order | null, 
  isOpen: boolean, 
  onClose: () => void,
  onUpdateStatus: (status: Order['status']) => void,
  onDeleteOrder: (orderId: string) => void
}) => {
  if (!isOpen || !order) return null;

  const statusOptions: Order['status'][] = ['Pending', 'Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-orange-950/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gray-900 p-6 sm:p-8 text-white flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Chi tiết đơn hàng</span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">/ {order.id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Quản Lý Đơn Hàng</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Status & Payment */}
            <div className="md:col-span-2 space-y-6">
               <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Trạng thái hiện tại</h3>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                       {getStatusTranslation(order.status)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {statusOptions.map(status => (
                      <button 
                        key={status}
                        onClick={() => onUpdateStatus(status)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          order.status === status 
                            ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100 scale-105' 
                            : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-600'
                        }`}
                      >
                        {getStatusTranslation(status)}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Items List */}
               <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Danh sách sản phẩm
                  </h3>
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-4">
                          <img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                          <div>
                            <div className="font-black text-gray-900 text-sm leading-tight">{item.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} kg x {item.price.toLocaleString()}đ</div>
                          </div>
                        </div>
                        <div className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}đ</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100 space-y-3">
                     <div className="flex justify-between text-gray-500 font-bold text-sm">
                        <span>Tạm tính</span>
                        <span>{order.total.toLocaleString()}đ</span>
                     </div>
                     <div className="flex justify-between text-red-500 font-bold text-sm">
                        <span>Giảm giá</span>
                        <span>-{order.discountTotal.toLocaleString()}đ</span>
                     </div>
                     <div className="flex justify-between items-center pt-2">
                        <span className="font-black text-gray-900 uppercase text-xs">Tổng cộng</span>
                        <span className="text-2xl font-black text-orange-700">{order.finalTotal.toLocaleString()}đ</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Customer Info Sidebar */}
            <div className="space-y-6">
               <div className="bg-orange-50 rounded-3xl p-6 sm:p-8 border border-orange-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center gap-2">
                    <User className="w-4 h-4" /> Khách hàng
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                       <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm"><User className="w-4 h-4" /></div>
                       <div>
                          <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-0.5">Họ tên</p>
                          <p className="font-black text-gray-900 text-sm leading-tight">{order.customerInfo.name}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm"><Phone className="w-4 h-4" /></div>
                       <div>
                          <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-0.5">Điện thoại</p>
                          <p className="font-black text-gray-900 text-sm">{order.customerInfo.phone}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm"><Mail className="w-4 h-4" /></div>
                       <div>
                          <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-0.5">Email</p>
                          <p className="font-black text-gray-900 text-sm break-all">{order.customerInfo.email || 'N/A'}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm"><MapPin className="w-4 h-4" /></div>
                       <div>
                          <p className="text-[8px] font-black uppercase text-orange-300 tracking-widest mb-0.5">Địa chỉ</p>
                          <p className="font-bold text-gray-700 text-xs leading-relaxed">{order.customerInfo.address}</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Thanh toán
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        {order.paymentMethod === 'BankTransfer' ? <CreditCard className="text-orange-500 w-5 h-5" /> : <Wallet className="text-orange-500 w-5 h-5" />}
                        <span className="font-black uppercase text-[10px] tracking-widest">{order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản' : 'Tiền mặt (COD)'}</span>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">Ghi chú đơn hàng</p>
                        <p className="text-xs font-medium text-white/70 italic leading-relaxed">
                          {order.customerInfo.note || 'Không có ghi chú.'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
          <button 
            onClick={() => {
              if (window.confirm(`⚠️ Xác nhận xóa đơn hàng ${order.id}?\n\nĐơn hàng sẽ bị xóa vĩnh viễn và doanh thu sẽ được cập nhật.`)) {
                onDeleteOrder(order.id);
              }
            }}
            className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Xóa Đơn
          </button>
          <button 
            onClick={onClose}
            className="bg-white border-2 border-gray-200 text-gray-500 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

type SortField = 'id' | 'createdAt' | 'customerName' | 'finalTotal' | 'status' | null;
type SortDirection = 'asc' | 'desc' | null;
type StatusFilter = 'all' | Order['status'];

const STATUS_TABS: { value: StatusFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Tất cả', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { value: 'Pending', label: 'Chờ xử lý', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'Processing', label: 'Đang xử lý', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'Paid', label: 'Đã thanh toán', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { value: 'Shipped', label: 'Đang giao', icon: <Truck className="w-3.5 h-3.5" /> },
  { value: 'Delivered', label: 'Hoàn thành', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { value: 'Cancelled', label: 'Đã hủy', icon: <XCircle className="w-3.5 h-3.5" /> },
];

const AdminOrders: React.FC = () => {
  const orders = useSelector((state: RootState) => state.app.orders);
  const isAdmin = useSelector((state: RootState) => state.app.isAdmin);
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch ALL orders khi component mount (admin cần thấy tất cả đơn)
  useEffect(() => {
    console.log('[AdminOrders] Fetching all orders for admin...');
    dispatch(fetchOrders(null)); // null = fetch all orders (admin mode)
  }, [dispatch]);

  // Đếm số đơn theo từng trạng thái
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: orders.length,
      Pending: 0,
      Processing: 0,
      Paid: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Filter orders với hỗ trợ tiếng Việt và theo trạng thái
  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    
    // Lọc theo search
    if (search.trim()) {
      result = result.filter(o => {
        if (vietnameseSearch(o.id, search)) return true;
        if (vietnameseSearch(o.customerInfo.name, search)) return true;
        if (o.customerInfo.phone.includes(search)) return true;
        if (o.customerInfo.address && vietnameseSearch(o.customerInfo.address, search)) return true;
        if (o.customerInfo.email && vietnameseSearch(o.customerInfo.email, search)) return true;
        const statusVietnamese = getStatusTranslation(o.status);
        if (vietnameseSearch(statusVietnamese, search)) return true;
        return false;
      });
    }
    
    return result;
  }, [orders, search, statusFilter]);

  // Sort orders (mặc định: mới nhất trước)
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'customerName':
          aValue = a.customerInfo.name.toLowerCase();
          bValue = b.customerInfo.name.toLowerCase();
          break;
        case 'finalTotal':
          aValue = a.finalTotal;
          bValue = b.finalTotal;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredOrders, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Nếu đang sort cột này, đảo chiều
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // Sort cột mới
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-3 h-3" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-3 h-3" />;
    }
    return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (status: Order['status']) => {
    if (selectedOrder) {
      try {
        await dispatch(updateOrderStatusThunk({ id: selectedOrder.id, status })).unwrap();
        // Cập nhật state cục bộ để giao diện thay đổi ngay lập tức
        setSelectedOrder({ ...selectedOrder, status });
        
        // Cập nhật order trong danh sách để UI refresh ngay
        // Redux store sẽ tự động cập nhật qua extraReducers
        
        // Lưu lại vào localStorage để đồng bộ với user
        try {
          const ordersData = localStorage.getItem('orders');
          if (ordersData) {
            const parsed = JSON.parse(ordersData);
            // Handle cả format array trực tiếp và object {data: [...]}
            const existingOrders = Array.isArray(parsed) ? parsed : (parsed.data || []);
            
            const orderIndex = existingOrders.findIndex((o: Order) => o.id === selectedOrder.id);
            if (orderIndex !== -1) {
              existingOrders[orderIndex].status = status;
              // Lưu lại theo format cũ (array trực tiếp)
              localStorage.setItem('orders', JSON.stringify(existingOrders));
            }
          }
        } catch (storageError) {
          console.error('[Orders] Error updating localStorage:', storageError);
          // Không block nếu localStorage fail
        }
      } catch (error: any) {
        alert(error || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      setIsDetailsOpen(false);
      setSelectedOrder(null);
      alert('✅ Đã xóa đơn hàng thành công!');
    } catch (error: any) {
      alert('❌ ' + (error || 'Có lỗi xảy ra khi xóa đơn hàng'));
    }
  };

  return (
    <AdminLayout 
      title="Quản Lý Đơn Hàng" 
      subtitle={`Xử lý ${orders.length} đơn hàng đã nhận từ khách hàng.`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
        <div className="flex-1">
          {/* Title is now handled by AdminLayout */}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm mã đơn, tên, sđt..." 
            className="w-full bg-white border-2 border-transparent focus:border-orange-500 pl-12 pr-4 py-3.5 rounded-2xl outline-none font-bold text-sm shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 min-w-max">
          {STATUS_TABS.map(tab => {
            const count = statusCounts[tab.value];
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                  isActive ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-gray-100">
             <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-orange-200" />
             </div>
             <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Chưa có đơn hàng nào khớp với tìm kiếm</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th 
                      className="px-8 py-6 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Mã Đơn / Ngày Đặt
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-6 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center gap-2">
                        Khách Hàng
                        {getSortIcon('customerName')}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-6 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort('finalTotal')}
                    >
                      <div className="flex items-center gap-2">
                        Tổng Tiền
                        {getSortIcon('finalTotal')}
                      </div>
                    </th>
                    <th className="px-8 py-6">Thanh Toán</th>
                    <th 
                      className="px-8 py-6 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Trạng Thái
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-8 py-6 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedOrders.map(order => {
                    const dateTime = formatDateTime(order.createdAt);
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => handleOpenDetails(order)}
                        className="hover:bg-orange-50/50 transition-all cursor-pointer group"
                      >
                        <td className="px-8 py-6">
                          <div className="font-black text-gray-900 text-sm mb-0.5 group-hover:text-orange-600 transition-colors">{order.id}</div>
                          <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {dateTime.date}
                          </div>
                          <div className="text-[9px] text-gray-500 font-bold mt-0.5">{dateTime.time}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-gray-900 text-sm mb-0.5">{order.customerInfo.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mb-1">
                            <Phone className="w-3 h-3" /> {order.customerInfo.phone}
                          </div>
                          <div className="text-[9px] text-gray-500 font-medium flex items-start gap-1 line-clamp-2">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{order.customerInfo.address}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-orange-700 text-sm">{order.finalTotal.toLocaleString()}đ</div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase">{order.items.length} món</div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-500">
                             {order.paymentMethod === 'BankTransfer' ? <CreditCard className="w-3 h-3 text-orange-500" /> : <Wallet className="w-3 h-3 text-orange-500" />}
                             {order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản' : 'COD'}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {getStatusTranslation(order.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-5 h-5 text-orange-600" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={handleDeleteOrder}
      />
    </AdminLayout>
  );
};

export default AdminOrders;

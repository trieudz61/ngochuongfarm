
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, createCoupon, updateCoupon, deleteCoupon } from '../store';
import { Plus, Edit2, Trash2, Search, X, Check, Ticket, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Coupon } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminCoupons: React.FC = () => {
  const coupons = useSelector((state: RootState) => state.app.coupons);
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percent',
    discountValue: 0,
    minOrderValue: 0,
    expiryDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const handleEdit = (item: Coupon) => {
    setEditingCoupon(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này vĩnh viễn?')) {
      try {
        await dispatch(deleteCoupon(id)).unwrap();
      } catch (error: any) {
        alert(error || 'Có lỗi xảy ra khi xóa mã giảm giá');
      }
    }
  };

  const handleToggle = async (item: Coupon) => {
    try {
      await dispatch(updateCoupon({ id: item.id, coupon: { ...item, isActive: !item.isActive } })).unwrap();
    } catch (error: any) {
      alert(error || 'Có lỗi xảy ra khi cập nhật mã giảm giá');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.discountValue === undefined) {
      alert('Vui lòng nhập đầy đủ mã và giá trị giảm');
      return;
    }

    const couponData = {
      ...formData,
      id: editingCoupon ? editingCoupon.id : 'C' + Date.now(),
      code: formData.code.toUpperCase().trim()
    } as Coupon;

    try {
      if (editingCoupon) {
        await dispatch(updateCoupon({ id: editingCoupon.id, coupon: couponData })).unwrap();
      } else {
        await dispatch(createCoupon(couponData)).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error || 'Có lỗi xảy ra khi lưu mã giảm giá');
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({ 
      code: '', 
      discountType: 'percent', 
      discountValue: 0, 
      minOrderValue: 0, 
      expiryDate: new Date().toISOString().split('T')[0], 
      isActive: true 
    });
  };

  // Lọc và hiển thị danh sách mới nhất
  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.id.localeCompare(a.id));

  return (
    <AdminLayout 
      title="Mã Giảm Giá" 
      subtitle="Quản lý kho mã khuyến mãi của Ngọc Hường Farm."
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex-1">
          {/* Title is now handled by AdminLayout */}
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 transition-all active:scale-95 uppercase text-[10px] md:text-xs tracking-wide md:tracking-widest"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" /> Thêm Mã Mới
        </button>
      </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-10 flex items-center gap-3">
          <div className="bg-gray-50 p-3 rounded-xl ml-1 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm mã giảm giá..." 
            className="flex-grow outline-none font-bold text-gray-700 bg-transparent py-2 px-2" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map(item => (
              <div key={item.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all ${item.isActive ? 'border-gray-50' : 'border-red-50 grayscale opacity-70'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Ticket className="w-6 h-6" />
                  </div>
                  <button onClick={() => handleToggle(item)} className="transition-transform active:scale-90">
                    {item.isActive ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tight">{item.code}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-emerald-600 font-black text-3xl">
                      {item.discountType === 'percent' ? `${item.discountValue}%` : `${item.discountValue.toLocaleString()}đ`}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OFF</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8 bg-gray-50 p-5 rounded-3xl border border-gray-50">
                   <div className="flex justify-between text-xs font-black">
                     <span className="text-gray-400 uppercase tracking-widest">Đơn tối thiểu</span>
                     <span className="text-gray-700">{item.minOrderValue.toLocaleString()}đ</span>
                   </div>
                   <div className="flex justify-between text-xs font-black">
                     <span className="text-gray-400 uppercase tracking-widest">Hết hạn</span>
                     <span className="text-orange-500">{new Date(item.expiryDate).toLocaleDateString('vi-VN')}</span>
                   </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="p-4 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 text-gray-300 font-black uppercase text-sm tracking-widest">
             Trống
          </div>
        )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">{editingCoupon ? 'Sửa Mã' : 'Tạo Mã Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <input required className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-black uppercase text-lg border-2 border-transparent focus:border-emerald-500" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="CODE *" />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-gray-50 p-4 rounded-2xl font-bold" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})}>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Tiền mặt (đ)</option>
                </select>
                <input type="number" className="bg-gray-50 p-4 rounded-2xl font-black" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} placeholder="Giá trị *" />
              </div>
              <input type="number" className="w-full bg-gray-50 p-4 rounded-2xl font-black" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})} placeholder="Đơn tối thiểu (đ)" />
              <input type="date" className="w-full bg-gray-50 p-4 rounded-2xl font-bold" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest">
                <Check className="w-6 h-6 inline mr-2" /> Lưu Mã
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCoupons;

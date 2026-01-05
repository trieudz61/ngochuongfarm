
import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, createProduct, updateProduct, deleteProduct } from '../store';
import { Plus, Edit2, Trash2, Search, X, Check, Image as ImageIcon, PlusCircle, Upload, Link as LinkIcon } from 'lucide-react';
import { Product } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminProducts: React.FC = () => {
  const products = useSelector((state: RootState) => state.app.products);
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: 'kg',
    category: 'Trái cây',
    origin: '',
    stock: 0,
    description: '',
    images: [''],
    certifications: ['TQC'],
    harvestDate: new Date().toISOString().split('T')[0],
    cultivationProcess: ''
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      images: product.images && product.images.length > 0 ? product.images : ['']
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
      } catch (error: any) {
        alert(error || 'Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedImages = (formData.images || []).filter(img => img.trim() !== '');
    
    const productData = {
      ...formData,
      images: cleanedImages.length > 0 ? cleanedImages : ['https://via.placeholder.com/300'],
      id: editingProduct ? editingProduct.id : 'P' + Date.now(),
    } as Product;

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, product: productData })).unwrap();
      } else {
        await dispatch(createProduct(productData)).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error || 'Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      unit: 'kg',
      category: 'Trái cây',
      origin: '',
      stock: 0,
      description: '',
      images: [''],
      certifications: ['TQC'],
      harvestDate: new Date().toISOString().split('T')[0],
      cultivationProcess: ''
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  // Hàm nén ảnh trước khi convert sang base64
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize nếu ảnh quá lớn
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert sang base64 với chất lượng nén
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, etc.)');
      return;
    }
    
    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      // Nén và convert sang base64
      const base64String = await compressImage(file, 800, 0.7);
      const newImages = [...(formData.images || [])];
      newImages[index] = base64String;
      setFormData({ ...formData, images: newImages });
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
    }
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...(formData.images || []), ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
  };

  const imageInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout 
      title="Quản Lý Nông Sản" 
      subtitle="Cập nhật kho hàng và danh mục sản phẩm Ngọc Hường Farm"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex-1">
          {/* Title is now handled by AdminLayout */}
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 md:px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95 text-[10px] md:text-sm uppercase tracking-wide md:tracking-widest"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" /> Thêm Sản Phẩm
        </button>
      </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3">
          <div className="bg-gray-50 p-3 rounded-xl ml-1">
            <Search className="text-gray-400 w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc danh mục..." 
            className="flex-grow focus:outline-none font-bold text-gray-700 bg-transparent py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left table-auto min-w-[900px]">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6">Sản phẩm</th>
                  <th className="px-8 py-6">Danh mục</th>
                  <th className="px-8 py-6">Ngày hái</th>
                  <th className="px-8 py-6">Giá & Đơn vị</th>
                  <th className="px-8 py-6">Tồn kho</th>
                  <th className="px-8 py-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="max-w-[200px]">
                          <div className="font-black text-gray-900 leading-snug text-sm truncate" title={p.name}>{p.name}</div>
                          <div className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1 opacity-60">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 whitespace-nowrap">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-gray-900 text-sm">
                        {new Date().toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                        Hôm nay
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-gray-900 text-base">{p.price.toLocaleString()}đ</div>
                      <div className="text-[10px] font-black uppercase tracking-widest mt-1 text-gray-400">
                        Đơn vị: {p.unit}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`font-black text-sm ${p.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {p.stock} {p.unit}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-3 bg-white border border-gray-100 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-3 bg-white border border-gray-100 text-red-600 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-orange-950/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-orange-600 p-6 md:p-8 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                {editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tên sản phẩm</label>
                  <input required className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Danh mục</label>
                  <select className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    <option value="Trái cây">Trái cây</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Giá (VNĐ)</label>
                  <input type="number" required className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Đơn vị tính (VD: kg, Lít, Thùng...)</label>
                  <input required className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="VD: kg" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tồn kho (theo đơn vị)</label>
                  <input type="number" required className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ngày hái</label>
                  <input type="date" required className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold" value={formData.harvestDate || ''} onChange={e => setFormData({...formData, harvestDate: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Xuất xứ</label>
                  <input required className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                </div>
                {/* ... Rest of form remains the same ... */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Hình ảnh sản phẩm</label>
                    <button type="button" onClick={addImageField} className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-orange-100 transition-colors border border-orange-100">
                      <PlusCircle className="w-3.5 h-3.5" /> Thêm ảnh
                    </button>
                  </div>
                  {formData.images?.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all font-bold text-sm" 
                          value={url} 
                          placeholder="Nhập URL hoặc upload ảnh..." 
                          onChange={e => handleImageChange(index, e.target.value)} 
                        />
                        <input
                          ref={(el) => { imageInputRefs.current[index] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) handleImageUpload(index, file);
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => imageInputRefs.current[index]?.click()}
                          className="px-4 py-3 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-2xl border border-orange-100 transition-all flex items-center gap-2 font-bold text-xs"
                          title="Upload ảnh"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeImageField(index)} 
                          className="px-4 py-3 text-red-400 hover:text-red-600 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      {url && (
                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-gray-100">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Invalid+Image';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mô tả</label>
                  <textarea rows={3} className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
              <div className="mt-10 flex gap-4 pb-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase text-xs">HỦY BỎ</button>
                <button type="submit" className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 flex items-center justify-center gap-2 uppercase text-xs"><Check className="w-5 h-5" /> LƯU THAY ĐỔI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;

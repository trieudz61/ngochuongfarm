
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Filter, Search, ChevronDown, Grid, List } from 'lucide-react';
import { RootState } from '../store';
import ProductCard from '../components/ProductCard';

const Products: React.FC = () => {
  const allProducts = useSelector((state: RootState) => state.app.products);
  const isLoading = useSelector((state: RootState) => state.app.loading.products);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Tự động lấy categories từ products
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    return ['Tất cả', ...uniqueCategories.sort()];
  }, [allProducts]);

  // Debug logging
  React.useEffect(() => {
    console.log('[Products] Total products:', allProducts.length);
    console.log('[Products] Categories:', categories);
    console.log('[Products] Loading:', isLoading);
  }, [allProducts, categories, isLoading]);

  // Logic lọc và sắp xếp sản phẩm
  const processedProducts = useMemo(() => {
    // Kiểm tra nếu không có products
    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // 1. Lọc theo danh mục và tìm kiếm
    let filtered = allProducts.filter(p => {
      if (!p) return false; // Bỏ qua null/undefined
      
      const matchesCategory = selectedCategory === 'Tất cả' || (p.category && p.category === selectedCategory);
      const matchesSearch = !searchQuery || 
                            (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                            (p.origin && p.origin.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // 2. Sắp xếp
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      // Mặc định: Mới nhất (dựa trên createdAt hoặc ID)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-6 md:py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section - Font size reduced */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Danh Mục Nông Sản</h1>
          <p className="text-[11px] md:text-sm text-gray-500 font-medium px-4 leading-relaxed">Sản phẩm của Ngọc Hường Farm được thu hoạch và vận chuyển trong ngày để giữ trọn vẹn hương vị tự nhiên.</p>
        </div>

        {/* Filters Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2.5 rounded-2xl md:rounded-[1.5rem] shadow-sm border border-gray-100">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black transition-all uppercase tracking-wider ${
                    selectedCategory === cat 
                      ? 'bg-orange-600 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search input - Smaller font */}
              <div className="relative flex-grow md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-gray-50 focus:outline-none focus:border-orange-500 bg-gray-50 transition-colors text-[11px] font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Sort dropdown - Smaller font */}
              <div className="relative shrink-0">
                <select 
                  className="appearance-none bg-orange-50 border-2 border-orange-100 rounded-xl pl-3 pr-8 py-2 text-[10px] font-black text-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase tracking-widest cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá thấp → Cao</option>
                  <option value="price-desc">Giá cao → Thấp</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <div className="bg-orange-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Search className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1">Đang tải sản phẩm...</h3>
            <p className="text-[10px] text-gray-400 max-w-xs mx-auto font-bold uppercase tracking-tighter">Vui lòng chờ trong giây lát</p>
          </div>
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {processedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <div className="bg-orange-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-orange-300" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1">Chưa có sản phẩm</h3>
            <p className="text-[10px] text-gray-400 max-w-xs mx-auto font-bold uppercase tracking-tighter">Hiện tại chưa có sản phẩm nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <div className="bg-orange-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-orange-300" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1">Không tìm thấy sản phẩm</h3>
            <p className="text-[10px] text-gray-400 max-w-xs mx-auto font-bold uppercase tracking-tighter">Vui lòng thử từ khóa khác hoặc quay lại danh mục tất cả.</p>
            <button 
              onClick={() => {setSelectedCategory('Tất cả'); setSearchQuery('');}}
              className="mt-6 bg-orange-600 text-white px-6 py-2.5 rounded-full font-black shadow-md text-[10px] uppercase tracking-widest"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

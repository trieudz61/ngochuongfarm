
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ChevronLeft, 
  ShoppingCart, 
  MapPin, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Truck,
  Heart,
  Share2,
  Sprout,
  ShieldCheck,
  Star,
  X,
  Send,
  MessageSquare,
  ThumbsUp,
  Ban
} from 'lucide-react';
import { RootState, addToCart, addReview } from '../store';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state: RootState) => state.app.products.find(p => p.id === id));
  const user = useSelector((state: RootState) => state.app.user);
  
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Kiểm tra hết hàng
  const isOutOfStock = !product || product.stock <= 0;

  // Reset selected image khi product thay đổi
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

  if (!product) {
    return (
      <div className="py-12 md:py-24 text-center px-4">
        <h2 className="text-xl font-bold">Sản phẩm không tồn tại</h2>
        <Link to="/products" className="text-orange-600 hover:underline mt-2 inline-block">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({ product, quantity }));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Navigation */}
        <Link to="/products" className="flex items-center gap-1 text-gray-400 hover:text-orange-600 mb-6 transition-colors group text-xs md:text-sm font-black uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Danh sách sản phẩm</span>
        </Link>

        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
             <div className="flex items-center gap-3 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã thêm {quantity} {product.unit} {product.name} vào giỏ hàng!</span>
             </div>
             <Link to="/cart" className="text-emerald-700 font-black underline text-[10px] uppercase">Giỏ hàng</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-gray-100">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative group">
              <img 
                src={product.images[selectedImageIndex] || product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600?text=Image+Not+Found';
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div 
                    key={index} 
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-gray-50 ${
                      selectedImageIndex === index 
                        ? 'border-orange-500 ring-2 ring-orange-200' 
                        : 'border-transparent hover:border-orange-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      className="w-full h-full object-cover" 
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-orange-50 text-orange-600 font-black text-[9px] tracking-widest uppercase px-2 py-1 rounded-full border border-orange-100">{product.category}</span>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-2 leading-tight uppercase tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= (product.averageRating || 5) ? 'fill-current' : 'text-gray-200'}`} />)}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">({product.reviews?.length || 0} đánh giá)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-100 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"><Heart className="w-4 h-4" /></button>
                <button className="p-2 border border-gray-100 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="text-xl md:text-3xl font-black text-orange-700">
                {product.price.toLocaleString('vi-VN')}đ<span className="text-xs md:text-sm font-normal text-gray-400 ml-1">/{product.unit}</span>
              </div>
              {isOutOfStock ? (
                <span className="text-red-600 text-[10px] font-black uppercase flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                  <Ban className="w-3 h-3" /> Hết hàng
                </span>
              ) : (
                <span className="text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                  <ShieldCheck className="w-3 h-3" /> Còn {product.stock} {product.unit}
                </span>
              )}
            </div>

            <p className="text-xs md:text-sm text-gray-500 mb-8 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Info Cards - Smaller Text */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <MapPin className="text-orange-600 w-4 h-4 shrink-0" />
                <div>
                  <div className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Xuất xứ</div>
                  <div className="text-[10px] md:text-xs font-black text-gray-900 truncate">{product.origin}</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <Calendar className="text-orange-600 w-4 h-4 shrink-0" />
                <div>
                  <div className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Hái ngày</div>
                  <div className="text-[10px] md:text-xs font-black text-gray-900">{new Date().toLocaleDateString('vi-VN')}</div>
                </div>
              </div>
            </div>

            {/* Purchase UI */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              {isOutOfStock ? (
                <div className="flex-grow bg-gray-100 text-gray-400 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest cursor-not-allowed">
                  <Ban className="w-4 h-4" /> Sản phẩm tạm hết hàng
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border border-gray-100">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 hover:bg-white hover:text-orange-600 transition-all font-black text-lg"
                    >-</button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-10 text-center font-black text-sm bg-transparent outline-none" 
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 hover:bg-white hover:text-orange-600 transition-all font-black text-lg"
                    >+</button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-grow bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-100 text-[11px] uppercase tracking-widest"
                  >
                    <ShoppingCart className="w-4 h-4" /> Thêm Vào Giỏ
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row gap-4 py-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ship đơn &gt; 500k</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chuẩn TQC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;


import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, CheckCircle, Star, Ban } from 'lucide-react';
import { Product } from '../types';
import { addToCart, RootState } from '../store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const isOutOfStock = product.stock <= 0;
  
  // Lấy số lượng sản phẩm trong giỏ hàng
  const cartItem = useSelector((state: RootState) => 
    state.app.cart.find(item => item.id === product.id)
  );
  const quantityInCart = cartItem?.quantity || 0;

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group border border-gray-100 flex flex-col h-full ${isOutOfStock ? 'opacity-75' : ''}`}>
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
        />
        
        {/* Badges - Smaller font */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="bg-red-600 text-white text-[7px] sm:text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg uppercase tracking-wider">
              <Ban className="w-2 h-2" /> Hết hàng
            </span>
          )}
          {product.certifications.slice(0, 1).map(cert => (
            <span key={cert} className="bg-orange-600/90 text-white text-[7px] sm:text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm uppercase tracking-tighter">
              <CheckCircle className="w-2 h-2" /> {cert}
            </span>
          ))}
        </div>

        {!isOutOfStock && quantityInCart > 0 && (
          <div className="absolute top-2 right-2">
            <div className="relative bg-orange-600 p-1.5 rounded-full text-white shadow-lg">
              <Plus className="w-3.5 h-3.5" />
              
              {/* Badge số lượng trên ảnh - luôn hiển thị */}
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-white animate-pulse">
                {quantityInCart}
              </span>
            </div>
          </div>
        )}
        
        {!isOutOfStock && quantityInCart === 0 && (
          <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-orange-600 shadow-sm opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Plus className="w-3.5 h-3.5" />
          </div>
        )}
      </Link>
      
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] text-orange-600 font-black uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center gap-0.5 text-amber-500">
             <Star className="w-2.5 h-2.5 fill-current" />
             <span className="text-[9px] font-black">4.9</span>
          </div>
        </div>
        
        {/* Title - Smaller font */}
        <Link to={`/products/${product.id}`} className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 hover:text-orange-600 leading-snug transition-colors line-clamp-2">
          {product.name}
        </Link>
        
        <p className="text-[9px] sm:text-[11px] text-gray-400 mb-3 line-clamp-1 font-medium">{product.origin}</p>
        {product.harvestDate && (
          <p className="text-[8px] sm:text-[10px] text-emerald-600 mb-2 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Hái {new Date(product.harvestDate).toLocaleDateString('vi-VN')}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-2">
          {/* Price - Refined font size */}
          <div className="text-sm sm:text-base font-black text-orange-700">
            {product.price.toLocaleString('vi-VN')}đ<span className="text-[9px] font-normal text-gray-400">/{product.unit || 'kg'}</span>
          </div>
          
          {isOutOfStock ? (
            <button 
              disabled
              className="bg-gray-50 p-2 rounded-lg text-gray-300 cursor-not-allowed w-fit sm:w-auto"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                dispatch(addToCart({ product, quantity: 1 }));
              }}
              className="relative bg-orange-50 p-2 rounded-lg text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300 transform active:scale-95 shadow-sm w-fit sm:w-auto self-end sm:self-auto group"
              title="Thêm vào giỏ"
            >
              <Plus className="w-4 h-4" />
              
              {/* Badge số lượng */}
              {quantityInCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200 border-2 border-white group-hover:scale-110 transition-transform">
                  {quantityInCart}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

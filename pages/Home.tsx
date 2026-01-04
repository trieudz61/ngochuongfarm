
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Leaf, 
  ShieldCheck, 
  Truck, 
  Sprout, 
  Star, 
  Newspaper, 
  ShoppingBag, 
  Search,
  Droplets,
  Microscope,
  Calendar,
  ChevronRight,
  X,
  ZoomIn
} from 'lucide-react';
import { RootState } from '../store';
import ProductCard from '../components/ProductCard';
import { getApiUrl } from '../src/config/api.js';

const Home: React.FC = () => {
  const products = useSelector((state: RootState) => state.app.products);
  const isLoading = useSelector((state: RootState) => state.app.loading.products);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  
  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCertificateModal(false);
    };
    if (showCertificateModal) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Chặn scroll
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showCertificateModal]);
  
  // Xử lý isFeatured có thể là boolean hoặc số (1/0 từ database)
  const featured = products.filter(p => {
    const isFeatured = p.isFeatured === true || (p.isFeatured as any) === 1 || (p.isFeatured as any) === '1';
    return isFeatured;
  }).slice(0, 4);
  
  // Nếu không có featured, lấy 4 sản phẩm đầu tiên
  const displayProducts = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-orange-600 min-h-[600px] md:h-[850px] flex items-center overflow-hidden py-12 md:py-0">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Field background"
            className="w-full h-full object-cover opacity-30 scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="max-w-3xl text-white">
            <span className="bg-white/20 text-white font-bold px-4 py-2 rounded-full text-[10px] md:text-sm uppercase tracking-[0.2em] mb-4 md:mb-6 inline-block backdrop-blur-md border border-white/30 animate-in fade-in slide-in-from-top-4 duration-700">
              Ngọc Hường Farm - Từ vườn tới bàn ăn
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-left-8 duration-700">
              NÔNG SẢN SẠCH <br/><span className="text-amber-300 italic">THẤM ĐƯỢM</span> VỊ QUÊ
            </h1>
            <p className="text-base md:text-xl text-orange-50 mb-8 md:mb-12 font-medium leading-relaxed max-w-xl opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Chúng tôi cam kết cung cấp những sản phẩm nông nghiệp an toàn nhất, được chăm sóc bằng cả trái tim tại vùng đất đỏ bazan Hạnh Lâm.
            </p>
            
            {/* CTA Buttons Group */}
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6">
                <Link to="/products" className="bg-white text-orange-600 hover:bg-orange-50 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black transition-all shadow-2xl flex items-center justify-center gap-2 text-sm md:text-lg uppercase tracking-widest group w-full sm:w-auto">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" /> Mua Sắm Ngay
                </Link>
                <Link to="/track-order" className="bg-orange-950/30 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-orange-600 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-sm md:text-lg uppercase tracking-widest group w-full sm:w-auto">
                  <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Tra Cứu Đơn Hàng
                </Link>
                <Link to="/news" className="bg-orange-950/30 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-orange-600 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-sm md:text-lg uppercase tracking-widest group w-full sm:w-auto">
                  <Newspaper className="w-5 h-5 group-hover:-rotate-12 transition-transform" /> Tin Tức Nông Trại
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-6">
            <div className="max-w-xl">
              <span className="text-orange-600 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">Mùa nào thức nấy</span>
              <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-4 uppercase tracking-tight">Sản Phẩm Đang Vào Vụ</h2>
              <p className="text-gray-500 font-medium text-sm md:text-base">Tuyển chọn những loại quả đạt độ chín và hương vị tốt nhất trong ngày hôm nay tại nông trại.</p>
            </div>
            <Link to="/products" className="group bg-gray-900 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black flex items-center gap-3 hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              Tất cả sản phẩm <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sprout className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Đang tải sản phẩm...</h3>
              <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Chưa có sản phẩm</h3>
              <p className="text-sm text-gray-500 mb-6">Hiện tại chưa có sản phẩm nào trong hệ thống.</p>
              <Link to="/products" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-black shadow-md text-sm uppercase tracking-widest hover:bg-orange-700 transition-all">
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Highlights Section (Quality Guarantee) */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: Star, title: 'Chất Lượng', desc: 'Tuyển chọn kỹ' },
              { icon: ShieldCheck, title: 'Chuẩn TQC', desc: 'An toàn tuyệt đối' },
              { icon: Truck, title: 'Giao Siêu Tốc', desc: 'Trong vòng 2h' },
              { icon: Sprout, title: 'Giá Tại Vườn', desc: 'Không qua trung gian' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="bg-white p-5 rounded-2xl mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all border border-gray-100">
                  <f.icon className="w-6 h-6 md:w-8 text-orange-600" />
                </div>
                <h3 className="text-sm md:text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">{f.title}</h3>
                <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Process (Traceability) */}
      <section className="py-24 md:py-40 bg-orange-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] -mr-300 -mt-300"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -ml-200 -mb-200"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-600/20 border border-orange-600/30 text-orange-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                Traceability - Truy xuất nguồn gốc
              </span>
              <h2 className="text-4xl md:text-7xl font-black mb-8 uppercase leading-[0.95] tracking-tighter">
                QUY TRÌNH SẠCH <br/> <span className="text-amber-400">KHÔNG TÌ VẾT</span>
              </h2>
              <p className="text-orange-100/70 text-lg md:text-xl mb-10 leading-relaxed font-medium">
                Chúng tôi không chỉ bán nông sản, chúng tôi chia sẻ một lối sống lành mạnh. 
                Mọi quy trình từ chọn giống đến đóng gói đều được giám sát bởi chuyên gia và có thể truy xuất 100%.
              </p>
              
              <div className="space-y-6 mb-12">
                {[
                  { icon: Sprout, title: 'Canh tác hữu cơ 100%', desc: 'Sử dụng phân bón vi sinh tự ủ tại farm.' },
                  { icon: Microscope, title: 'Kiểm định nghiêm ngặt', desc: 'Xét nghiệm mẫu đất và nước định kỳ.' },
                  { icon: ShieldCheck, title: 'Chứng chỉ TQC', desc: 'Đảm bảo tiêu chuẩn nông nghiệp quốc gia.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-orange-900 border border-orange-800 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:border-orange-500 transition-all">
                      <item.icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight text-white">{item.title}</h4>
                      <p className="text-orange-100/50 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/trace" className="inline-flex items-center gap-4 bg-orange-600 hover:bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 group">
                Khám phá quy trình chi tiết <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="relative">
              <div 
                className="aspect-square rounded-[3rem] md:rounded-[5rem] overflow-hidden border-8 border-green-100 shadow-2xl relative group bg-white cursor-pointer"
                onClick={() => setShowCertificateModal(true)}
              >
                {/* Ảnh chứng chỉ TQC Full - không padding, full viền */}
                <img 
                  src="http://web-production-335ab.up.railway.app/uploads/f2def99d-494f-46ce-abfc-140e2c1146e9.jpg"
                  alt="TQC Certificate - TCVN 11041-2:2017" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  onLoad={() => console.log('✅ TQC Certificate loaded successfully!')}
                  onError={(e) => {
                    console.error('❌ Failed to load TQC certificate:', e);
                    // Fallback nếu ảnh không load được
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-content')) {
                      parent.innerHTML = `
                        <div class="fallback-content w-full h-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-50 to-blue-50 p-8">
                          <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                            <svg class="w-12 h-12 md:w-16 md:h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                          </div>
                          <div class="space-y-4">
                            <div class="text-2xl md:text-4xl font-black text-green-600 uppercase tracking-wider">Chứng nhận</div>
                            <div class="text-5xl md:text-7xl font-black text-blue-900 uppercase tracking-tight">TQC</div>
                            <div class="text-sm md:text-lg font-bold text-gray-500 uppercase tracking-widest">TCVN 11041-2:2017</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                
                {/* Zoom Icon Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 md:p-6 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                    <ZoomIn className="w-8 h-8 md:w-12 md:h-12 text-green-600" />
                  </div>
                </div>
                
                {/* Click to view hint */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg whitespace-nowrap">
                  Click để xem toàn màn hình
                </div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-white text-orange-950 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-3xl text-center border-4 border-orange-100 animate-bounce-slow">
                 <div className="text-4xl md:text-6xl font-black leading-none mb-1">0%</div>
                 <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60">Dư lượng hóa chất</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
           <div className="bg-orange-600 rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-3xl">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10">
                <Sprout className="w-16 h-16 text-amber-300 mx-auto mb-8" />
                <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase tracking-tighter leading-tight">
                   TRẢI NGHIỆM VỊ QUÊ <br/> NGAY TRONG HÔM NAY!
                </h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/products" className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-50 transition-all uppercase tracking-widest active:scale-95">
                    Đặt hàng ngay
                  </Link>
                  <Link to="/trace" className="bg-orange-950/20 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white hover:text-orange-600 transition-all uppercase tracking-widest active:scale-95">
                    Tìm hiểu thêm
                  </Link>
                </div>
              </div>
           </div>
        </div>
      </section>
      
      {/* Certificate Fullscreen Modal */}
      {showCertificateModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowCertificateModal(false)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowCertificateModal(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all z-10 group"
            aria-label="Đóng"
          >
            <X className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          {/* Certificate Image */}
          <div 
            className="relative max-w-6xl w-full max-h-[90vh] animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src="http://web-production-335ab.up.railway.app/uploads/f2def99d-494f-46ce-abfc-140e2c1146e9.jpg"
              alt="TQC Certificate - TCVN 11041-2:2017" 
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Certificate Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8 rounded-b-2xl">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight">Chứng nhận TQC</h3>
                </div>
                <p className="text-xs md:text-sm text-white/70 font-medium">TCVN 11041-2:2017 | Nông trại Ngọc Hường</p>
                <p className="text-xs text-white/50 mt-2">Nhấn ESC hoặc click bên ngoài để đóng</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes subtle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Home;

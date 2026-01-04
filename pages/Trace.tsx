
import React from 'react';
import { Sprout, Droplets, Microscope, Scissors, Package, CheckCircle2, ChevronRight, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCTION_STEPS = [
  {
    id: 1,
    title: 'Lựa Chọn Vùng Trồng & Giống Cam',
    description: 'Tại Hạnh Lâm (Thanh Chương), chúng tôi chọn những triền đồi đất đỏ bazan có độ thoát nước tốt nhất. Giống cam Xã Đoài lòng vàng được tuyển chọn kỹ lưỡng, đảm bảo khả năng chống chịu sâu bệnh tự nhiên và cho chất lượng quả ngọt thanh.',
    image: 'http://localhost:3000/server/uploads/vuoncam.jpg',
    icon: Sprout,
    color: 'bg-emerald-500',
    details: ['Đất đỏ bazan độ pH 5.5-6.5', 'Giống F1 thuần chủng', 'Quy hoạch vùng đệm an toàn']
  },
  {
    id: 2,
    title: 'Canh Tác Hữu Cơ Hoàn Toàn',
    description: 'Không thuốc trừ sâu hóa học. Chúng tôi sử dụng phân hữu cơ tự ủ từ đậu tương, ngô và chế phẩm sinh học. Hệ thống tưới nhỏ giọt Israel giúp duy trì độ ẩm lý tưởng, giúp cây cam hấp thụ dinh dưỡng bền bỉ.',
    image: 'http://localhost:3000/server/uploads/canhtac.jpg',
    icon: Droplets,
    color: 'bg-blue-500',
    details: ['Phân hữu cơ vi sinh 100%', 'Tưới nước sạch từ khe suối', 'Bắt sâu thủ công & dùng bẫy dính']
  },
  {
    id: 3,
    title: 'Kiểm Soát Chất Lượng TQC',
    description: 'Kỹ thuật viên của Ngọc Hường Farm kiểm tra nhật ký vườn hàng ngày. Trước khi thu hoạch 30 ngày, các mẫu đất, nước và lá được gửi đi kiểm nghiệm tại trung tâm độc lập để đảm bảo không tồn dư hóa chất.',
    image: 'http://localhost:3000/server/uploads/haicam.jpg',
    icon: Microscope,
    color: 'bg-orange-500',
    details: ['Sổ nhật ký vườn điện tử', 'Kiểm nghiệm 75 chỉ tiêu an toàn', 'Đạt chuẩn TQC quốc gia']
  },
  {
    id: 4,
    title: 'Thu Hoạch Thủ Công Tại Vườn',
    description: 'Chúng tôi chỉ thu hoạch khi quả đạt độ chín 90% (độ đường Brix > 11). Từng quả cam được cắt tỉ mỉ bằng kéo chuyên dụng, bọc trong lưới xốp ngay tại gốc để tránh va đập, trầy xước vỏ.',
    image: 'http://localhost:3000/server/uploads/haicam2.jpg',
    icon: Scissors,
    color: 'bg-amber-500',
    details: ['Thu hoạch vào sáng sớm', 'Lựa chọn quả loại 1', 'Đóng gói tại chỗ']
  },
  {
    id: 5,
    title: 'Đóng Gói & Dán Tem Truy Xuất',
    description: 'Sản phẩm được làm sạch bằng hơi nước, dán tem QR Code định danh từng lô hàng. Khách hàng khi nhận sản phẩm có thể dùng điện thoại xem lại toàn bộ hành trình từ lúc ươm mầm đến khi giao hàng.',
    image: 'http://localhost:3000/server/uploads/donggoi.jpg',
    icon: Package,
    color: 'bg-rose-500',
    details: ['Lưới xốp bảo vệ 2 lớp', 'Tem QR Code chống giả', 'Thùng carton 5 lớp chuyên dụng']
  }
];

const Trace: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-orange-600 py-16 md:py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block backdrop-blur-sm border border-white/30">
            Hành trình Nông sản Sạch
          </span>
          <h1 className="text-3xl md:text-6xl font-black mb-6 leading-tight">Quy Trình Sản Xuất <br/> <span className="text-amber-300">Minh Bạch</span></h1>
          <p className="text-sm md:text-xl text-orange-50 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
            Tại Ngọc Hường Farm, mỗi quả cam không chỉ là nông sản, đó là tâm huyết của những người nông dân Hạnh Lâm qua một chu trình khép kín nghiêm ngặt.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
      </section>

      {/* Main Content Journey */}
      <section className="py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-16 md:space-y-32">
            {PRODUCTION_STEPS.map((step, index) => (
              <div key={step.id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
                {/* Image Section */}
                <div className="w-full md:w-1/2 relative group">
                  <div className={`absolute -inset-4 ${step.color} opacity-10 rounded-[2rem] md:rounded-[3rem] blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative aspect-[4/3] rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl">
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden"></div>
                    <div className="absolute bottom-4 left-4 md:hidden">
                       <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-xs font-black shadow-lg">Bước {step.id}</span>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="hidden md:flex items-center gap-4">
                    <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <span className="text-gray-400 font-black text-xl uppercase tracking-tighter">Giai đoạn {step.id}</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
                    {step.title}
                  </h2>
                  
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed font-medium">
                    {step.description}
                  </p>

                  <ul className="space-y-3">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-3 text-sm md:text-base font-bold text-gray-800">
                        <CheckCircle2 className={`w-5 h-5 ${step.color.replace('bg-', 'text-')}`} />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {index === PRODUCTION_STEPS.length - 1 && (
                    <div className="pt-8">
                       <Link to="/products" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-100 flex items-center justify-center gap-3 md:w-fit hover:bg-orange-700 transition-all uppercase tracking-wider">
                         Ghé thăm cửa hàng <ChevronRight className="w-5 h-5" />
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">100%</h3>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Hữu cơ sạch</p>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-orange-600 w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">Hạnh Lâm</h3>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Vùng nguyên liệu chuẩn</p>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">TQC</h3>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Tiêu chuẩn quốc gia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
           <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">Bạn đã sẵn sàng thưởng thức vị cam chuẩn quê?</h2>
           <Link to="/products" className="inline-block bg-orange-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg md:text-xl shadow-2xl shadow-orange-100 hover:bg-orange-700 transition-all uppercase tracking-widest active:scale-95">
             Mua Ngay Tại Vườn
           </Link>
        </div>
      </section>
    </div>
  );
};

export default Trace;

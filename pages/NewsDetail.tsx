
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  Calendar, 
  User, 
  ChevronLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageSquare,
  Clock,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { ContentRenderer } from '../components/ContentRenderer';

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const article = useSelector((state: RootState) => state.app.news.find(n => n.id === id));
  const recentNews = useSelector((state: RootState) => state.app.news.filter(n => n.id !== id).slice(0, 3));

  if (!article) {
    return (
      <div className="py-20 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900">Bài viết không tồn tại</h2>
        <Link to="/news" className="text-orange-600 hover:underline mt-4 inline-block font-bold">Quay lại Tin tức</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Article Header & Image */}
      <div className="relative w-full h-[300px] md:h-[600px]">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12">
          <div className="max-w-4xl mx-auto">
            <Link to="/news" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest">Tất cả bài viết</span>
            </Link>
            {article.category && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-orange-600 text-white text-[10px] md:text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  {article.category}
                </span>
              </div>
            )}
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight md:leading-snug mb-8">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 md:gap-10 text-white/80 text-[10px] md:text-sm font-bold">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-black">NH</div>
                <div className="flex flex-col">
                   <span className="text-white">{article.author}</span>
                   <span className="text-[10px] opacity-60 uppercase">Người viết</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>6 phút đọc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar Left: Share Tools (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28 h-fit">
          <div className="flex flex-col gap-6">
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm"><Facebook className="w-5 h-5" /></button>
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-sky-400 hover:text-white transition-all border border-gray-100 shadow-sm"><Twitter className="w-5 h-5" /></button>
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all border border-gray-100 shadow-sm"><Bookmark className="w-5 h-5" /></button>
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all border border-gray-100 shadow-sm"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Article Body */}
        <article className="lg:col-span-7">
          <div className="bg-orange-50/50 border-l-8 border-orange-600 p-8 md:p-10 rounded-r-[3rem] mb-12 shadow-sm shadow-orange-50">
            <p className="text-xl md:text-2xl font-black text-orange-950 italic leading-relaxed">
              "{article.summary}"
            </p>
          </div>

          <div className="article-content">
             <ContentRenderer 
               content={article.content} 
               allowHtml={article.content.includes('<') && article.content.includes('>')} 
             />
          </div>

          {/* Tag Cloud */}
          <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap gap-2">
             {['Nông nghiệp sạch', 'Ngọc Hường Farm', 'TQC'].map(t => (
               <span key={t} className="px-4 py-2 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg">#{t}</span>
             ))}
          </div>

          {/* Social Mobile */}
          <div className="lg:hidden flex justify-center gap-4 py-12 border-y border-gray-100 my-12">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"><Facebook className="w-4 h-4" /> Facebook</button>
            <button className="flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"><Share2 className="w-4 h-4" /> Chia sẻ</button>
          </div>
        </article>

        {/* Sidebar Right: Related Posts */}
        <div className="lg:col-span-4 space-y-16">
          <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-2 h-10 bg-orange-600 rounded-full"></div>
              Bài viết gợi ý
            </h3>
            <div className="space-y-10">
              {recentNews.map(item => (
                <Link key={item.id} to={`/news/${item.id}`} className="group flex gap-5">
                  <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-white shadow-sm">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center">
                    {item.category && <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{item.category}</span>}
                    <h4 className="text-sm font-black text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold mt-2">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/news" className="mt-10 w-full flex items-center justify-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest py-4 border-2 border-orange-100 rounded-2xl hover:bg-orange-600 hover:text-white transition-all">
               Xem tất cả tin tức <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Newsletter Box */}
          <div className="bg-orange-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-orange-100/20">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24"></div>
             <div className="bg-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
             </div>
             <h3 className="text-2xl font-black mb-4 relative z-10 leading-tight">Nhận tin nông nghiệp hàng tuần</h3>
             <p className="text-orange-100/60 text-sm mb-8 relative z-10">
               Cập nhật kỹ thuật canh tác TQC và mẹo chăm sóc gia đình từ các chuyên gia.
             </p>
             <div className="space-y-4 relative z-10">
                <input type="email" placeholder="Email của bạn" className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black text-xs transition-all uppercase tracking-widest shadow-xl">ĐĂNG KÝ NGAY</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;

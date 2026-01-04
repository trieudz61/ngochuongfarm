
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react';

const News: React.FC = () => {
  const news = useSelector((state: RootState) => state.app.news);

  // Sắp xếp tin tức theo thời gian mới nhất lên đầu
  const sortedNews = [...news].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-gray-50 min-h-screen py-10 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-black text-orange-950 uppercase tracking-tight mb-4">Tin Tức & Kinh Nghiệm</h1>
          <p className="text-sm md:text-lg text-gray-500 max-w-xl mx-auto font-medium">Cập nhật những bảng tin nông nghiệp sạch và thông tin bổ ích từ Ngọc Hường Farm.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sortedNews.map((item) => (
            <Link 
              key={item.id} 
              to={`/news/${item.id}`}
              className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group flex flex-col h-full"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                {item.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-gray-400 text-[10px] md:text-xs font-bold mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.author}</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 group-hover:text-orange-600 transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed font-medium">
                  {item.summary}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-orange-600 font-black text-[10px] md:text-xs uppercase tracking-widest">
                  <span>Đọc bài viết</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;

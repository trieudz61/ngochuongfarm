
import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, createNews, updateNewsArticle, deleteNews, newsAPI } from '../store';
import { 
  Plus, Edit2, Trash2, Search, X, Check, 
  Newspaper, Image as ImageIcon, Video, 
  Bold, Italic, Type, List, Eye, Code,
  ExternalLink, Play, HelpCircle, User, Calendar, Upload,
  Underline, AlignLeft, AlignCenter, AlignRight, Link,
  Quote, Minus, Hash, ListOrdered, ToggleLeft, ToggleRight
} from 'lucide-react';
import { NewsArticle } from '../types';
import { ContentRenderer } from '../components/ContentRenderer';
import { saveImageToStorage, saveBase64ToStorage } from '../utils/imageStorage';
import AdminLayout from '../components/AdminLayout';

const AdminNews: React.FC = () => {
  const news = useSelector((state: RootState) => state.app.news);
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [search, setSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false); // Toggle giữa Markdown và HTML
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: '',
    summary: '',
    content: '',
    image: '',
    category: 'Kỹ thuật',
    author: 'Admin Ngọc Hường'
  });

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newContent = beforeText + before + selected + after + afterText;
    setFormData({ ...formData, content: newContent });
    
    // Đặt lại con trỏ sau khi chèn
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + (selected ? selected.length + after.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // HTML helper functions
  const insertHtmlTag = (tag: string, attributes: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
    const closeTag = `</${tag}>`;
    const newContent = beforeText + openTag + selected + closeTag + afterText;
    
    setFormData({ ...formData, content: newContent });
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + (selected ? selected.length + closeTag.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHtmlElement = (element: string) => {
    insertText(element + '\n');
  };

  const handleCoverImageUpload = async (file: File | null) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      // Upload lên server
      const imageUrl = await newsAPI.uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      // Fallback: lưu vào IndexedDB nếu server không available
      if (error.message === 'BACKEND_OFFLINE') {
        try {
          const blobUrl = await saveImageToStorage(file);
          setFormData({ ...formData, image: blobUrl });
          alert('Backend chưa chạy. Ảnh đã được lưu cục bộ. Vui lòng start backend để upload lên server.');
        } catch (fallbackError) {
          alert('Lỗi khi tải ảnh lên. Vui lòng kiểm tra backend server hoặc thử lại.');
          console.error(fallbackError);
        }
      } else {
        alert(`Lỗi upload: ${error.message || 'Vui lòng thử lại'}`);
      }
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      // Upload lên server
      const imageUrl = await newsAPI.uploadImage(file);
      insertText(`[img]${imageUrl}[/img]\n\n`);
    } catch (error: any) {
      console.error('Upload error:', error);
      // Fallback: lưu vào IndexedDB
      if (error.message === 'BACKEND_OFFLINE') {
        try {
          const blobUrl = await saveImageToStorage(file);
          insertText(`[img]${blobUrl}[/img]\n\n`);
          alert('Backend chưa chạy. Ảnh đã được lưu cục bộ.');
        } catch (fallbackError) {
          alert('Lỗi khi tải ảnh lên. Vui lòng kiểm tra backend server.');
          console.error(fallbackError);
        }
      } else {
        alert(`Lỗi upload: ${error.message || 'Vui lòng thử lại'}`);
      }
    }
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('Vui lòng chọn file video hợp lệ');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('Kích thước video không được vượt quá 50MB. Với video lớn hơn, vui lòng upload lên YouTube và dùng link.');
      return;
    }

    try {
      // Upload video lên server
      const videoUrl = await newsAPI.uploadVideo(file);
      insertText(`[video]${videoUrl}[/video]\n\n`);
    } catch (error: any) {
      console.error('Upload video error:', error);
      // Fallback: dùng base64 nếu server không available
      if (error.message === 'BACKEND_OFFLINE') {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64 = reader.result as string;
            insertText(`[video]${base64}[/video]\n\n`);
            alert('Backend chưa chạy. Video đã được lưu cục bộ (base64). Vui lòng start backend để upload lên server.');
          };
          reader.onerror = () => {
            alert('Lỗi khi tải video lên. Vui lòng kiểm tra backend server.');
          };
        } catch (fallbackError) {
          alert('Lỗi khi tải video lên. Vui lòng kiểm tra backend server hoặc thử lại.');
          console.error(fallbackError);
        }
      } else {
        alert(`Lỗi upload video: ${error.message || 'Vui lòng thử lại'}`);
      }
    }
  };

  const handleEdit = (item: NewsArticle) => {
    setEditingNews(item);
    setFormData(item);
    setIsModalOpen(true);
    setPreviewMode(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận xóa bài viết này? Bài viết sẽ biến mất khỏi trang chủ và không thể khôi phục.')) {
      try {
        await dispatch(deleteNews(id)).unwrap();
      } catch (error: any) {
        alert(error || 'Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.image) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Tiêu đề, Ảnh bìa, Nội dung)');
      return;
    }

    const newsData = {
      ...formData,
      id: editingNews ? editingNews.id : 'N' + Date.now(),
      createdAt: editingNews ? editingNews.createdAt : new Date().toISOString()
    } as NewsArticle;

    try {
      if (editingNews) {
        await dispatch(updateNewsArticle({ id: editingNews.id, article: newsData })).unwrap();
      } else {
        await dispatch(createNews(newsData)).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error || 'Có lỗi xảy ra khi lưu bài viết');
    }
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({ 
      title: '', 
      summary: '', 
      content: '', 
      image: '', 
      category: 'Kỹ thuật', 
      author: 'Admin Ngọc Hường' 
    });
    setPreviewMode(false);
    setIsHtmlMode(false);
  };

  // Sắp xếp tin tức theo thời gian mới nhất lên đầu
  const sortedAndFilteredNews = [...news]
    .filter(n => 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AdminLayout 
      title="Quản Trị Tin Tức" 
      subtitle="Biên tập nội dung đa phương tiện, kỹ thuật & mùa vụ."
    >
      {/* Header Controller */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex-1">
          {/* Title is now handled by AdminLayout */}
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-4 md:px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-orange-100 transition-all active:scale-95 uppercase text-[10px] md:text-xs tracking-wide md:tracking-widest"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" /> Viết Bài Mới
        </button>
      </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-10 flex items-center gap-3">
          <div className="bg-gray-50 p-3 rounded-xl ml-1 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết theo tiêu đề hoặc danh mục..." 
            className="flex-grow outline-none font-bold text-gray-700 bg-transparent py-2 px-2" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {/* List of Articles */}
        <div className="grid grid-cols-1 gap-6">
          {sortedAndFilteredNews.length > 0 ? sortedAndFilteredNews.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all group overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                <div className="w-full md:w-32 h-32 rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-50 shrink-0">
                   <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-300 font-bold uppercase">{item.id}</span>
                  </div>
                  <h3 className="font-black text-gray-900 text-xl leading-tight mb-2 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                  <div className="text-xs text-gray-400 font-bold flex items-center gap-4">
                     <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                     <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {item.author}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleEdit(item)} 
                  className="flex-1 md:flex-none p-4 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                  title="Sửa bài"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="flex-1 md:flex-none p-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                  title="Xóa bài"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
               <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Không tìm thấy bài viết nào</p>
            </div>
          )}
        </div>

      {/* Modern Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-orange-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-none md:rounded-[3rem] shadow-2xl w-full max-w-7xl relative z-10 overflow-hidden flex flex-col h-full md:h-[92vh] animate-in zoom-in duration-300">
            {/* Modal Header Toolbar */}
            <div className="bg-gray-900 p-5 md:p-8 text-white flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
              <div className="flex items-center gap-4">
                 <div className="bg-orange-600 p-2.5 rounded-2xl">
                    <Newspaper className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">{editingNews ? 'Chỉnh sửa bài viết' : 'Biên tập bài viết mới'}</h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Rich Text Agricultural Editor</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <button 
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewMode ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                 >
                   {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   {previewMode ? 'Quay lại soạn thảo' : 'Xem trước bài đăng'}
                 </button>
                 <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-white/60 uppercase tracking-widest">
                   <span>{isHtmlMode ? 'HTML' : 'Markdown'} Mode</span>
                   <div className={`w-2 h-2 rounded-full ${isHtmlMode ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white border border-white/10">
                    <X className="w-6 h-6" />
                 </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-grow overflow-hidden bg-gray-50 flex flex-col lg:flex-row">
              {/* Left Column: Editor Form */}
              <div className={`w-full ${previewMode ? 'hidden lg:flex lg:w-1/2' : 'flex'} flex-col bg-white border-r border-gray-100 h-full overflow-y-auto custom-scrollbar`}>
                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 flex flex-col min-h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Tiêu đề bài đăng *</label>
                      <input 
                        required 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-black text-lg" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        placeholder="VD: Bí quyết bón phân hữu cơ cho cam..." 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Danh mục tin</label>
                      <select 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-black appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as any})}
                      >
                        <option value="Kỹ thuật">Kỹ thuật canh tác</option>
                        <option value="Sự kiện">Sự kiện trang trại</option>
                        <option value="Mùa vụ">Thông tin mùa vụ</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Ảnh bìa *</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required 
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold pr-32" 
                          value={formData.image} 
                          onChange={async (e) => {
                            const value = e.target.value;
                            // Nếu là base64, tự động convert sang blob URL
                            if (value.startsWith('data:image/')) {
                              try {
                                const blobUrl = await saveBase64ToStorage(value);
                                setFormData({...formData, image: blobUrl});
                              } catch (error) {
                                console.error('Error converting base64:', error);
                                setFormData({...formData, image: value});
                              }
                            } else {
                              setFormData({...formData, image: value});
                            }
                          }} 
                          placeholder="Nhập URL hoặc upload ảnh..." 
                        />
                        <input
                          ref={coverImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) handleCoverImageUpload(file);
                          }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => coverImageInputRef.current?.click()}
                            className="px-3 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload
                          </button>
                          <div className="text-gray-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      {formData.image && (
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-gray-100 mt-2">
                          <img 
                            src={formData.image} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800?text=Invalid+Image';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Tóm tắt ngắn (Dưới 150 chữ)</label>
                    <textarea 
                      rows={2} 
                      className="w-full bg-orange-50/30 border-2 border-transparent focus:border-orange-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium italic text-orange-900" 
                      value={formData.summary} 
                      onChange={e => setFormData({...formData, summary: e.target.value})} 
                      placeholder="Một đoạn giới thiệu ngắn để thu hút người đọc..." 
                    />
                  </div>

                  {/* Enhanced Rich Content Editor with HTML Support */}
                  <div className="space-y-4 flex flex-col flex-grow">
                    <div className="flex flex-col gap-4">
                      {/* Editor Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1 flex items-center gap-2">
                          Nội dung chi tiết * 
                          <div className="group relative">
                             <HelpCircle className="w-3.5 h-3.5" />
                             <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-gray-900 text-white text-[8px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                               <strong>Markdown Mode:</strong> Dùng **bold**, _italic_, ## heading<br/>
                               <strong>HTML Mode:</strong> Dùng thẻ HTML như &lt;p&gt;, &lt;strong&gt;, &lt;h2&gt;
                             </div>
                          </div>
                        </label>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setIsHtmlMode(false)}
                              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                !isHtmlMode 
                                  ? 'bg-white text-orange-600 shadow-sm' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Markdown
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsHtmlMode(true)}
                              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                isHtmlMode 
                                  ? 'bg-white text-orange-600 shadow-sm' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              HTML
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Toolbar */}
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        {!isHtmlMode ? (
                          // Markdown Toolbar
                          <div className="flex flex-wrap gap-1">
                            <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                              <button type="button" onClick={() => insertText('**', '**')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="In đậm"><Bold className="w-4 h-4" /></button>
                              <button type="button" onClick={() => insertText('_', '_')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="In nghiêng"><Italic className="w-4 h-4" /></button>
                              <button type="button" onClick={() => insertText('## ')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="Tiêu đề phụ"><Type className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                              <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (file) handleImageUpload(file);
                                }}
                              />
                              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-gray-500 transition-all" title="Upload ảnh">
                                <Upload className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => insertText('[img]', '[/img]')} className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-gray-500 transition-all" title="Chèn ảnh URL"><ImageIcon className="w-4 h-4" /></button>
                              
                              <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (file) handleVideoUpload(file);
                                }}
                              />
                              <button type="button" onClick={() => videoInputRef.current?.click()} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-all" title="Upload video">
                                <Upload className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => insertText('[video]', '[/video]')} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-all" title="Chèn Video URL"><Play className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ) : (
                          // HTML Toolbar
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {/* Text Formatting */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <button type="button" onClick={() => insertHtmlTag('strong')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="In đậm"><Bold className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlTag('em')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="In nghiêng"><Italic className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlTag('u')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="Gạch chân"><Underline className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlTag('mark')} className="p-2 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg text-gray-500 transition-all" title="Highlight">🖍️</button>
                              </div>

                              {/* Headings */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <button type="button" onClick={() => insertHtmlTag('h1')} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-500 transition-all text-xs font-bold" title="Heading 1">H1</button>
                                <button type="button" onClick={() => insertHtmlTag('h2')} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-500 transition-all text-xs font-bold" title="Heading 2">H2</button>
                                <button type="button" onClick={() => insertHtmlTag('h3')} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-500 transition-all text-xs font-bold" title="Heading 3">H3</button>
                              </div>

                              {/* Lists */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <button type="button" onClick={() => insertHtmlElement('<ul>\n  <li>Mục 1</li>\n  <li>Mục 2</li>\n</ul>')} className="p-2 hover:bg-green-50 hover:text-green-600 rounded-lg text-gray-500 transition-all" title="Danh sách không số"><List className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlElement('<ol>\n  <li>Bước 1</li>\n  <li>Bước 2</li>\n</ol>')} className="p-2 hover:bg-green-50 hover:text-green-600 rounded-lg text-gray-500 transition-all" title="Danh sách có số"><ListOrdered className="w-4 h-4" /></button>
                              </div>

                              {/* Alignment */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <button type="button" onClick={() => insertHtmlTag('div', 'style="text-align: left"')} className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-gray-500 transition-all" title="Căn trái"><AlignLeft className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlTag('div', 'style="text-align: center"')} className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-gray-500 transition-all" title="Căn giữa"><AlignCenter className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlTag('div', 'style="text-align: right"')} className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-gray-500 transition-all" title="Căn phải"><AlignRight className="w-4 h-4" /></button>
                              </div>
                            </div>

                            {/* Second Row */}
                            <div className="flex flex-wrap gap-1">
                              {/* Media */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <input
                                  ref={imageInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                      handleImageUpload(file).then(() => {
                                        // Convert to HTML img tag
                                        const textarea = textareaRef.current;
                                        if (textarea) {
                                          const content = textarea.value;
                                          const lastImgTag = content.match(/\[img\](.*?)\[\/img\]/g)?.pop();
                                          if (lastImgTag) {
                                            const url = lastImgTag.replace('[img]', '').replace('[/img]', '');
                                            const htmlImg = `<img src="${url}" alt="Hình ảnh minh họa" style="width: 100%; border-radius: 1rem; margin: 1rem 0;" />`;
                                            const newContent = content.replace(lastImgTag, htmlImg);
                                            setFormData({ ...formData, content: newContent });
                                          }
                                        }
                                      });
                                    }
                                  }}
                                />
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-gray-500 transition-all" title="Upload ảnh">
                                  <Upload className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => insertHtmlElement('<img src="URL_ẢNH" alt="Mô tả ảnh" style="width: 100%; border-radius: 1rem; margin: 1rem 0;" />')} className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-gray-500 transition-all" title="Chèn ảnh HTML"><ImageIcon className="w-4 h-4" /></button>
                              </div>

                              {/* Special Elements */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <button type="button" onClick={() => insertHtmlTag('blockquote', 'style="border-left: 4px solid #ea580c; padding-left: 1rem; font-style: italic; color: #9a3412;"')} className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 transition-all" title="Trích dẫn"><Quote className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlElement('<hr style="border: none; height: 2px; background: linear-gradient(to right, #ea580c, transparent); margin: 2rem 0;" />')} className="p-2 hover:bg-gray-100 hover:text-gray-600 rounded-lg text-gray-500 transition-all" title="Đường kẻ ngang"><Minus className="w-4 h-4" /></button>
                                <button type="button" onClick={() => insertHtmlTag('a', 'href="URL_LINK" target="_blank"')} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-500 transition-all" title="Liên kết"><Link className="w-4 h-4" /></button>
                              </div>

                              {/* Table */}
                              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100">
                                <button 
                                  type="button" 
                                  onClick={() => insertHtmlElement(`<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
  <thead>
    <tr style="background-color: #fed7aa;">
      <th style="border: 1px solid #fdba74; padding: 0.5rem; text-align: left;">Tiêu đề 1</th>
      <th style="border: 1px solid #fdba74; padding: 0.5rem; text-align: left;">Tiêu đề 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #fdba74; padding: 0.5rem;">Dữ liệu 1</td>
      <td style="border: 1px solid #fdba74; padding: 0.5rem;">Dữ liệu 2</td>
    </tr>
  </tbody>
</table>`)} 
                                  className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-gray-500 transition-all text-xs font-bold" 
                                  title="Chèn bảng"
                                >
                                  📊
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <textarea 
                      ref={textareaRef}
                      required 
                      className="w-full flex-grow min-h-[400px] bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-6 rounded-3xl outline-none transition-all font-medium text-gray-700 text-sm leading-relaxed custom-scrollbar"
                      value={formData.content} 
                      onChange={e => setFormData({...formData, content: e.target.value})} 
                      placeholder={isHtmlMode ? 
                        `Soạn thảo bài viết bằng HTML...\n\n<h2>Tiêu đề chính</h2>\n<p>Đoạn văn bản với <strong>chữ đậm</strong> và <em>chữ nghiêng</em>.</p>\n<img src="URL_ẢNH" alt="Mô tả" style="width: 100%; border-radius: 1rem;" />\n<blockquote>Trích dẫn quan trọng</blockquote>` :
                        `Soạn thảo bài viết tại đây...\n\n- Dùng **chữ đậm** cho các ý chính\n- Dùng ## cho các tiêu đề mục\n- Dùng [img]link_anh[/img] để minh họa\n- Dùng [video]link_youtube[/video] để thêm video hướng dẫn`
                      }
                      style={{ fontFamily: isHtmlMode ? 'Monaco, Consolas, monospace' : 'inherit' }}
                    />
                  </div>

                  <div className="pt-6 pb-10">
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black shadow-2xl shadow-orange-100 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm">
                      <Check className="w-6 h-6" /> {editingNews ? 'Lưu thay đổi bài viết' : 'Xuất bản bài viết ngay'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Preview Panel */}
              <div className={`${previewMode ? 'flex w-full' : 'hidden lg:flex lg:w-1/2'} flex-col bg-white overflow-y-auto custom-scrollbar`}>
                <div className="sticky top-0 z-10 p-4 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Giao diện hiển thị thực tế</span>
                  <span className="text-orange-600">Ngọc Hường Farm CMS</span>
                </div>
                <div className="p-8 md:p-16 max-w-4xl mx-auto w-full">
                  {formData.image ? (
                    <div className="aspect-video w-full rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl mb-12 border-4 border-white">
                       <img src={formData.image} className="w-full h-full object-cover" alt="Article Hero" />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-[3.5rem] bg-gray-50 border-4 border-dashed border-gray-200 mb-12 flex flex-col items-center justify-center text-gray-300">
                       <ImageIcon className="w-12 h-12 mb-2" />
                       <span className="text-[10px] font-black uppercase">Chưa có ảnh bìa</span>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {formData.category}
                      </span>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                      {formData.title || 'Tiêu đề bài viết sẽ hiển thị tại đây'}
                    </h1>
                    
                    <div className="flex items-center gap-3 py-6 border-y border-gray-100">
                      <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xs">NH</div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-none">{formData.author}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Biên tập viên nông trại</p>
                      </div>
                    </div>

                    {formData.summary && (
                      <div className="bg-orange-50/50 border-l-4 border-orange-600 p-8 rounded-r-3xl italic font-bold text-orange-950 text-lg leading-relaxed shadow-sm">
                         "{formData.summary}"
                      </div>
                    )}

                    <div className="mt-10">
                      <ContentRenderer content={formData.content || ''} allowHtml={isHtmlMode} />
                    </div>
                    
                    {(!formData.content || formData.content.trim() === '') && (
                      <div className="py-20 text-center text-gray-300">
                         <Code className="w-12 h-12 mx-auto mb-4 opacity-20" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Nội dung đang được biên soạn...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminNews;

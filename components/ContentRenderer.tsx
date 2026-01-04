
import React from 'react';

interface ContentRendererProps {
  content: string;
  allowHtml?: boolean; // Cho phép render HTML trực tiếp
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, allowHtml = false }) => {
  if (!content) return null;

  // Nếu cho phép HTML, render trực tiếp với sanitization cơ bản
  if (allowHtml) {
    // Sanitize HTML cơ bản - loại bỏ các thẻ nguy hiểm
    const sanitizeHtml = (html: string) => {
      // Danh sách thẻ được phép
      const allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th',
        'thead', 'tbody', 'pre', 'code', 'hr', 'small', 'sub', 'sup', 'mark', 'del', 'ins'
      ];
      
      // Danh sách thuộc tính được phép
      const allowedAttributes = ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target'];
      
      // Loại bỏ script và các thẻ nguy hiểm
      let sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '') // Loại bỏ event handlers
        .replace(/javascript:/gi, ''); // Loại bỏ javascript: URLs
      
      return sanitized;
    };

    const sanitizedContent = sanitizeHtml(content);
    
    return (
      <div 
        className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed html-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{
          // Custom CSS cho HTML content
          '--tw-prose-body': 'rgb(75 85 99)',
          '--tw-prose-headings': 'rgb(17 24 39)',
          '--tw-prose-lead': 'rgb(75 85 99)',
          '--tw-prose-links': 'rgb(234 88 12)',
          '--tw-prose-bold': 'rgb(17 24 39)',
          '--tw-prose-counters': 'rgb(107 114 128)',
          '--tw-prose-bullets': 'rgb(209 213 219)',
          '--tw-prose-hr': 'rgb(229 231 235)',
          '--tw-prose-quotes': 'rgb(17 24 39)',
          '--tw-prose-quote-borders': 'rgb(234 88 12)',
          '--tw-prose-captions': 'rgb(107 114 128)',
          '--tw-prose-code': 'rgb(17 24 39)',
          '--tw-prose-pre-code': 'rgb(229 231 235)',
          '--tw-prose-pre-bg': 'rgb(31 41 55)',
          '--tw-prose-th-borders': 'rgb(209 213 219)',
          '--tw-prose-td-borders': 'rgb(229 231 235)',
        } as React.CSSProperties}
      />
    );
  }

  // Logic render hỗ trợ Markdown-like (giữ nguyên cho backward compatibility)
  return (
    <div className="space-y-6 text-gray-700 leading-relaxed md:text-lg">
      {content.split('\n').map((block, idx) => {
        const text = block.trim();
        if (!text) return <div key={idx} className="h-4"></div>;

        // Xử lý Video YouTube hoặc MP4: [video]url[/video]
        if (text.startsWith('[video]') && text.endsWith('[/video]')) {
          const url = text.replace('[video]', '').replace('[/video]', '');
          const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
          if (isYoutube) {
            const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return (
              <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl my-10 border-4 border-white">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            );
          }
          return (
            <div key={idx} className="my-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
              <video controls className="w-full">
                <source src={url} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            </div>
          );
        }

        // Xử lý Ảnh xen kẽ: [img]url[/img]
        if (text.startsWith('[img]') && text.endsWith('[/img]')) {
          const url = text.replace('[img]', '').replace('[/img]', '');
          return (
            <figure key={idx} className="my-10">
              <img src={url} className="w-full rounded-[2rem] md:rounded-[3rem] shadow-xl border-4 border-white" alt="Chi tiết bài viết" />
            </figure>
          );
        }

        // Xử lý tiêu đề: ## Tiêu đề
        if (text.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-2xl md:text-3xl font-black text-gray-900 pt-8 pb-2 border-b-2 border-orange-50 flex items-center gap-3">
              <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
              {text.replace('## ', '')}
            </h2>
          );
        }

        // Xử lý định dạng chữ (Bold/Italic) đơn giản qua regex
        const formattedText = text
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-gray-900">$1</strong>')
          .replace(/_(.*?)_/g, '<em class="italic text-orange-800">$1</em>');

        return (
          <p 
            key={idx} 
            dangerouslySetInnerHTML={{ __html: formattedText }}
            className="font-medium text-gray-600"
          ></p>
        );
      })}
    </div>
  );
};

export default ContentRenderer;

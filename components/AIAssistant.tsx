
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, X, Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Xin chào! Tôi là Trợ lý Ảo Ngọc Hường Farm. Tôi có thể giúp bạn chọn loại trái cây ngon nhất hoặc chia sẻ công thức nước ép bổ dưỡng từ cam, bưởi của nông trại. Bạn cần tư vấn gì không?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const products = useSelector((state: RootState) => state.app.products);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      const productContext = products.map(p => `- ${p.name}: ${p.price}đ/${p.unit} (Nguồn: ${p.origin})`).join('\n');
      
      const prompt = `
        Bạn là chuyên gia tư vấn của Ngọc Hường Farm. 
        Nông trại chúng tôi ở Hạnh Lâm, Thanh Chương, Nghệ An, chuyên Cam Vinh, Bưởi Da Xanh, Cam Bù chuẩn TQC.
        
        Sản phẩm hiện có:
        ${productContext}
        
        Yêu cầu:
        1. Trả lời lịch sự, thân thiện, mang đậm chất nông dân hiếu khách Nghệ An.
        2. Tư vấn các sản phẩm dựa trên nhu cầu của khách.
        3. Cung cấp công thức chế biến (nước ép, mứt, salad...) từ cam bưởi nếu khách hỏi.
        4. Giải thích về quy trình canh tác hữu cơ TQC của chúng tôi.
        5. Trả lời ngắn gọn, súc tích bằng tiếng Việt.
        
        Câu hỏi khách hàng: ${userMessage}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const aiText = response.text || "Xin lỗi, tôi gặp chút trục trặc khi kết nối. Bạn có thể gọi hotline 0987.936.737 để được hỗ trợ ngay nhé!";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Hệ thống đang bận một chút, bạn thử lại sau nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-40 right-6 z-[101] w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl uppercase tracking-widest">
            AI Tư Vấn Nông Sản
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[101] w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[2rem] shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black uppercase text-sm tracking-tight leading-none">AI Smart Farm</h3>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">Trực tuyến 24/7</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar bg-emerald-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-emerald-50'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-emerald-50">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-emerald-50">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Hỏi AI về sản phẩm..."
                className="flex-grow bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-3 outline-none font-bold text-sm transition-all"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;

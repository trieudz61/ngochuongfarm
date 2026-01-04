// Component hiển thị trạng thái backend
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { getApiUrl } from '../src/config/api.js';

const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${getApiUrl('/api')}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000) // Timeout 3s
        });
        setStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setStatus('offline');
      }
    };

    checkBackend();
    // Check lại mỗi 30s
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'online' || !showWarning) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[200] animate-in slide-in-from-bottom-4 duration-500">
      <div className={`p-4 rounded-2xl shadow-2xl border-2 ${
        status === 'offline' 
          ? 'bg-amber-50 border-amber-200 text-amber-900' 
          : 'bg-blue-50 border-blue-200 text-blue-900'
      }`}>
        <div className="flex items-start gap-3">
          {status === 'offline' ? (
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="font-black text-sm mb-1 uppercase">
              {status === 'offline' ? 'Backend chưa chạy' : 'Đang kết nối...'}
            </h4>
            {status === 'offline' && (
              <p className="text-xs font-bold leading-relaxed mb-2">
                App đang sử dụng localStorage. Để đồng bộ dữ liệu, hãy chạy backend server:
              </p>
            )}
            {status === 'offline' && (
              <div className="bg-white/50 p-2 rounded-lg font-mono text-[10px] mb-2">
                cd server<br />
                npm install<br />
                npm run dev
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowWarning(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;


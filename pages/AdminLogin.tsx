import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, AlertCircle } from 'lucide-react';
import { RootState, login } from '../store';

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const isAdmin = useSelector((state: RootState) => state.app.isAdmin);

  // Nếu đã đăng nhập admin, redirect về dashboard
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Kiểm tra tài khoản admin
      // Tạm thời dùng hardcoded, sau có thể tích hợp với backend
      if (email.trim() === 'admin') {
        if (password === '123') {
          dispatch(login({ 
            id: 'admin-1', 
            name: 'Quản Trị Viên', 
            email: 'admin', 
            role: 'admin' 
          }));
          navigate('/admin', { replace: true });
        } else {
          setError('Mật khẩu không chính xác!');
        }
      } else {
        setError('Tài khoản admin không hợp lệ!');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white text-center">
          <Sprout className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black uppercase mb-2">Đăng Nhập Admin</h1>
          <p className="text-sm text-orange-100 font-medium">Ngọc Hường Farm - Quản Trị</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
              Tài khoản Admin
            </label>
            <input 
              type="text" 
              required 
              className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold border-2 border-transparent focus:border-orange-500 transition-all text-gray-900" 
              placeholder="Nhập tài khoản admin" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
              Mật khẩu
            </label>
            <input 
              type="password" 
              required 
              className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold border-2 border-transparent focus:border-orange-500 transition-all text-gray-900" 
              placeholder="Nhập mật khẩu" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-black uppercase transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link 
              to="/" 
              className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default AdminLogin;


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store';
import { Home, LogOut, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  backTo = '/admin',
  backLabel = 'Dashboard'
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      dispatch(logout());
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              {backTo && (
                <Link 
                  to={backTo} 
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" /> {backLabel}
                </Link>
              )}
              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-black text-gray-900 uppercase tracking-tight truncate">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link 
                to="/" 
                className="px-2 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest transition-all flex items-center gap-1 md:gap-2"
              >
                <Home className="w-4 h-4" /> <span>Trang Chủ</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="px-2 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest transition-all flex items-center gap-1 md:gap-2 shadow-lg shadow-red-100"
              >
                <LogOut className="w-4 h-4" /> <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;


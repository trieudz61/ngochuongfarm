// Component để load dữ liệu từ API khi app khởi động
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, fetchProducts, fetchNews, fetchCoupons } from '../store';
import { getCookieId } from '../utils/cookieManager';

const DataLoader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Tạo cookieId tự động cho user nếu chưa có (mỗi browser sẽ có cookieId riêng)
    const cookieId = getCookieId();
    console.log(`[DataLoader] Cookie ID: ${cookieId}`);
    
    // Kiểm tra backend có online không
import { getApiUrl } from '../src/config/api.js';

// ... existing code ...

        const checkBackend = async () => {
      try {
        const response = await fetch(`${getApiUrl('/api')}/health`);
        if (response.ok) {
          setBackendOnline(true);
          // Backend online - load từ API
          dispatch(fetchProducts());
          dispatch(fetchNews());
          dispatch(fetchCoupons());
          
          // Orders sẽ được fetch riêng ở từng component (Cart, OrderHistory) với cookieId
        } else {
          setBackendOnline(false);
        }
      } catch (error) {
        console.warn('Backend không khả dụng, sử dụng localStorage fallback');
        setBackendOnline(false);
        // Backend offline - sẽ dùng fallback trong extraReducers
        dispatch(fetchProducts());
        dispatch(fetchNews());
        dispatch(fetchCoupons());
      }
    };

    checkBackend();
  }, [dispatch]);

  // Hiển thị warning nếu backend offline (optional)
  if (backendOnline === false) {
    console.warn('⚠️ Backend server chưa chạy. App sẽ sử dụng localStorage. Hãy chạy: cd server && npm run dev');
  }

  return null; // Component này không render gì
};

export default DataLoader;


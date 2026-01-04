import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchOrders } from '../store';

/**
 * Component chạy ngầm để tự động fetch orders mới cho admin
 * Polling mỗi 10 giây để phát hiện đơn hàng mới
 */
const AdminOrdersPoller: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAdmin = useSelector((state: RootState) => state.app.isAdmin);

  useEffect(() => {
    // Chỉ chạy khi user là admin
    if (!isAdmin) return;

    console.log('[AdminOrdersPoller] Started - Polling every 10 seconds');

    // Fetch ngay lần đầu
    dispatch(fetchOrders(null)); // null = fetch all orders (admin mode)

    // Setup interval để fetch định kỳ
    const intervalId = setInterval(() => {
      console.log('[AdminOrdersPoller] Fetching orders...');
      dispatch(fetchOrders(null)); // null = fetch all orders (admin mode)
    }, 10000); // 10 giây

    // Cleanup khi component unmount hoặc admin logout
    return () => {
      console.log('[AdminOrdersPoller] Stopped');
      clearInterval(intervalId);
    };
  }, [isAdmin, dispatch]);

  // Component này không render gì
  return null;
};

export default AdminOrdersPoller;



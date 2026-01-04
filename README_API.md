# Ngọc Hường Farm - Backend Database Setup

## Tổng quan

Dự án đã được nâng cấp từ localStorage sang database thật để có thể vận hành như một ứng dụng web chuyên nghiệp. Khi admin thay đổi thông tin, tất cả user sẽ thấy thay đổi ngay lập tức.

## Kiến trúc

```
Frontend (React) 
    ↓
API Layer (utils/api.ts)
    ↓
Backend Server (Node.js + Express)
    ↓
Database (SQLite)
```

## Setup

### Bước 1: Cài đặt Backend

```bash
cd server
npm install
```

### Bước 2: Chạy Backend Server

```bash
npm run dev
```

Server chạy tại: `http://localhost:3001`

### Bước 3: Cấu hình Frontend

Tạo file `.env` trong thư mục gốc:
```
VITE_API_URL=http://localhost:3001/api
```

### Bước 4: Restart Frontend

```bash
npm run dev
```

## Database

- **Type**: SQLite (có thể nâng cấp PostgreSQL/MySQL sau)
- **Location**: `server/ngochuongfarm.db`
- **Uploads**: `server/uploads/`

Database tự động tạo các bảng khi chạy lần đầu.

## API Endpoints

### Products
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `POST /api/products/upload-image` - Upload ảnh sản phẩm

### News
- `GET /api/news` - Lấy tất cả tin tức
- `GET /api/news/:id` - Lấy tin tức theo ID
- `POST /api/news` - Tạo tin tức mới
- `PUT /api/news/:id` - Cập nhật tin tức
- `DELETE /api/news/:id` - Xóa tin tức
- `POST /api/news/upload-image` - Upload ảnh bìa

### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng
- `GET /api/orders/:id` - Lấy đơn hàng theo ID
- `POST /api/orders` - Tạo đơn hàng mới
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái
- `GET /api/orders/track/:id` - Tra cứu đơn hàng

### Coupons
- `GET /api/coupons` - Lấy tất cả mã giảm giá
- `POST /api/coupons` - Tạo mã giảm giá
- `PUT /api/coupons/:id` - Cập nhật mã
- `DELETE /api/coupons/:id` - Xóa mã
- `GET /api/coupons/validate/:code` - Validate mã

## Flow hoạt động

1. **Khi app khởi động**: `DataLoader` component tự động fetch products, news, coupons từ API
2. **Admin thay đổi**: CRUD operations gọi API → Database cập nhật
3. **User xem**: Frontend fetch dữ liệu mới nhất từ API
4. **Đồng bộ real-time**: Tất cả user thấy thay đổi ngay lập tức

## Fallback

Nếu API không khả dụng:
- Frontend fallback về localStorage (cached data)
- Upload ảnh fallback về IndexedDB

## Production Deployment

Xem hướng dẫn chi tiết trong `SETUP_BACKEND.md`


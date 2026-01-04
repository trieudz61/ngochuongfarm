# Hướng dẫn Setup Backend Database

## Bước 1: Cài đặt Backend Server

```bash
cd server
npm install
```

## Bước 2: Chạy Backend Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3001`

## Bước 3: Cấu hình Frontend

Tạo file `.env` trong thư mục gốc:
```
VITE_API_URL=http://localhost:3001/api
```

## Bước 4: Restart Frontend

```bash
npm run dev
```

## Kiểm tra kết nối

1. Mở browser: `http://localhost:3001/api/health`
2. Phải thấy: `{"success":true,"data":{"status":"OK",...}}`

## Database

- Database SQLite được tự động tạo tại: `server/ngochuongfarm.db`
- Upload images được lưu tại: `server/uploads/`
- Database sẽ tự động tạo các bảng khi chạy lần đầu

## Production Deployment

### Option 1: Deploy lên Railway/Render
1. Push code lên GitHub
2. Connect repository với Railway/Render
3. Set environment variable: `VITE_API_URL=https://your-api-url.com/api`
4. Deploy!

### Option 2: VPS
1. SSH vào server
2. Clone repository
3. Cài đặt Node.js
4. Chạy `npm install` trong thư mục server
5. Sử dụng PM2 để chạy: `pm2 start server.js`
6. Cấu hình Nginx reverse proxy

### Option 3: Nâng cấp Database
Để scale lớn hơn, có thể migrate sang PostgreSQL/MySQL:
- Thay thế SQLite bằng PostgreSQL
- Sử dụng connection pool
- Backup tự động

## API Endpoints

Tất cả API endpoints đều có prefix `/api`:
- `/api/products` - Quản lý sản phẩm
- `/api/news` - Quản lý tin tức  
- `/api/orders` - Quản lý đơn hàng
- `/api/coupons` - Quản lý mã giảm giá

Xem chi tiết trong `server/README.md`


# Ngọc Hường Farm - Backend API Server

## Cài đặt

1. **Cài đặt dependencies:**
```bash
cd server
npm install
```

2. **Chạy server:**
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3001`

## Cấu trúc Database

Database SQLite được tự động tạo với các bảng:
- `products` - Sản phẩm
- `news` - Tin tức
- `orders` - Đơn hàng
- `coupons` - Mã giảm giá
- `reviews` - Đánh giá sản phẩm
- `users` - Người dùng

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
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn hàng
- `GET /api/orders/track/:id` - Tra cứu đơn hàng

### Coupons
- `GET /api/coupons` - Lấy tất cả mã giảm giá
- `POST /api/coupons` - Tạo mã giảm giá mới
- `PUT /api/coupons/:id` - Cập nhật mã giảm giá
- `DELETE /api/coupons/:id` - Xóa mã giảm giá
- `GET /api/coupons/validate/:code` - Validate mã giảm giá

## Environment Variables

Tạo file `.env` trong thư mục server:
```
PORT=3001
NODE_ENV=development
```

## Production Deployment

Để deploy production, bạn có thể:
1. Sử dụng SQLite (hiện tại) - phù hợp cho app nhỏ
2. Nâng cấp lên PostgreSQL/MySQL cho scale lớn hơn
3. Deploy lên Heroku, Railway, hoặc VPS


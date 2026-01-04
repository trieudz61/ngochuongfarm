# Hướng dẫn Deploy lên Shared Hosting

## Bước 1: Deploy Backend (miễn phí)

### Option A: Railway
1. Tạo tài khoản: https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Chọn repo của bạn
4. Environment Variables:
   ```
   NODE_ENV=production
   GEMINI_API_KEY=your_api_key
   ```
5. Lấy URL backend (vd: https://your-app.railway.app)

### Option B: Render
1. Tạo tài khoản: https://render.com
2. "New Web Service" → Connect GitHub
3. Settings:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. Environment Variables: `GEMINI_API_KEY`

## Bước 2: Deploy Frontend lên hosting của bạn

### Chuẩn bị files:
```bash
# Cập nhật API URL trong src/config/api.js
# Thay 'https://your-backend-app.railway.app' bằng URL thật

# Build frontend
node deploy-to-hosting.js
```

### Upload lên hosting:
1. **Zip thư mục dist/**
2. **Login vào cPanel/hosting panel**
3. **File Manager → public_html/**
4. **Upload file zip**
5. **Extract zip file**
6. **Xóa file zip**

## Bước 3: Cấu hình Domain

### Nếu muốn dùng subdomain cho API:
- Tạo subdomain: `api.yourdomain.com`
- Point đến backend URL (CNAME record)

### DNS Settings:
- A Record: `@` → IP hosting
- CNAME: `www` → `yourdomain.com`

## Bước 4: Test

1. **Frontend**: https://yourdomain.com
2. **Backend**: https://your-backend.railway.app/api/products
3. **Check console** cho API calls

## Troubleshooting

### Lỗi CORS:
- Cập nhật CORS trong server/server.js
- Thêm domain của bạn vào allowed origins

### Lỗi 404 khi refresh:
- Kiểm tra .htaccess đã upload chưa
- Hosting có hỗ trợ mod_rewrite không

### API không hoạt động:
- Check Network tab trong DevTools
- Verify API_BASE_URL trong src/config/api.js
- Test backend URL trực tiếp

## Chi phí:
- **Frontend**: Miễn phí (dùng hosting có sẵn)
- **Backend**: Miễn phí (Railway/Render free tier)
- **Total**: $0/tháng
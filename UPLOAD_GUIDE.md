# HƯỚNG DẪN UPLOAD LÊN HOSTING

## Cách 1: File Manager (Khuyến nghị)

### Bước 1: Tạo file ZIP
1. Vào thư mục `dist/`
2. Chọn tất cả files (Ctrl+A)
3. Click chuột phải → "Send to" → "Compressed folder"
4. Đặt tên: `website.zip`

### Bước 2: Upload qua cPanel/Hosting Panel
1. **Đăng nhập hosting panel** (cPanel/DirectAdmin)
2. **Mở File Manager**
3. **Vào thư mục public_html/**
4. **Upload file website.zip**
5. **Click chuột phải vào website.zip → Extract**
6. **Xóa file website.zip** sau khi extract

## Cách 2: FTP Client

### Sử dụng FileZilla:
1. **Download FileZilla**: https://filezilla-project.org/
2. **Kết nối FTP**:
   - Host: ftp.yourdomain.com
   - Username: FTP username
   - Password: FTP password
   - Port: 21
3. **Upload thư mục dist/**:
   - Local: Chọn thư mục dist/
   - Remote: /public_html/
   - Drag & drop tất cả files

## Cách 3: Hosting Control Panel Upload

### Nếu hosting có Web File Manager:
1. **Login hosting control panel**
2. **Website Files / File Manager**
3. **Navigate to public_html/**
4. **Upload files từ dist/ folder**

## Kiểm tra sau khi upload:

### File structure trong public_html/:
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── .htaccess
└── DEPLOY_INFO.txt
```

### Test website:
1. **Truy cập domain**: https://yourdomain.com
2. **Kiểm tra console** (F12) xem có lỗi API không
3. **Test các trang**: Home, Products, News, etc.

## Troubleshooting:

### Lỗi 404 khi refresh trang:
- Kiểm tra file `.htaccess` đã upload chưa
- Hosting có hỗ trợ mod_rewrite không

### Lỗi CORS:
- Backend chưa deploy hoặc URL sai
- Cần cập nhật API URL

### Trang trắng:
- Check console (F12) xem lỗi gì
- Kiểm tra file index.html đã upload đúng chưa
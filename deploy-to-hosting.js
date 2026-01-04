import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Chuẩn bị deploy lên shared hosting...');

// Build frontend
console.log('📦 Đang build frontend...');

try {
  execSync('npm run build', { stdio: 'inherit' });
  
  // Tạo .htaccess cho React Router
  const htaccess = `
# React Router Support - Quan trọng cho SPA
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# CORS Headers cho API calls
<IfModule mod_headers.c>
  Header always set Access-Control-Allow-Origin "*"
  Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Gzip Compression - Tăng tốc độ tải
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache Control - Tối ưu performance
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options DENY
  Header always set X-XSS-Protection "1; mode=block"
</IfModule>
`;

  fs.writeFileSync('dist/.htaccess', htaccess);
  
  // Tạo file thông tin deploy
  const deployInfo = `
# THÔNG TIN DEPLOY
- Build time: ${new Date().toLocaleString('vi-VN')}
- Frontend: Ready to upload
- Backend: Cần deploy riêng lên Railway/Render

## CẬP NHẬT API URL:
Sau khi deploy backend, cập nhật file: src/config/api.js
Thay 'https://your-backend-app.railway.app' bằng URL thật
`;

  fs.writeFileSync('dist/DEPLOY_INFO.txt', deployInfo);
  
  console.log('✅ Build hoàn thành!');
  console.log('📁 Files sẵn sàng trong thư mục dist/');
  console.log('');
  console.log('🎯 BƯỚC TIẾP THEO:');
  console.log('1. 📤 Upload thư mục dist/ lên hosting');
  console.log('2. 🚀 Deploy backend lên Railway/Render');
  console.log('3. 🔧 Cập nhật API URL trong src/config/api.js');
  console.log('4. 🔄 Build lại và upload lần nữa');
  
} catch (error) {
  console.error('❌ Build thất bại:', error.message);
  process.exit(1);
}
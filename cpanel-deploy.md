# Deploy lên cPanel Hosting

## Nếu cPanel hỗ trợ Node.js:

1. **Tạo Node.js App trong cPanel**
2. **Upload source code**
3. **Cài dependencies**: `npm install`
4. **Set startup file**: `server/server.js`
5. **Environment Variables**: Thêm `GEMINI_API_KEY`

## Nếu chỉ hỗ trợ static files:

1. **Build frontend**: `npm run build`
2. **Upload thư mục `dist/` vào `public_html/`**
3. **Deploy backend riêng** trên Railway/Render
4. **Update API URLs** trong frontend

## File Manager Upload:
- Zip toàn bộ project
- Upload qua File Manager
- Extract trong thư mục web root
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1i1qcXLpArZDwC2e4hJIfcY301S39eR9K

## Run Locally

**Prerequisites:** Node.js 18+ 

### Quick Start

1. **Cài đặt tất cả dependencies (Frontend + Backend):**
   ```bash
   npm run install:all
   ```
   
   Hoặc cài đặt riêng:
   ```bash
   npm install              # Frontend dependencies
   cd server && npm install # Backend dependencies
   ```

2. **Cấu hình API Key (tùy chọn):**
   - Tạo file `.env.local` ở thư mục gốc
   - Thêm: `GEMINI_API_KEY=your_api_key_here`
   - Nếu không có, chatbot sẽ không hoạt động

3. **Chạy ứng dụng (tự động start cả Frontend và Backend):**
   ```bash
   npm run dev
   ```
   
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:3001
   
   Logs sẽ hiển thị màu sắc để phân biệt:
   - 🔵 **FRONTEND** (cyan) - Frontend dev server
   - 🟣 **BACKEND** (magenta) - Backend API server

### Chạy riêng lẻ

Nếu muốn chạy riêng Frontend hoặc Backend:

```bash
# Chỉ chạy Frontend
npm run dev:frontend

# Chỉ chạy Backend
npm run dev:backend
```

### Production Build

```bash
npm run build
npm run preview
```

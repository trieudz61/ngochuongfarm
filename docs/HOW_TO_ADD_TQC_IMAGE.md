# Hướng dẫn thêm ảnh chứng chỉ TQC thật

## Bước 1: Lưu ảnh
1. Mở thư mục: `C:\Users\MinhChau\Desktop\NHF\server\uploads\`
2. Copy ảnh chứng chỉ TQC vào đó
3. Đổi tên thành: `tqc-certificate.jpg`

## Bước 2: Thay đổi code trong pages/Home.tsx

Tìm dòng:
```tsx
<div className="relative w-full h-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
```

Thay thế toàn bộ nội dung bên trong bằng:
```tsx
<img 
  src="http://localhost:5001/uploads/tqc-certificate.jpg"
  alt="TQC Certificate" 
  className="w-full h-full object-cover rounded-xl"
/>
```

## Kết quả:
Badge sẽ hiển thị ảnh chứng chỉ TQC thật thay vì design SVG!



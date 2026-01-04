// Script để cập nhật API URL sau khi deploy backend
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 CẬP NHẬT API URL');
console.log('Nhập URL backend từ Railway (ví dụ: https://your-app.railway.app):');

rl.question('Backend URL: ', (backendUrl) => {
  if (!backendUrl.startsWith('https://')) {
    console.log('❌ URL phải bắt đầu bằng https://');
    rl.close();
    return;
  }

  // Cập nhật file config
  const configPath = 'src/config/api.js';
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  configContent = configContent.replace(
    'https://your-backend-app.railway.app',
    backendUrl
  );
  
  fs.writeFileSync(configPath, configContent);
  
  console.log('✅ Đã cập nhật API URL!');
  console.log('🔄 Chạy lệnh sau để build lại:');
  console.log('npm run deploy:hosting');
  
  rl.close();
});
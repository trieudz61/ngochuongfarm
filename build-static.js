// Script để build static version (không cần backend)
const fs = require('fs');
const path = require('path');

console.log('🔧 Building static version...');

// Tạo config cho static build
const staticConfig = `
export const API_BASE_URL = 'https://your-backend-api.com';
export const IS_STATIC_BUILD = true;
`;

fs.writeFileSync('src/config/static.js', staticConfig);

console.log('✅ Static config created!');
console.log('📝 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Upload dist/ folder to your hosting');
console.log('3. Deploy backend separately on Node.js hosting');
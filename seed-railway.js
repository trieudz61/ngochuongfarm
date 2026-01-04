// Script để seed data lên Railway backend
import https from 'https';

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';
const ADMIN_SECRET = 'ngochuongfarm2024';

console.log('🌱 Seeding data to Railway backend...');

const postData = JSON.stringify({});

const options = {
  hostname: 'web-production-335ab.up.railway.app',
  port: 443,
  path: '/api/seed-data?secret=' + ADMIN_SECRET,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-admin-secret': ADMIN_SECRET
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Seed data successful!');
        console.log(`📦 Products: ${response.data.products}`);
        console.log(`📰 News: ${response.data.news}`);
        console.log(`🎫 Coupons: ${response.data.coupons}`);
        console.log('\n🎯 Now test the backend:');
        console.log(`curl ${BACKEND_URL}/api/products`);
      } else {
        console.error('❌ Seed failed:', response.error);
      }
    } catch (error) {
      console.error('❌ Parse error:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(postData);
req.end();
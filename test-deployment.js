// Script test deployment
const https = require('https');
const http = require('http');

async function testDeployment() {
  console.log('🧪 KIỂM TRA DEPLOYMENT');
  
  // Test frontend
  console.log('\n📱 Testing Frontend...');
  const frontendUrl = process.argv[2] || 'https://yourdomain.com';
  
  try {
    const response = await fetch(frontendUrl);
    if (response.ok) {
      console.log('✅ Frontend OK:', frontendUrl);
    } else {
      console.log('❌ Frontend Error:', response.status);
    }
  } catch (error) {
    console.log('❌ Frontend không thể truy cập:', error.message);
  }
  
  // Test backend
  console.log('\n🔧 Testing Backend...');
  const backendUrl = process.argv[3] || 'https://your-app.railway.app';
  
  try {
    const response = await fetch(`${backendUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Backend OK:', backendUrl);
      const data = await response.json();
      console.log('📊 Backend Status:', data);
    } else {
      console.log('❌ Backend Error:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend không thể truy cập:', error.message);
  }
  
  // Test API connection
  console.log('\n🔗 Testing API Connection...');
  try {
    const response = await fetch(`${backendUrl}/api/products`);
    if (response.ok) {
      const products = await response.json();
      console.log('✅ API Connection OK');
      console.log(`📦 Found ${products.length} products`);
    } else {
      console.log('❌ API Connection Error:', response.status);
    }
  } catch (error) {
    console.log('❌ API không thể kết nối:', error.message);
  }
  
  console.log('\n🎯 CHECKLIST:');
  console.log('□ Frontend accessible');
  console.log('□ Backend API working');
  console.log('□ Database connected');
  console.log('□ File uploads working');
  console.log('□ Admin panel accessible');
}

// Chạy test
testDeployment().catch(console.error);

// Usage: node test-deployment.js https://yourdomain.com https://your-app.railway.app
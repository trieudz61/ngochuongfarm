// Test backend deployment
import https from 'https';

const testBackend = async (backendUrl) => {
  console.log('🧪 Testing backend:', backendUrl);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check:', health);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
    
    // Test products endpoint
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await fetch(`${backendUrl}/api/products`);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ Products loaded:', products.length, 'items');
    } else {
      console.log('❌ Products failed:', productsResponse.status);
    }
    
    // Test news endpoint
    console.log('\n3. Testing news endpoint...');
    const newsResponse = await fetch(`${backendUrl}/api/news`);
    if (newsResponse.ok) {
      const news = await newsResponse.json();
      console.log('✅ News loaded:', news.length, 'items');
    } else {
      console.log('❌ News failed:', newsResponse.status);
    }
    
    console.log('\n🎯 Backend URL để cập nhật:', backendUrl);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Usage: node test-backend.js https://your-backend-url.com
const backendUrl = process.argv[2];
if (!backendUrl) {
  console.log('Usage: node test-backend.js https://your-backend-url.com');
  process.exit(1);
}

testBackend(backendUrl);
// Test backend deployment
import https from 'https';
import { URL } from 'url';

const testBackend = async (backendUrl) => {
  console.log('🧪 Testing backend:', backendUrl);
  
  const makeRequest = (url) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            console.log('Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  };
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const health = await makeRequest(`${backendUrl}/api/health`);
    console.log('✅ Health check:', health);
    
    // Test products endpoint
    console.log('\n2. Testing products endpoint...');
    const products = await makeRequest(`${backendUrl}/api/products`);
    console.log('✅ Products response:', products);
    if (products.success && products.data) {
      console.log(`   📦 Found ${products.data.length} products`);
    }
    
    // Test news endpoint
    console.log('\n3. Testing news endpoint...');
    const news = await makeRequest(`${backendUrl}/api/news`);
    console.log('✅ News response:', news);
    if (news.success && news.data) {
      console.log(`   📰 Found ${news.data.length} news articles`);
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
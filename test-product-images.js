// Test script để xem chi tiết hình ảnh sản phẩm
import https from 'https';

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';

const makeRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'web-production-335ab.up.railway.app',
      port: 443,
      path: path,
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
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

async function testProductImages() {
  try {
    console.log('🔍 Testing product images...');
    
    const response = await makeRequest('/api/products');
    const products = response.data || [];
    
    console.log(`📦 Found ${products.length} products\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Images: ${JSON.stringify(product.images, null, 2)}`);
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, imgIndex) => {
          if (img.includes('web-production-335ab.up.railway.app')) {
            console.log(`   ✅ Image ${imgIndex + 1}: Railway URL`);
          } else if (img.includes('localhost')) {
            console.log(`   ❌ Image ${imgIndex + 1}: Still localhost URL`);
          } else {
            console.log(`   ⚠️ Image ${imgIndex + 1}: Other URL - ${img}`);
          }
        });
      } else {
        console.log(`   📷 No images`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductImages();
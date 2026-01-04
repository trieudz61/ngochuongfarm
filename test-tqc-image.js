// Test script để kiểm tra hình ảnh TQC certificate
import https from 'https';

const TQC_IMAGE_URL = 'http://web-production-335ab.up.railway.app/uploads/f2def99d-494f-46ce-abfc-140e2c1146e9.jpg';

console.log('🔍 Testing TQC Certificate image...');
console.log(`📷 URL: ${TQC_IMAGE_URL}`);

const testImageUrl = (url) => {
  return new Promise((resolve, reject) => {
    // Convert http to https for the test
    const httpsUrl = url.replace('http://', 'https://');
    
    const options = {
      hostname: 'web-production-335ab.up.railway.app',
      port: 443,
      path: '/uploads/f2def99d-494f-46ce-abfc-140e2c1146e9.jpg',
      method: 'HEAD', // Only get headers, not the full image
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      if (res.statusCode === 200) {
        console.log('✅ TQC Certificate image is accessible!');
        console.log(`📏 Content-Length: ${res.headers['content-length']} bytes`);
        console.log(`🎨 Content-Type: ${res.headers['content-type']}`);
        resolve(true);
      } else {
        console.log(`❌ Image not accessible. Status: ${res.statusCode}`);
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
};

testImageUrl(TQC_IMAGE_URL).catch(console.error);
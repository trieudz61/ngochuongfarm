// Script để migrate URL ảnh từ localhost sang Railway và import lên server
import fs from 'fs';
import https from 'https';

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';

// Đọc file mapping
const imageMapping = JSON.parse(fs.readFileSync('image-upload-mapping.json', 'utf8'));

// Tạo mapping từ tên file gốc -> URL Railway
const urlMapping = {};
imageMapping.successful.forEach(item => {
  // Map từ localhost URL
  const oldLocalUrl = `http://localhost:3001/uploads/${item.originalName}`;
  // Chuyển http thành https cho Railway URL
  const newUrl = item.uploadedUrl.replace('http://', 'https://');
  urlMapping[oldLocalUrl] = newUrl;
  
  // Map từ relative URL
  const oldRelativeUrl = `/uploads/${item.originalName}`;
  urlMapping[oldRelativeUrl] = newUrl;
  
  console.log(`📍 ${item.originalName} -> ${newUrl}`);
});

console.log('\n📊 Total mappings:', Object.keys(urlMapping).length);

// Đọc exported data
const exportedData = JSON.parse(fs.readFileSync('server/exported-data.json', 'utf8'));

// Hàm thay thế URL trong string
function replaceUrls(str) {
  if (typeof str !== 'string') return str;
  
  let result = str;
  for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
    result = result.split(oldUrl).join(newUrl);
  }
  return result;
}

// Hàm thay thế URL trong object/array
function replaceUrlsInObject(obj) {
  if (typeof obj === 'string') {
    return replaceUrls(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => replaceUrlsInObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = replaceUrlsInObject(value);
    }
    return newObj;
  }
  return obj;
}

// Migrate data
console.log('\n🔄 Migrating URLs in exported data...');
const migratedData = replaceUrlsInObject(exportedData);

// Lưu file đã migrate
fs.writeFileSync('server/exported-data-migrated.json', JSON.stringify(migratedData, null, 2));
console.log('✅ Saved migrated data to server/exported-data-migrated.json');

// Hàm gọi API
function apiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'web-production-335ab.up.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Import data lên Railway
async function importData() {
  console.log('\n🚀 Importing data to Railway...\n');

  // Import Products
  console.log('📦 Importing Products...');
  for (const product of migratedData.products) {
    try {
      // Chỉ import 3 sản phẩm chính (có ảnh thật)
      if (product.id.startsWith('P')) {
        await apiCall('POST', '/api/products', product);
        console.log(`  ✅ ${product.name}`);
      }
    } catch (error) {
      console.log(`  ❌ ${product.name}: ${error.message}`);
    }
  }

  // Import News
  console.log('\n📰 Importing News...');
  for (const article of migratedData.news) {
    try {
      // Chỉ import bài có ảnh thật (không phải sample)
      if (!article.image.includes('sample-')) {
        await apiCall('POST', '/api/news', article);
        console.log(`  ✅ ${article.title.substring(0, 40)}...`);
      }
    } catch (error) {
      console.log(`  ❌ ${article.title.substring(0, 40)}...: ${error.message}`);
    }
  }

  // Import Coupons
  console.log('\n🎫 Importing Coupons...');
  for (const coupon of migratedData.coupons) {
    try {
      await apiCall('POST', '/api/coupons', coupon);
      console.log(`  ✅ ${coupon.code}`);
    } catch (error) {
      console.log(`  ❌ ${coupon.code}: ${error.message}`);
    }
  }

  console.log('\n✅ Import completed!');
}

importData().catch(console.error);

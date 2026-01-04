// Script để update URL ảnh trên Railway database
import fs from 'fs';
import https from 'https';

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';

// Đọc file mapping mới
const imageMapping = JSON.parse(fs.readFileSync('image-upload-mapping.json', 'utf8'));

// Tạo mapping từ tên file gốc -> URL Railway mới
const urlMapping = {};
imageMapping.successful.forEach(item => {
  const filename = item.originalName;
  const newUrl = item.uploadedUrl.replace('http://', 'https://');
  urlMapping[filename] = newUrl;
});

console.log('📊 URL Mappings loaded:', Object.keys(urlMapping).length);

// Hàm gọi API
function apiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'web-production-335ab.up.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Hàm thay thế URL trong string
function replaceUrls(str) {
  if (!str) return str;
  let result = str;
  
  // Thay thế URL cũ (bất kỳ UUID nào trên railway) bằng URL mới dựa trên tên file gốc
  for (const [originalName, newUrl] of Object.entries(urlMapping)) {
    // Match localhost URL
    const localhostPattern = `http://localhost:3001/uploads/${originalName}`;
    result = result.split(localhostPattern).join(newUrl);
    
    // Match any railway URL với tên file gốc
    const railwayPattern = new RegExp(`https://web-production-335ab\\.up\\.railway\\.app/uploads/[a-f0-9-]+\\.(jpg|png|jpeg|gif)`, 'gi');
  }
  
  return result;
}

async function main() {
  try {
    // Lấy products hiện tại
    console.log('\n📦 Fetching products...');
    const products = await apiCall('GET', '/api/products');
    
    for (const product of products.data || []) {
      let needsUpdate = false;
      let newImages = [];
      
      if (product.images && Array.isArray(product.images)) {
        // Parse images nếu là string
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        
        newImages = images.map(img => {
          // Tìm tên file gốc từ URL
          for (const [originalName, newUrl] of Object.entries(urlMapping)) {
            if (img.includes(originalName) || img.includes('localhost')) {
              // Tìm mapping cho file này
              const match = img.match(/\/([^\/]+)$/);
              if (match) {
                const filename = match[1];
                // Tìm trong mapping
                for (const [origName, newU] of Object.entries(urlMapping)) {
                  if (origName === filename) {
                    needsUpdate = true;
                    return newU;
                  }
                }
              }
            }
          }
          return img;
        });
      }
      
      if (needsUpdate) {
        console.log(`  🔄 Updating ${product.name}...`);
        await apiCall('PUT', `/api/products/${product.id}`, {
          ...product,
          images: newImages
        });
        console.log(`  ✅ Updated!`);
      }
    }
    
    // Lấy news hiện tại
    console.log('\n📰 Fetching news...');
    const news = await apiCall('GET', '/api/news');
    
    for (const article of news.data || []) {
      let needsUpdate = false;
      let newImage = article.image;
      
      if (article.image) {
        for (const [originalName, newUrl] of Object.entries(urlMapping)) {
          if (article.image.includes(originalName)) {
            newImage = newUrl;
            needsUpdate = true;
            break;
          }
        }
      }
      
      if (needsUpdate) {
        console.log(`  🔄 Updating news: ${article.title?.substring(0, 30)}...`);
        await apiCall('PUT', `/api/news/${article.id}`, {
          ...article,
          image: newImage
        });
        console.log(`  ✅ Updated!`);
      }
    }
    
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();

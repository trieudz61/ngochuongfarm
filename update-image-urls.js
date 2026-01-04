// Script để cập nhật URL hình ảnh trong database Railway
import https from 'https';
import fs from 'fs';

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';
const ADMIN_SECRET = 'ngochuongfarm2024';

// Load image mapping
const imageMapping = JSON.parse(fs.readFileSync('./image-upload-mapping.json', 'utf8'));

console.log('🔄 Updating image URLs in Railway database...');

// Create mapping from old local URLs to new Railway URLs
const urlMapping = {};
imageMapping.successful.forEach(item => {
  // Map both possible old URL formats
  const oldLocalUrl = `http://localhost:3001/uploads/${item.originalName}`;
  const oldRelativeUrl = `/uploads/${item.originalName}`;
  urlMapping[oldLocalUrl] = item.uploadedUrl;
  urlMapping[oldRelativeUrl] = item.uploadedUrl;
});

console.log(`📊 Created mapping for ${Object.keys(urlMapping).length / 2} images`);

// Helper function to make API calls
const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'web-production-335ab.up.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.error || responseData}`));
          }
        } catch (error) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: responseData });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

// Function to update image URLs in a string/array
const updateImageUrls = (data) => {
  if (typeof data === 'string') {
    let updated = data;
    Object.keys(urlMapping).forEach(oldUrl => {
      updated = updated.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), urlMapping[oldUrl]);
    });
    return updated;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => updateImageUrls(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const updated = {};
    Object.keys(data).forEach(key => {
      updated[key] = updateImageUrls(data[key]);
    });
    return updated;
  }
  
  return data;
};

async function updateDatabase() {
  try {
    let updatedCount = 0;
    let errorCount = 0;

    // 1. Update Products
    console.log('\n📦 Updating product images...');
    const productsResponse = await makeRequest('/api/products');
    const products = productsResponse.data || [];

    for (const product of products) {
      try {
        const originalImages = JSON.stringify(product.images);
        const updatedProduct = updateImageUrls(product);
        const updatedImages = JSON.stringify(updatedProduct.images);
        
        // Only update if images changed
        if (originalImages !== updatedImages) {
          await makeRequest(`/api/products/${product.id}`, 'PUT', updatedProduct);
          console.log(`✅ Updated product: ${product.name}`);
          updatedCount++;
        } else {
          console.log(`⏭️ No changes needed for: ${product.name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to update product ${product.name}:`, error.message);
        errorCount++;
      }
    }

    // 2. Update News
    console.log('\n📰 Updating news images...');
    const newsResponse = await makeRequest('/api/news');
    const news = newsResponse.data || [];

    for (const article of news) {
      try {
        const originalImage = article.image;
        const updatedArticle = updateImageUrls(article);
        
        // Only update if image changed
        if (originalImage !== updatedArticle.image) {
          await makeRequest(`/api/news/${article.id}`, 'PUT', updatedArticle);
          console.log(`✅ Updated news: ${article.title}`);
          updatedCount++;
        } else {
          console.log(`⏭️ No changes needed for: ${article.title}`);
        }
      } catch (error) {
        console.log(`❌ Failed to update news ${article.title}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Update completed!');
    console.log(`✅ Updated items: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    // Test the updates
    console.log('\n🧪 Testing updated data...');
    const updatedProducts = await makeRequest('/api/products');
    const updatedNews = await makeRequest('/api/news');

    console.log(`📊 Current data on Railway:`);
    console.log(`   Products: ${updatedProducts.data?.length || 0}`);
    console.log(`   News: ${updatedNews.data?.length || 0}`);

    // Check for Railway URLs in products
    let railwayImageCount = 0;
    updatedProducts.data?.forEach(product => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (img.includes('web-production-335ab.up.railway.app')) {
            railwayImageCount++;
          }
        });
      }
    });

    updatedNews.data?.forEach(article => {
      if (article.image && article.image.includes('web-production-335ab.up.railway.app')) {
        railwayImageCount++;
      }
    });

    console.log(`🖼️ Images now using Railway URLs: ${railwayImageCount}`);

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

updateDatabase();
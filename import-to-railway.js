// Script để import dữ liệu lên Railway backend
import https from 'https';
import fs from 'fs';

const BACKEND_URL = 'https://web-production-335ab.up.railway.app';
const ADMIN_SECRET = 'ngochuongfarm2024';

// Load exported data
const exportedData = JSON.parse(fs.readFileSync('./server/exported-data.json', 'utf8'));

console.log('📤 Importing data to Railway backend...');
console.log(`📊 Data to import:`);
console.log(`   Products: ${exportedData.products.length}`);
console.log(`   News: ${exportedData.news.length}`);
console.log(`   Orders: ${exportedData.orders.length}`);
console.log(`   Coupons: ${exportedData.coupons.length}`);
console.log(`   Reviews: ${exportedData.reviews.length}`);

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

async function importData() {
  try {
    let successCount = 0;
    let errorCount = 0;

    // 1. Clear existing data first (optional)
    console.log('\n🧹 Clearing existing data...');
    try {
      await makeRequest('/api/orders/admin/clear-all?secret=' + ADMIN_SECRET, 'DELETE');
      console.log('✅ Cleared existing orders');
    } catch (error) {
      console.log('⚠️ Could not clear orders:', error.message);
    }

    // 2. Import Products
    console.log('\n📦 Importing products...');
    for (const product of exportedData.products) {
      try {
        await makeRequest('/api/products', 'POST', product);
        console.log(`✅ Imported product: ${product.name}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to import product ${product.name}:`, error.message);
        errorCount++;
      }
    }

    // 3. Import News
    console.log('\n📰 Importing news...');
    for (const article of exportedData.news) {
      try {
        await makeRequest('/api/news', 'POST', article);
        console.log(`✅ Imported news: ${article.title}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to import news ${article.title}:`, error.message);
        errorCount++;
      }
    }

    // 4. Import Coupons
    console.log('\n🎫 Importing coupons...');
    for (const coupon of exportedData.coupons) {
      try {
        await makeRequest('/api/coupons', 'POST', coupon);
        console.log(`✅ Imported coupon: ${coupon.code}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to import coupon ${coupon.code}:`, error.message);
        errorCount++;
      }
    }

    // 5. Import Orders
    console.log('\n🛒 Importing orders...');
    for (const order of exportedData.orders) {
      try {
        await makeRequest('/api/orders', 'POST', order);
        console.log(`✅ Imported order: ${order.id}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to import order ${order.id}:`, error.message);
        errorCount++;
      }
    }

    // 6. Import Reviews
    console.log('\n⭐ Importing reviews...');
    for (const review of exportedData.reviews) {
      try {
        await makeRequest(`/api/products/${review.productId}/reviews`, 'POST', review);
        console.log(`✅ Imported review for product: ${review.productId}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to import review:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Import completed!');
    console.log(`✅ Success: ${successCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);

    // Test the import
    console.log('\n🧪 Testing imported data...');
    const products = await makeRequest('/api/products');
    const news = await makeRequest('/api/news');
    const orders = await makeRequest('/api/orders');
    const coupons = await makeRequest('/api/coupons');

    console.log(`📊 Current data on Railway:`);
    console.log(`   Products: ${products.data?.length || 0}`);
    console.log(`   News: ${news.data?.length || 0}`);
    console.log(`   Orders: ${orders.data?.length || 0}`);
    console.log(`   Coupons: ${coupons.data?.length || 0}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

importData();
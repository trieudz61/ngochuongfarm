// Script để export dữ liệu từ database local
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('ngochuongfarm.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to local SQLite database');
    exportData();
  }
});

async function exportData() {
  console.log('📤 Exporting data from local database...');
  
  const exportedData = {
    products: [],
    news: [],
    orders: [],
    coupons: [],
    reviews: []
  };

  // Export products
  await new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', (err, rows) => {
      if (err) {
        console.error('Error fetching products:', err);
        reject(err);
      } else {
        exportedData.products = rows.map(row => ({
          ...row,
          images: row.images ? JSON.parse(row.images) : [],
          certifications: row.certifications ? JSON.parse(row.certifications) : [],
          isFeatured: Boolean(row.isFeatured)
        }));
        console.log(`📦 Exported ${exportedData.products.length} products`);
        resolve();
      }
    });
  });

  // Export news
  await new Promise((resolve, reject) => {
    db.all('SELECT * FROM news', (err, rows) => {
      if (err) {
        console.error('Error fetching news:', err);
        reject(err);
      } else {
        exportedData.news = rows;
        console.log(`📰 Exported ${exportedData.news.length} news articles`);
        resolve();
      }
    });
  });

  // Export orders
  await new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', (err, rows) => {
      if (err) {
        console.error('Error fetching orders:', err);
        reject(err);
      } else {
        exportedData.orders = rows.map(row => ({
          ...row,
          items: row.items ? JSON.parse(row.items) : [],
          customerInfo: row.customerInfo ? JSON.parse(row.customerInfo) : {}
        }));
        console.log(`🛒 Exported ${exportedData.orders.length} orders`);
        resolve();
      }
    });
  });

  // Export coupons
  await new Promise((resolve, reject) => {
    db.all('SELECT * FROM coupons', (err, rows) => {
      if (err) {
        console.error('Error fetching coupons:', err);
        reject(err);
      } else {
        exportedData.coupons = rows.map(row => ({
          ...row,
          isActive: Boolean(row.isActive)
        }));
        console.log(`🎫 Exported ${exportedData.coupons.length} coupons`);
        resolve();
      }
    });
  });

  // Export reviews
  await new Promise((resolve, reject) => {
    db.all('SELECT * FROM reviews', (err, rows) => {
      if (err) {
        console.error('Error fetching reviews:', err);
        reject(err);
      } else {
        exportedData.reviews = rows.map(row => ({
          ...row,
          isVerified: Boolean(row.isVerified)
        }));
        console.log(`⭐ Exported ${exportedData.reviews.length} reviews`);
        resolve();
      }
    });
  });

  // Save to JSON file
  const exportFile = 'exported-data.json';
  fs.writeFileSync(exportFile, JSON.stringify(exportedData, null, 2));
  console.log(`✅ Data exported to ${exportFile}`);
  
  // Show summary
  console.log('\n📊 Export Summary:');
  console.log(`   Products: ${exportedData.products.length}`);
  console.log(`   News: ${exportedData.news.length}`);
  console.log(`   Orders: ${exportedData.orders.length}`);
  console.log(`   Coupons: ${exportedData.coupons.length}`);
  console.log(`   Reviews: ${exportedData.reviews.length}`);
  
  db.close();
}
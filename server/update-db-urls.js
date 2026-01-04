// CommonJS script để cập nhật URL ảnh trong database local từ localhost sang Railway
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'ngochuongfarm.db');
const MAPPING_PATH = path.join(__dirname, '..', 'image-upload-mapping.json');

// Đọc file mapping
const imageMapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));

// Tạo mapping từ tên file gốc -> URL Railway (https)
const urlMapping = {};
imageMapping.successful.forEach(item => {
  const oldLocalUrl = `http://localhost:3001/uploads/${item.originalName}`;
  const newUrl = item.uploadedUrl.replace('http://', 'https://');
  urlMapping[oldLocalUrl] = newUrl;
});

console.log('📊 URL Mappings loaded:', Object.keys(urlMapping).length);

// Kết nối database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database:', DB_PATH);
});

// Hàm thay thế URL trong string
function replaceUrls(str) {
  if (!str) return str;
  let result = str;
  for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
    result = result.split(oldUrl).join(newUrl);
  }
  return result;
}

// Cập nhật Products
function updateProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, images FROM products', (err, rows) => {
      if (err) return reject(err);
      
      console.log(`\n📦 Found ${rows.length} products`);
      
      let updated = 0;
      let pending = 0;
      
      rows.forEach(row => {
        const oldImages = row.images;
        const newImages = replaceUrls(oldImages);
        
        if (oldImages !== newImages) {
          pending++;
          db.run('UPDATE products SET images = ? WHERE id = ?', [newImages, row.id], (err) => {
            pending--;
            if (err) console.error(`  ❌ Error updating product ${row.id}:`, err);
            else {
              updated++;
              console.log(`  ✅ Updated product: ${row.id}`);
            }
            if (pending === 0) {
              console.log(`  📊 Products updated: ${updated}`);
              resolve(updated);
            }
          });
        }
      });
      
      if (pending === 0) {
        console.log(`  📊 No products need updating`);
        resolve(0);
      }
    });
  });
}

// Cập nhật News
function updateNews() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, image, content FROM news', (err, rows) => {
      if (err) return reject(err);
      
      console.log(`\n📰 Found ${rows.length} news articles`);
      
      let updated = 0;
      let pending = 0;
      
      rows.forEach(row => {
        const oldImage = row.image;
        const oldContent = row.content;
        const newImage = replaceUrls(oldImage);
        const newContent = replaceUrls(oldContent);
        
        if (oldImage !== newImage || oldContent !== newContent) {
          pending++;
          db.run('UPDATE news SET image = ?, content = ? WHERE id = ?', [newImage, newContent, row.id], (err) => {
            pending--;
            if (err) console.error(`  ❌ Error updating news ${row.id}:`, err);
            else {
              updated++;
              console.log(`  ✅ Updated news: ${row.id}`);
            }
            if (pending === 0) {
              console.log(`  📊 News updated: ${updated}`);
              resolve(updated);
            }
          });
        }
      });
      
      if (pending === 0) {
        console.log(`  📊 No news need updating`);
        resolve(0);
      }
    });
  });
}

// Cập nhật Orders
function updateOrders() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, items FROM orders', (err, rows) => {
      if (err) return reject(err);
      
      console.log(`\n🛒 Found ${rows.length} orders`);
      
      let updated = 0;
      let pending = 0;
      
      rows.forEach(row => {
        const oldItems = row.items;
        const newItems = replaceUrls(oldItems);
        
        if (oldItems !== newItems) {
          pending++;
          db.run('UPDATE orders SET items = ? WHERE id = ?', [newItems, row.id], (err) => {
            pending--;
            if (err) console.error(`  ❌ Error updating order ${row.id}:`, err);
            else {
              updated++;
              console.log(`  ✅ Updated order: ${row.id}`);
            }
            if (pending === 0) {
              console.log(`  📊 Orders updated: ${updated}`);
              resolve(updated);
            }
          });
        }
      });
      
      if (pending === 0) {
        console.log(`  📊 No orders need updating`);
        resolve(0);
      }
    });
  });
}

// Chạy tất cả updates
async function main() {
  try {
    const p = await updateProducts();
    const n = await updateNews();
    const o = await updateOrders();
    
    console.log(`\n✅ Database update complete!`);
    console.log(`   Products: ${p}, News: ${n}, Orders: ${o}`);
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();

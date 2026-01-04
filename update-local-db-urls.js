// Script để cập nhật URL ảnh trong database local từ localhost sang Railway
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'server', 'ngochuongfarm.db');

// Đọc file mapping
const imageMapping = JSON.parse(fs.readFileSync('image-upload-mapping.json', 'utf8'));

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
      
      console.log(`\n📦 Updating ${rows.length} products...`);
      
      let updated = 0;
      rows.forEach(row => {
        const oldImages = row.images;
        const newImages = replaceUrls(oldImages);
        
        if (oldImages !== newImages) {
          db.run('UPDATE products SET images = ? WHERE id = ?', [newImages, row.id], (err) => {
            if (err) console.error(`  ❌ Error updating product ${row.id}:`, err);
            else {
              updated++;
              console.log(`  ✅ Updated product: ${row.id}`);
            }
          });
        }
      });
      
      setTimeout(() => {
        console.log(`  📊 Products updated: ${updated}`);
        resolve();
      }, 1000);
    });
  });
}

// Cập nhật News
function updateNews() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, image, content FROM news', (err, rows) => {
      if (err) return reject(err);
      
      console.log(`\n📰 Updating ${rows.length} news articles...`);
      
      let updated = 0;
      rows.forEach(row => {
        const oldImage = row.image;
        const oldContent = row.content;
        const newImage = replaceUrls(oldImage);
        const newContent = replaceUrls(oldContent);
        
        if (oldImage !== newImage || oldContent !== newContent) {
          db.run('UPDATE news SET image = ?, content = ? WHERE id = ?', [newImage, newContent, row.id], (err) => {
            if (err) console.error(`  ❌ Error updating news ${row.id}:`, err);
            else {
              updated++;
              console.log(`  ✅ Updated news: ${row.id}`);
            }
          });
        }
      });
      
      setTimeout(() => {
        console.log(`  📊 News updated: ${updated}`);
        resolve();
      }, 1000);
    });
  });
}

// Cập nhật Orders (items chứa images)
function updateOrders() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, items FROM orders', (err, rows) => {
      if (err) return reject(err);
      
      console.log(`\n🛒 Updating ${rows.length} orders...`);
      
      let updated = 0;
      rows.forEach(row => {
        const oldItems = row.items;
        const newItems = replaceUrls(oldItems);
        
        if (oldItems !== newItems) {
          db.run('UPDATE orders SET items = ? WHERE id = ?', [newItems, row.id], (err) => {
            if (err) console.error(`  ❌ Error updating order ${row.id}:`, err);
            else {
              updated++;
              console.log(`  ✅ Updated order: ${row.id}`);
            }
          });
        }
      });
      
      setTimeout(() => {
        console.log(`  📊 Orders updated: ${updated}`);
        resolve();
      }, 1000);
    });
  });
}

// Chạy tất cả updates
async function main() {
  try {
    await updateProducts();
    await updateNews();
    await updateOrders();
    
    console.log('\n✅ All database URLs updated successfully!');
    console.log('🔄 Restart your backend server to see changes.');
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();

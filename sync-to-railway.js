// Script để sync data từ local lên Railway (xóa cũ, import mới)
import fs from 'fs';
import https from 'https';

// Đọc mapping
const imageMapping = JSON.parse(fs.readFileSync('image-upload-mapping.json', 'utf8'));

// Tạo URL mapping
const urlMapping = {};
imageMapping.successful.forEach(item => {
  const oldUrl = `http://localhost:3001/uploads/${item.originalName}`;
  const newUrl = item.uploadedUrl.replace('http://', 'https://');
  urlMapping[oldUrl] = newUrl;
});

// Đọc exported data
const exportedData = JSON.parse(fs.readFileSync('server/exported-data.json', 'utf8'));

// Hàm thay URL
function replaceUrls(obj) {
  if (typeof obj === 'string') {
    let result = obj;
    for (const [old, newU] of Object.entries(urlMapping)) {
      result = result.split(old).join(newU);
    }
    return result;
  }
  if (Array.isArray(obj)) return obj.map(replaceUrls);
  if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const [k, v] of Object.entries(obj)) newObj[k] = replaceUrls(v);
    return newObj;
  }
  return obj;
}

const migratedData = replaceUrls(exportedData);

// API call helper
function api(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'web-production-335ab.up.railway.app',
      port: 443, path, method,
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🗑️  Deleting old data on Railway...');
  
  // Xóa products cũ
  const products = await api('GET', '/api/products');
  for (const p of products.data || []) {
    await api('DELETE', `/api/products/${p.id}`);
    console.log(`  Deleted product: ${p.id}`);
  }
  
  // Xóa news cũ
  const news = await api('GET', '/api/news');
  for (const n of news.data || []) {
    await api('DELETE', `/api/news/${n.id}`);
    console.log(`  Deleted news: ${n.id}`);
  }
  
  console.log('\n📦 Importing new data...');
  
  // Import products
  for (const p of migratedData.products || []) {
    const res = await api('POST', '/api/products', p);
    console.log(`  Product: ${p.name} - ${res.success ? '✅' : '❌'}`);
  }
  
  // Import news
  for (const n of migratedData.news || []) {
    const res = await api('POST', '/api/news', n);
    console.log(`  News: ${n.title?.substring(0,30)}... - ${res.success ? '✅' : '❌'}`);
  }
  
  console.log('\n✅ Sync completed!');
}

main();

// Script export dữ liệu từ SQLite sang Supabase SQL
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'ngochuongfarm.db');
const outputPath = path.join(__dirname, '..', 'supabase-data-export.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Không thể mở database:', err.message);
    process.exit(1);
  }
  console.log('✅ Đã kết nối SQLite database');
});

// Helper: Escape string cho SQL
const escapeSQL = (str) => {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  return `'${String(str).replace(/'/g, "''")}'`;
};

// Helper: Parse JSON field
const parseJSON = (str) => {
  if (!str) return '[]';
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed);
  } catch {
    return str;
  }
};

let sqlOutput = `-- =====================================================
-- SUPABASE SETUP SQL - Ngọc Hường Farm
-- Exported from SQLite database
-- Generated: ${new Date().toISOString()}
-- =====================================================

-- 1. XÓA BẢNG CŨ (NẾU CẦN RESET)
-- =====================================================
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TẠO CÁC BẢNG
-- =====================================================

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  origin TEXT,
  "harvestDate" TEXT,
  certifications JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  description TEXT,
  "cultivationProcess" TEXT,
  "isFeatured" BOOLEAN DEFAULT false,
  "averageRating" DECIMAL(3,2) DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- News table
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image TEXT,
  category TEXT,
  author TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  "customerInfo" JSONB NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  "discountTotal" DECIMAL(12,2) DEFAULT 0,
  "finalTotal" DECIMAL(12,2) NOT NULL,
  "couponCode" TEXT,
  "paymentMethod" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  "cookieId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  "discountType" TEXT NOT NULL,
  "discountValue" DECIMAL(12,2) NOT NULL,
  "minOrderValue" DECIMAL(12,2) DEFAULT 0,
  "expiryDate" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "userName" TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  "isVerified" BOOLEAN DEFAULT false
);

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'user',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẠO INDEXES
-- =====================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products("isFeatured");
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_cookieId ON orders("cookieId");
CREATE INDEX idx_orders_createdAt ON orders("createdAt" DESC);
CREATE INDEX idx_reviews_productId ON reviews("productId");
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_news_category ON news(category);

-- 4. BẬT ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. TẠO POLICIES
-- =====================================================
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Service full access products" ON products FOR ALL USING (true);

CREATE POLICY "Public read news" ON news FOR SELECT USING (true);
CREATE POLICY "Service full access news" ON news FOR ALL USING (true);

CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Service full access coupons" ON coupons FOR ALL USING (true);

CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Service full access reviews" ON reviews FOR ALL USING (true);

CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Service full access orders" ON orders FOR ALL USING (true);

CREATE POLICY "Service full access admins" ON admins FOR ALL USING (true);
CREATE POLICY "Service full access users" ON users FOR ALL USING (true);

-- 6. TẠO TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET "averageRating" = (
    SELECT COALESCE(AVG(rating), 0) 
    FROM reviews 
    WHERE "productId" = COALESCE(NEW."productId", OLD."productId")
  )
  WHERE id = COALESCE(NEW."productId", OLD."productId");
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- 7. IMPORT DỮ LIỆU TỪ SQLITE
-- =====================================================

`;

// Export từng table
const exportTable = (tableName, columns, jsonColumns = [], boolColumns = []) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.log(`⚠️ Không có bảng ${tableName} hoặc lỗi:`, err.message);
        resolve('');
        return;
      }
      
      if (!rows || rows.length === 0) {
        console.log(`📭 Bảng ${tableName}: không có dữ liệu`);
        resolve(`-- ${tableName}: Không có dữ liệu\n\n`);
        return;
      }

      console.log(`📦 Bảng ${tableName}: ${rows.length} records`);
      
      let sql = `-- ${tableName}: ${rows.length} records\n`;
      
      rows.forEach((row, index) => {
        const values = columns.map(col => {
          let val = row[col];
          
          // Handle JSON columns
          if (jsonColumns.includes(col)) {
            const jsonVal = parseJSON(val);
            return `'${jsonVal.replace(/'/g, "''")}'::jsonb`;
          }
          
          // Handle boolean columns
          if (boolColumns.includes(col)) {
            return val === 1 || val === '1' || val === true ? 'true' : 'false';
          }
          
          return escapeSQL(val);
        });
        
        const colNames = columns.map(c => {
          // Quote column names that need it
          if (['harvestDate', 'cultivationProcess', 'isFeatured', 'averageRating', 
               'createdAt', 'updatedAt', 'customerInfo', 'discountTotal', 'finalTotal',
               'couponCode', 'paymentMethod', 'cookieId', 'discountType', 'discountValue',
               'minOrderValue', 'expiryDate', 'isActive', 'productId', 'userName', 'isVerified'].includes(c)) {
            return `"${c}"`;
          }
          return c;
        });
        
        sql += `INSERT INTO ${tableName} (${colNames.join(', ')}) VALUES (${values.join(', ')});\n`;
      });
      
      sql += '\n';
      resolve(sql);
    });
  });
};

async function exportAll() {
  try {
    // Export admins
    sqlOutput += await exportTable('admins', 
      ['id', 'username', 'password', 'name', 'createdAt'],
      [], []);

    // Export products
    sqlOutput += await exportTable('products',
      ['id', 'name', 'price', 'unit', 'category', 'origin', 'harvestDate', 
       'certifications', 'images', 'stock', 'description', 'cultivationProcess',
       'isFeatured', 'averageRating', 'createdAt', 'updatedAt'],
      ['certifications', 'images'],
      ['isFeatured']);

    // Export news
    sqlOutput += await exportTable('news',
      ['id', 'title', 'summary', 'content', 'image', 'category', 'author', 'createdAt', 'updatedAt'],
      [], []);

    // Export orders
    sqlOutput += await exportTable('orders',
      ['id', 'customerInfo', 'items', 'total', 'discountTotal', 'finalTotal',
       'couponCode', 'paymentMethod', 'status', 'cookieId', 'createdAt', 'updatedAt'],
      ['customerInfo', 'items'], []);

    // Export coupons
    sqlOutput += await exportTable('coupons',
      ['id', 'code', 'discountType', 'discountValue', 'minOrderValue', 
       'expiryDate', 'isActive', 'createdAt', 'updatedAt'],
      [], ['isActive']);

    // Export reviews
    sqlOutput += await exportTable('reviews',
      ['id', 'productId', 'userName', 'rating', 'comment', 'date', 'isVerified'],
      [], ['isVerified']);

    // Add footer
    sqlOutput += `
-- =====================================================
-- HOÀN TẤT IMPORT!
-- =====================================================
`;

    // Write to file
    fs.writeFileSync(outputPath, sqlOutput, { encoding: 'utf8', flag: 'w' });
    console.log(`\n✅ Đã xuất ra file: ${outputPath}`);
    console.log('📋 Copy nội dung file này vào SQL Editor của Supabase để import');
    
    db.close();
  } catch (error) {
    console.error('❌ Lỗi:', error);
    db.close();
    process.exit(1);
  }
}

exportAll();

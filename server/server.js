// Backend API Server cho Ngọc Hường Farm
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files từ dist folder (production build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Middleware
app.use(cors({
  origin: '*', // Cho phép tất cả origins (có thể restrict sau)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Đảm bảo thư mục uploads tồn tại
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Cấu hình Multer cho upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cho video
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Upload chỉ ảnh (10MB)
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Error handler cho multer
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(formatResponse(false, null, 'File quá lớn. Tối đa 10MB'));
    }
    return res.status(400).json(formatResponse(false, null, err.message));
  }
  if (err) {
    return res.status(400).json(formatResponse(false, null, err.message || 'Upload error'));
  }
  next();
};

// Khởi tạo Database
const db = new sqlite3.Database('ngochuongfarm.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Tạo tables
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      origin TEXT,
      harvestDate TEXT,
      certifications TEXT,
      images TEXT,
      stock INTEGER DEFAULT 0,
      description TEXT,
      cultivationProcess TEXT,
      isFeatured INTEGER DEFAULT 0,
      averageRating REAL DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // News table
    db.run(`CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      image TEXT,
      category TEXT,
      author TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerInfo TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      discountTotal REAL DEFAULT 0,
      finalTotal REAL NOT NULL,
      couponCode TEXT,
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      cookieId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Coupons table
    db.run(`CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discountType TEXT NOT NULL,
      discountValue REAL NOT NULL,
      minOrderValue REAL DEFAULT 0,
      expiryDate TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      userName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      isVerified INTEGER DEFAULT 0,
      FOREIGN KEY (productId) REFERENCES products(id)
    )`);

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      role TEXT DEFAULT 'user',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      // Migration: Thêm column cookieId vào bảng orders nếu chưa có
      // Chạy sau khi tất cả tables đã được tạo
      db.all("PRAGMA table_info(orders)", (err, columns) => {
        if (err) {
          console.error('Error checking orders table structure:', err);
          return;
        }
        
        const hasCookieId = columns && columns.some(col => col.name === 'cookieId');
        if (!hasCookieId) {
          console.log('[Migration] Adding cookieId column to orders table...');
          db.run(`ALTER TABLE orders ADD COLUMN cookieId TEXT`, (alterErr) => {
            if (alterErr) {
              // Kiểm tra lỗi cụ thể
              if (alterErr.message && alterErr.message.includes('duplicate column')) {
                console.log('[Migration] cookieId column already exists (duplicate column error)');
              } else {
                console.error('[Migration] Error adding cookieId column:', alterErr);
              }
            } else {
              console.log('[Migration] ✅ Successfully added cookieId column to orders table');
            }
          });
        } else {
          console.log('[Migration] ✅ cookieId column already exists in orders table');
        }
      });
    });
  });
}

// Helper: Format response
const formatResponse = (success, data, error = null) => ({
  success,
  data,
  error
});

// ============= PRODUCTS ROUTES =============
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      const products = rows.map(row => {
        try {
          return {
            ...row,
            images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [],
            certifications: row.certifications ? (typeof row.certifications === 'string' ? JSON.parse(row.certifications) : row.certifications) : [],
            isFeatured: Boolean(row.isFeatured === 1 || row.isFeatured === '1' || row.isFeatured === true),
            price: Number(row.price) || 0,
            stock: Number(row.stock) || 0,
            averageRating: Number(row.averageRating) || 0
          };
        } catch (parseError) {
          console.error('Error parsing product:', row.id, parseError);
          return {
            ...row,
            images: [],
            certifications: [],
            isFeatured: false,
            price: Number(row.price) || 0,
            stock: Number(row.stock) || 0,
            averageRating: Number(row.averageRating) || 0
          };
        }
      });
      console.log(`[API] Returning ${products.length} products`);
      res.json(formatResponse(true, products));
    }
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else if (!row) {
      res.status(404).json(formatResponse(false, null, 'Product not found'));
    } else {
      const product = {
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
        certifications: row.certifications ? JSON.parse(row.certifications) : [],
        isFeatured: Boolean(row.isFeatured)
      };
      res.json(formatResponse(true, product));
    }
  });
});

app.post('/api/products', (req, res) => {
  const product = {
    id: req.body.id || uuidv4(),
    ...req.body,
    images: JSON.stringify(req.body.images || []),
    certifications: JSON.stringify(req.body.certifications || []),
    isFeatured: req.body.isFeatured ? 1 : 0
  };

  db.run(
    `INSERT INTO products (id, name, price, unit, category, origin, harvestDate, certifications, images, stock, description, cultivationProcess, isFeatured, averageRating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [product.id, product.name, product.price, product.unit, product.category, product.origin, 
     product.harvestDate, product.certifications, product.images, product.stock, 
     product.description, product.cultivationProcess, product.isFeatured, product.averageRating || 0],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, { ...product, id: this.lastID || product.id }));
      }
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const product = {
    ...req.body,
    images: JSON.stringify(req.body.images || []),
    certifications: JSON.stringify(req.body.certifications || []),
    isFeatured: req.body.isFeatured ? 1 : 0
  };

  db.run(
    `UPDATE products SET name = ?, price = ?, unit = ?, category = ?, origin = ?, harvestDate = ?,
     certifications = ?, images = ?, stock = ?, description = ?, cultivationProcess = ?, isFeatured = ?,
     averageRating = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [product.name, product.price, product.unit, product.category, product.origin, product.harvestDate,
     product.certifications, product.images, product.stock, product.description, product.cultivationProcess,
     product.isFeatured, product.averageRating || 0, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, { ...product, id: req.params.id }));
      }
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      res.json(formatResponse(true, { deleted: true }));
    }
  });
});

app.post('/api/products/upload-image', uploadImage.single('image'), uploadErrorHandler, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
    console.log(`[Upload] File saved: ${req.file.filename}, URL: ${fullUrl}`);
    res.json(formatResponse(true, { url: fullUrl, imageUrl: fullUrl }));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(formatResponse(false, null, error.message || 'Upload failed'));
  }
});

// ============= NEWS ROUTES =============
app.get('/api/news', (req, res) => {
  db.all('SELECT * FROM news ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      res.json(formatResponse(true, rows));
    }
  });
});

app.get('/api/news/:id', (req, res) => {
  db.get('SELECT * FROM news WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else if (!row) {
      res.status(404).json(formatResponse(false, null, 'News not found'));
    } else {
      res.json(formatResponse(true, row));
    }
  });
});

app.post('/api/news', (req, res) => {
  const article = {
    id: req.body.id || uuidv4(),
    ...req.body
  };

  db.run(
    `INSERT INTO news (id, title, summary, content, image, category, author)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [article.id, article.title, article.summary, article.content, article.image, article.category, article.author],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, article));
      }
    }
  );
});

app.put('/api/news/:id', (req, res) => {
  db.run(
    `UPDATE news SET title = ?, summary = ?, content = ?, image = ?, category = ?, author = ?,
     updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [req.body.title, req.body.summary, req.body.content, req.body.image, req.body.category, req.body.author, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, { ...req.body, id: req.params.id }));
      }
    }
  );
});

app.delete('/api/news/:id', (req, res) => {
  db.run('DELETE FROM news WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      res.json(formatResponse(true, { deleted: true }));
    }
  });
});

app.post('/api/news/upload-image', uploadImage.single('image'), uploadErrorHandler, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
    console.log(`[Upload] File saved: ${req.file.filename}, URL: ${fullUrl}`);
    res.json(formatResponse(true, { url: fullUrl, imageUrl: fullUrl }));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(formatResponse(false, null, error.message || 'Upload failed'));
  }
});

// Upload video endpoint
app.post('/api/news/upload-video', upload.single('video'), uploadErrorHandler, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
    }
    const videoUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${videoUrl}`;
    console.log(`[Upload] Video saved: ${req.file.filename}, URL: ${fullUrl}`);
    res.json(formatResponse(true, { url: fullUrl, videoUrl: fullUrl }));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(formatResponse(false, null, error.message || 'Upload failed'));
  }
});

// ============= ORDERS ROUTES =============
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      const orders = rows.map(row => ({
        ...row,
        items: JSON.parse(row.items),
        customerInfo: JSON.parse(row.customerInfo),
        cookieId: row.cookieId || null
      }));
      res.json(formatResponse(true, orders));
    }
  });
});

// Lấy orders theo cookieId
app.get('/api/orders/cookie/:cookieId', (req, res) => {
  const { cookieId } = req.params;
  console.log(`[API] Fetching orders for cookieId: ${cookieId}`);
  
  db.all('SELECT * FROM orders WHERE cookieId = ? ORDER BY createdAt DESC', [cookieId], (err, rows) => {
    if (err) {
      console.error('[API] Error fetching orders by cookieId:', err);
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      const orders = rows.map(row => ({
        ...row,
        items: JSON.parse(row.items),
        customerInfo: JSON.parse(row.customerInfo),
        cookieId: row.cookieId || null
      }));
      console.log(`[API] Found ${orders.length} orders for cookieId: ${cookieId}`);
      res.json(formatResponse(true, orders));
    }
  });
});

app.get('/api/orders/:id', (req, res) => {
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else if (!row) {
      res.status(404).json(formatResponse(false, null, 'Order not found'));
    } else {
      const order = {
        ...row,
        items: JSON.parse(row.items),
        customerInfo: JSON.parse(row.customerInfo)
      };
      res.json(formatResponse(true, order));
    }
  });
});

app.post('/api/orders', (req, res) => {
  const order = {
    id: req.body.id || `ORD-${uuidv4().substr(0, 8).toUpperCase()}`,
    ...req.body,
    items: JSON.stringify(req.body.items || []),
    customerInfo: JSON.stringify(req.body.customerInfo || {}),
    cookieId: req.body.cookieId || null
  };

  db.run(
    `INSERT INTO orders (id, customerInfo, items, total, discountTotal, finalTotal, couponCode, paymentMethod, status, cookieId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [order.id, order.customerInfo, order.items, order.total, order.discountTotal, 
     order.finalTotal, order.couponCode, order.paymentMethod, order.status, order.cookieId],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, {
          ...req.body,
          id: order.id,
          items: req.body.items,
          customerInfo: req.body.customerInfo,
          cookieId: order.cookieId || req.body.cookieId || null
        }));
      }
    }
  );
});

app.patch('/api/orders/:id/status', (req, res) => {
  db.run(
    'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [req.body.status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, { id: req.params.id, status: req.body.status }));
      }
    }
  );
});

app.delete('/api/orders/:id', (req, res) => {
  db.run('DELETE FROM orders WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else if (this.changes === 0) {
      res.status(404).json(formatResponse(false, null, 'Order not found'));
    } else {
      console.log(`[API] Deleted order: ${req.params.id}`);
      res.json(formatResponse(true, { deleted: true, id: req.params.id }));
    }
  });
});

// Admin endpoint: Clear ALL orders (chỉ dùng để testing/reset)
app.delete('/api/orders/admin/clear-all', (req, res) => {
  // Kiểm tra admin token hoặc secret key (bảo mật đơn giản)
  const adminSecret = req.headers['x-admin-secret'] || req.query.secret;
  if (adminSecret !== 'ngochuongfarm2024') {
    return res.status(403).json(formatResponse(false, null, 'Unauthorized: Invalid admin secret'));
  }
  
  db.run('DELETE FROM orders', function(err) {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      console.log(`[API] ⚠️ CLEARED ALL ORDERS - Deleted ${this.changes} orders from database`);
      res.json(formatResponse(true, { 
        deleted: true, 
        count: this.changes,
        message: `Successfully deleted ${this.changes} orders` 
      }));
    }
  });
});

app.get('/api/orders/track/:id', (req, res) => {
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else if (!row) {
      res.status(404).json(formatResponse(false, null, 'Order not found'));
    } else {
      const order = {
        ...row,
        items: JSON.parse(row.items),
        customerInfo: JSON.parse(row.customerInfo),
        cookieId: row.cookieId || null
      };
      res.json(formatResponse(true, order));
    }
  });
});

// ============= COUPONS ROUTES =============
app.get('/api/coupons', (req, res) => {
  db.all('SELECT * FROM coupons ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      const coupons = rows.map(row => ({
        ...row,
        isActive: Boolean(row.isActive)
      }));
      res.json(formatResponse(true, coupons));
    }
  });
});

app.post('/api/coupons', (req, res) => {
  const coupon = {
    id: req.body.id || uuidv4(),
    ...req.body,
    isActive: req.body.isActive ? 1 : 0
  };

  db.run(
    `INSERT INTO coupons (id, code, discountType, discountValue, minOrderValue, expiryDate, isActive)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [coupon.id, coupon.code, coupon.discountType, coupon.discountValue, 
     coupon.minOrderValue, coupon.expiryDate, coupon.isActive],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, { ...coupon, isActive: Boolean(coupon.isActive) }));
      }
    }
  );
});

app.put('/api/coupons/:id', (req, res) => {
  const coupon = {
    ...req.body,
    isActive: req.body.isActive ? 1 : 0
  };

  db.run(
    `UPDATE coupons SET code = ?, discountType = ?, discountValue = ?, minOrderValue = ?,
     expiryDate = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [coupon.code, coupon.discountType, coupon.discountValue, coupon.minOrderValue,
     coupon.expiryDate, coupon.isActive, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        res.json(formatResponse(true, { ...coupon, id: req.params.id, isActive: Boolean(coupon.isActive) }));
      }
    }
  );
});

app.delete('/api/coupons/:id', (req, res) => {
  db.run('DELETE FROM coupons WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      res.json(formatResponse(true, { deleted: true }));
    }
  });
});

app.get('/api/coupons/validate/:code', (req, res) => {
  db.get('SELECT * FROM coupons WHERE code = ? AND isActive = 1', [req.params.code.toUpperCase()], (err, row) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else if (!row) {
      res.status(404).json(formatResponse(false, null, 'Coupon not found or inactive'));
    } else {
      const coupon = { ...row, isActive: Boolean(row.isActive) };
      // Check expiry
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        res.status(400).json(formatResponse(false, null, 'Coupon expired'));
      } else {
        res.json(formatResponse(true, coupon));
      }
    }
  });
});

// ============= REVIEWS ROUTES =============
app.post('/api/products/:id/reviews', (req, res) => {
  const review = {
    id: uuidv4(),
    productId: req.params.id,
    ...req.body
  };

  db.run(
    `INSERT INTO reviews (id, productId, userName, rating, comment, isVerified)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [review.id, review.productId, review.userName, review.rating, review.comment, review.isVerified ? 1 : 0],
    function(err) {
      if (err) {
        res.status(500).json(formatResponse(false, null, err.message));
      } else {
        // Update product average rating
        db.all('SELECT AVG(rating) as avg FROM reviews WHERE productId = ?', [req.params.id], (err, rows) => {
          if (!err && rows[0]) {
            db.run('UPDATE products SET averageRating = ? WHERE id = ?', [rows[0].avg, req.params.id]);
          }
        });
        res.json(formatResponse(true, review));
      }
    }
  );
});

app.get('/api/products/:id/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE productId = ? ORDER BY date DESC', [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json(formatResponse(false, null, err.message));
    } else {
      const reviews = rows.map(row => ({
        ...row,
        isVerified: Boolean(row.isVerified)
      }));
      res.json(formatResponse(true, reviews));
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json(formatResponse(true, { status: 'OK', timestamp: new Date().toISOString() }));
});

// Seed data endpoint (chỉ dùng để khởi tạo dữ liệu mẫu)
app.post('/api/seed-data', (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] || req.query.secret;
  if (adminSecret !== 'ngochuongfarm2024') {
    return res.status(403).json(formatResponse(false, null, 'Unauthorized: Invalid admin secret'));
  }

  console.log('🌱 Seeding sample data...');
  
  // Sample products
  const sampleProducts = [
    {
      id: uuidv4(),
      name: 'Rau cải xanh hữu cơ',
      price: 25000,
      unit: 'kg',
      category: 'Rau lá',
      origin: 'Đà Lạt',
      harvestDate: '2024-01-01',
      certifications: JSON.stringify(['Hữu cơ', 'VietGAP']),
      images: JSON.stringify(['/uploads/sample-cai-xanh.jpg']),
      stock: 50,
      description: 'Rau cải xanh tươi ngon, trồng theo phương pháp hữu cơ',
      cultivationProcess: 'Không sử dụng thuốc trừ sâu, phân bón hóa học',
      isFeatured: 1,
      averageRating: 4.5
    },
    {
      id: uuidv4(),
      name: 'Cà chua cherry',
      price: 45000,
      unit: 'kg',
      category: 'Trái cây',
      origin: 'Lâm Đồng',
      harvestDate: '2024-01-02',
      certifications: JSON.stringify(['VietGAP']),
      images: JSON.stringify(['/uploads/sample-ca-chua.jpg']),
      stock: 30,
      description: 'Cà chua cherry ngọt tự nhiên, giàu vitamin C',
      cultivationProcess: 'Trồng trong nhà kính, tưới nước nhỏ giọt',
      isFeatured: 1,
      averageRating: 4.8
    },
    {
      id: uuidv4(),
      name: 'Xà lách xoăn',
      price: 20000,
      unit: 'kg',
      category: 'Rau lá',
      origin: 'Đà Lạt',
      harvestDate: '2024-01-03',
      certifications: JSON.stringify(['Hữu cơ']),
      images: JSON.stringify(['/uploads/sample-xa-lach.jpg']),
      stock: 40,
      description: 'Xà lách xoăn giòn ngọt, thích hợp làm salad',
      cultivationProcess: 'Trồng thủy canh, không đất',
      isFeatured: 0,
      averageRating: 4.2
    }
  ];

  // Sample news
  const sampleNews = [
    {
      id: uuidv4(),
      title: 'Kỹ thuật trồng rau sạch tại nhà',
      summary: 'Hướng dẫn chi tiết cách trồng rau sạch ngay tại nhà với chi phí thấp',
      content: 'Nội dung chi tiết về kỹ thuật trồng rau sạch tại nhà bao gồm: chọn giống, chuẩn bị đất, chăm sóc và thu hoạch.',
      image: '/uploads/sample-news-1.jpg',
      category: 'Kỹ thuật',
      author: 'Ngọc Hường Farm'
    },
    {
      id: uuidv4(),
      title: 'Lợi ích của thực phẩm hữu cơ',
      summary: 'Tại sao nên chọn thực phẩm hữu cơ cho sức khỏe gia đình',
      content: 'Thực phẩm hữu cơ mang lại nhiều lợi ích cho sức khỏe: không chứa hóa chất độc hại, giàu dinh dưỡng, thân thiện với môi trường.',
      image: '/uploads/sample-news-2.jpg',
      category: 'Sức khỏe',
      author: 'Ngọc Hường Farm'
    }
  ];

  // Sample coupons
  const sampleCoupons = [
    {
      id: uuidv4(),
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 100000,
      expiryDate: '2024-12-31',
      isActive: 1
    },
    {
      id: uuidv4(),
      code: 'FREESHIP',
      discountType: 'fixed',
      discountValue: 30000,
      minOrderValue: 200000,
      expiryDate: '2024-12-31',
      isActive: 1
    }
  ];

  db.serialize(() => {
    let completed = 0;
    const total = sampleProducts.length + sampleNews.length + sampleCoupons.length;

    // Insert products
    const productStmt = db.prepare(`
      INSERT OR REPLACE INTO products 
      (id, name, price, unit, category, origin, harvestDate, certifications, images, stock, description, cultivationProcess, isFeatured, averageRating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleProducts.forEach(product => {
      productStmt.run([
        product.id, product.name, product.price, product.unit, product.category,
        product.origin, product.harvestDate, product.certifications, product.images,
        product.stock, product.description, product.cultivationProcess,
        product.isFeatured, product.averageRating
      ], function(err) {
        if (err) console.error('Error inserting product:', err);
        completed++;
        if (completed === total) {
          res.json(formatResponse(true, {
            message: 'Sample data seeded successfully',
            products: sampleProducts.length,
            news: sampleNews.length,
            coupons: sampleCoupons.length
          }));
        }
      });
    });
    productStmt.finalize();

    // Insert news
    const newsStmt = db.prepare(`
      INSERT OR REPLACE INTO news (id, title, summary, content, image, category, author)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    sampleNews.forEach(article => {
      newsStmt.run([
        article.id, article.title, article.summary, article.content,
        article.image, article.category, article.author
      ], function(err) {
        if (err) console.error('Error inserting news:', err);
        completed++;
        if (completed === total) {
          res.json(formatResponse(true, {
            message: 'Sample data seeded successfully',
            products: sampleProducts.length,
            news: sampleNews.length,
            coupons: sampleCoupons.length
          }));
        }
      });
    });
    newsStmt.finalize();

    // Insert coupons
    const couponStmt = db.prepare(`
      INSERT OR REPLACE INTO coupons (id, code, discountType, discountValue, minOrderValue, expiryDate, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    sampleCoupons.forEach(coupon => {
      couponStmt.run([
        coupon.id, coupon.code, coupon.discountType, coupon.discountValue,
        coupon.minOrderValue, coupon.expiryDate, coupon.isActive
      ], function(err) {
        if (err) console.error('Error inserting coupon:', err);
        completed++;
        if (completed === total) {
          res.json(formatResponse(true, {
            message: 'Sample data seeded successfully',
            products: sampleProducts.length,
            news: sampleNews.length,
            coupons: sampleCoupons.length
          }));
        }
      });
    });
    couponStmt.finalize();
  });
});

// Serve frontend trong production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API endpoints available at http://localhost:${PORT}/api`);
});


// Backend API Server cho Ngọc Hường Farm - Supabase Version
require('dotenv').config({ path: '../.env.local' });

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Supabase config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  console.log('Please add these to your .env.local file:');
  console.log('SUPABASE_URL=your-project-url');
  console.log('SUPABASE_SERVICE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Connected to Supabase');

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET || 'ngochuongfarm-secret-key-2024';

const app = express();
const PORT = process.env.PORT || 3001;

// Helper function để lấy thời gian Việt Nam (UTC+7)
const getVietnamTime = () => {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vietnamTime.toISOString().replace('Z', '+07:00');
};

// Format datetime cho hiển thị
const formatVietnamDateTime = () => {
  const now = new Date();
  const vietnamOffset = 7 * 60;
  const localOffset = now.getTimezoneOffset();
  const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
  
  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getDate()).padStart(2, '0');
  const hours = String(vietnamTime.getHours()).padStart(2, '0');
  const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
  const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Base URL cho uploads
const getBaseUrl = (req) => {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return `${req.protocol}://${req.get('host')}`;
};

// Serve static files từ dist folder (production build)
const distPath = path.join(__dirname, '../dist');
console.log(`📁 Looking for dist at: ${distPath}`);
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Serving static files from dist');
} else {
  console.log('⚠️ dist folder not found, frontend will not be served');
}

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploads
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(formatResponse(false, null, 'File quá lớn. Tối đa 10MB'));
    }
    return res.status(400).json(formatResponse(false, null, err.message));
  }
  if (err) return res.status(400).json(formatResponse(false, null, err.message || 'Upload error'));
  next();
};

// Helper: Format response
const formatResponse = (success, data, error = null) => ({ success, data, error });

// ============= PRODUCTS ROUTES =============
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    const products = data.map(row => ({
      ...row,
      images: row.images || [],
      certifications: row.certifications || [],
      isFeatured: Boolean(row.isFeatured),
      price: Number(row.price) || 0,
      stock: Number(row.stock) || 0,
      averageRating: Number(row.averageRating) || 0
    }));

    res.json(formatResponse(true, products));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json(formatResponse(false, null, 'Product not found'));

    const product = {
      ...data,
      images: data.images || [],
      certifications: data.certifications || [],
      isFeatured: Boolean(data.isFeatured)
    };
    res.json(formatResponse(true, product));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const product = {
      id: req.body.id || `P${Date.now()}`,
      name: req.body.name,
      price: req.body.price,
      unit: req.body.unit,
      category: req.body.category,
      origin: req.body.origin,
      harvestDate: req.body.harvestDate,
      certifications: req.body.certifications || [],
      images: req.body.images || [],
      stock: req.body.stock || 0,
      description: req.body.description,
      cultivationProcess: req.body.cultivationProcess,
      isFeatured: req.body.isFeatured || false,
      averageRating: req.body.averageRating || 0,
      createdAt: now,
      updatedAt: now
    };

    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const product = {
      name: req.body.name,
      price: req.body.price,
      unit: req.body.unit,
      category: req.body.category,
      origin: req.body.origin,
      harvestDate: req.body.harvestDate,
      certifications: req.body.certifications || [],
      images: req.body.images || [],
      stock: req.body.stock || 0,
      description: req.body.description,
      cultivationProcess: req.body.cultivationProcess,
      isFeatured: req.body.isFeatured || false,
      averageRating: req.body.averageRating || 0,
      updatedAt: now
    };

    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json(formatResponse(true, { deleted: true }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/products/upload-image', uploadImage.single('image'), uploadErrorHandler, (req, res) => {
  try {
    if (!req.file) return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
    const baseUrl = getBaseUrl(req);
    const fullUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json(formatResponse(true, { url: fullUrl, imageUrl: fullUrl }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});


// ============= NEWS ROUTES =============
app.get('/api/news', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json(formatResponse(false, null, 'News not found'));
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const article = {
      id: req.body.id || uuidv4(),
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      author: req.body.author,
      createdAt: now,
      updatedAt: now
    };

    const { data, error } = await supabase.from('news').insert([article]).select().single();
    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.put('/api/news/:id', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const article = {
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      author: req.body.author,
      updatedAt: now
    };

    const { data, error } = await supabase
      .from('news')
      .update(article)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('news').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json(formatResponse(true, { deleted: true }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/news/upload-image', uploadImage.single('image'), uploadErrorHandler, (req, res) => {
  try {
    if (!req.file) return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
    const baseUrl = getBaseUrl(req);
    const fullUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json(formatResponse(true, { url: fullUrl, imageUrl: fullUrl }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/news/upload-video', upload.single('video'), uploadErrorHandler, (req, res) => {
  try {
    if (!req.file) return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
    const baseUrl = getBaseUrl(req);
    const fullUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json(formatResponse(true, { url: fullUrl, videoUrl: fullUrl }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

// ============= ORDERS ROUTES =============
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/orders/cookie/:cookieId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('cookieId', req.params.cookieId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json(formatResponse(false, null, 'Order not found'));
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const order = {
      id: req.body.id || `ORD-${uuidv4().substr(0, 8).toUpperCase()}`,
      customerInfo: req.body.customerInfo || {},
      items: req.body.items || [],
      total: req.body.total,
      discountTotal: req.body.discountTotal || 0,
      finalTotal: req.body.finalTotal,
      couponCode: req.body.couponCode,
      paymentMethod: req.body.paymentMethod,
      status: req.body.status || 'Pending',
      cookieId: req.body.cookieId || null,
      createdAt: now,
      updatedAt: now
    };

    const { data, error } = await supabase.from('orders').insert([order]).select().single();
    if (error) throw error;
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const { data, error } = await supabase
      .from('orders')
      .update({ status: req.body.status, updatedAt: now })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatResponse(true, { id: req.params.id, status: req.body.status }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json(formatResponse(true, { deleted: true, id: req.params.id }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.delete('/api/orders/admin/clear-all', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] || req.query.secret;
  if (adminSecret !== 'ngochuongfarm2024') {
    return res.status(403).json(formatResponse(false, null, 'Unauthorized'));
  }

  try {
    const { error } = await supabase.from('orders').delete().neq('id', '');
    if (error) throw error;
    res.json(formatResponse(true, { deleted: true, message: 'All orders cleared' }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/orders/track/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json(formatResponse(false, null, 'Order not found'));
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});


// ============= COUPONS ROUTES =============
app.get('/api/coupons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    const coupons = data.map(row => ({ ...row, isActive: Boolean(row.isActive) }));
    res.json(formatResponse(true, coupons));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const coupon = {
      id: req.body.id || uuidv4(),
      code: req.body.code,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      minOrderValue: req.body.minOrderValue || 0,
      expiryDate: req.body.expiryDate,
      isActive: req.body.isActive !== false,
      createdAt: now,
      updatedAt: now
    };

    const { data, error } = await supabase.from('coupons').insert([coupon]).select().single();
    if (error) throw error;
    res.json(formatResponse(true, { ...data, isActive: Boolean(data.isActive) }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.put('/api/coupons/:id', async (req, res) => {
  try {
    const now = formatVietnamDateTime();
    const coupon = {
      code: req.body.code,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      minOrderValue: req.body.minOrderValue || 0,
      expiryDate: req.body.expiryDate,
      isActive: req.body.isActive !== false,
      updatedAt: now
    };

    const { data, error } = await supabase
      .from('coupons')
      .update(coupon)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatResponse(true, { ...data, isActive: Boolean(data.isActive) }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json(formatResponse(true, { deleted: true }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/coupons/validate/:code', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', req.params.code.toUpperCase())
      .eq('isActive', true)
      .single();

    if (error || !data) {
      return res.status(404).json(formatResponse(false, null, 'Coupon not found or inactive'));
    }

    if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
      return res.status(400).json(formatResponse(false, null, 'Coupon expired'));
    }

    res.json(formatResponse(true, { ...data, isActive: Boolean(data.isActive) }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

// ============= REVIEWS ROUTES =============
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const review = {
      id: uuidv4(),
      productId: req.params.id,
      userName: req.body.userName,
      rating: req.body.rating,
      comment: req.body.comment,
      isVerified: req.body.isVerified || false,
      date: new Date().toISOString()
    };

    const { data, error } = await supabase.from('reviews').insert([review]).select().single();
    if (error) throw error;

    // Update product average rating (trigger sẽ tự động làm trong Supabase)
    res.json(formatResponse(true, data));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('productId', req.params.id)
      .order('date', { ascending: false });

    if (error) throw error;
    const reviews = data.map(row => ({ ...row, isVerified: Boolean(row.isVerified) }));
    res.json(formatResponse(true, reviews));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, error.message));
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json(formatResponse(true, { status: 'OK', database: 'Supabase', timestamp: new Date().toISOString() }));
});

// ============= ADMIN AUTH ROUTES =============
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json(formatResponse(false, null, 'Vui lòng nhập tài khoản và mật khẩu'));
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json(formatResponse(false, null, 'Tài khoản admin không tồn tại'));
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json(formatResponse(false, null, 'Mật khẩu không chính xác'));
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json(formatResponse(true, {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        role: 'admin'
      }
    }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, 'Lỗi xác thực'));
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json(formatResponse(false, null, 'Thiếu thông tin'));
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(404).json(formatResponse(false, null, 'Admin không tồn tại'));
    }

    const isValidPassword = await bcrypt.compare(oldPassword, admin.password);
    if (!isValidPassword) {
      return res.status(401).json(formatResponse(false, null, 'Mật khẩu cũ không đúng'));
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: hashedNewPassword })
      .eq('username', username);

    if (updateError) throw updateError;
    res.json(formatResponse(true, { message: 'Đổi mật khẩu thành công' }));
  } catch (error) {
    res.status(500).json(formatResponse(false, null, 'Lỗi đổi mật khẩu'));
  }
});

// Serve frontend trong production
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Run npm run build first.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🗄️ Database: Supabase`);
});

// Script thêm dữ liệu mẫu vào database
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('ngochuongfarm.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
    seedData();
  }
});

function seedData() {
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
      content: 'Nội dung chi tiết về kỹ thuật trồng rau sạch...',
      image: '/uploads/sample-news-1.jpg',
      category: 'Kỹ thuật',
      author: 'Ngọc Hường Farm'
    },
    {
      id: uuidv4(),
      title: 'Lợi ích của thực phẩm hữu cơ',
      summary: 'Tại sao nên chọn thực phẩm hữu cơ cho sức khỏe gia đình',
      content: 'Thực phẩm hữu cơ mang lại nhiều lợi ích...',
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
      ]);
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
      ]);
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
      ]);
    });
    couponStmt.finalize();

    console.log('✅ Sample data inserted successfully!');
    console.log(`📦 Added ${sampleProducts.length} products`);
    console.log(`📰 Added ${sampleNews.length} news articles`);
    console.log(`🎫 Added ${sampleCoupons.length} coupons`);
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  });
}
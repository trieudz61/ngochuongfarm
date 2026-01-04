
import { Product, Review } from '../types';

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', userName: 'Chị Mai Lan', rating: 5, comment: 'Cam mọng nước, vị ngọt thanh rất đặc trưng. Sẽ ủng hộ dài lâu!', date: '2024-06-01', isVerified: true },
  { id: 'r2', userName: 'Anh Minh Tuấn', rating: 5, comment: 'Đóng gói rất kỹ càng, giao hàng nhanh. Cam chuẩn vị Hạnh Lâm.', date: '2024-05-28', isVerified: true },
  { id: 'r3', userName: 'Bác Hùng', rating: 4, comment: 'Sản phẩm tươi, ngon. Giá hơi cao một chút nhưng xứng đáng đồng tiền.', date: '2024-05-20', isVerified: true },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Cam Vinh Đặc Sản',
    price: 45000,
    unit: 'kg',
    category: 'Trái cây',
    origin: 'Quỳ Hợp, Nghệ An',
    harvestDate: '2024-05-15',
    certifications: ['TQC', 'Chỉ dẫn địa lý'],
    images: ['https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80'],
    stock: 500,
    description: 'Cam Vinh nổi tiếng với vỏ mỏng, mọng nước, vị ngọt thanh và hương thơm đặc trưng của vùng đất Nghệ An.',
    cultivationProcess: 'Trồng theo quy trình TQC, sử dụng phân bón hữu cơ, không sử dụng chất kích thích tăng trưởng.',
    isFeatured: true,
    reviews: MOCK_REVIEWS,
    averageRating: 4.8
  },
  {
    id: 'p2',
    name: 'Bưởi Da Xanh Loại 1',
    price: 65000,
    unit: 'kg',
    category: 'Trái cây',
    origin: 'Mỏ Cày Bắc, Bến Tre',
    harvestDate: '2024-05-20',
    certifications: ['GlobalGAP', 'Organic'],
    images: ['https://images.unsplash.com/photo-1582284540020-8acaf0183447?auto=format&fit=crop&w=600&q=80'],
    stock: 200,
    description: 'Bưởi da xanh ruột hồng, tép bưởi bó chặt, dễ lột, vị ngọt không chua, là loại bưởi ngon nhất Việt Nam.',
    cultivationProcess: 'Canh tác hữu cơ hoàn toàn, tưới bằng nước ngọt phù sa sông Tiền.',
    isFeatured: true,
    reviews: MOCK_REVIEWS.slice(0, 2),
    averageRating: 5.0
  },
  {
    id: 'p3',
    name: 'Mật Ong Hoa Nhãn',
    price: 150000,
    unit: 'Lít',
    category: 'Khác',
    origin: 'Hưng Yên',
    harvestDate: '2024-04-10',
    certifications: ['OCOP 4 sao'],
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'],
    stock: 100,
    description: 'Mật ong nguyên chất từ hoa nhãn Hưng Yên, thơm nồng, đặc sánh và giàu dinh dưỡng.',
    cultivationProcess: 'Thu hoạch thủ công, lọc sạch tạp chất, không pha đường.',
    isFeatured: true,
    reviews: [],
    averageRating: 0
  },
  {
    id: 'p4',
    name: 'Cam Bù Hương Sơn (Sỉ)',
    price: 550000,
    unit: 'Thùng',
    category: 'Trái cây',
    origin: 'Hương Sơn, Hà Tĩnh',
    harvestDate: '2024-05-22',
    certifications: ['TQC'],
    images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9caab53?auto=format&fit=crop&w=600&q=80'],
    stock: 50,
    description: 'Cam bù thùng sỉ 10kg, lựa chọn kỹ những quả đồng đều nhất.',
    cultivationProcess: 'Trồng trên sườn đồi, đón nắng gió tự nhiên, bón phân vi sinh tự ủ.',
    isFeatured: true,
    reviews: MOCK_REVIEWS.slice(1, 3),
    averageRating: 4.5
  }
];

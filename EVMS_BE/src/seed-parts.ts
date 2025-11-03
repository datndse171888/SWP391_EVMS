import mongoose from 'mongoose';
import { Part } from './models/Part.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evms';

const partsData = [
  // Lốp xe
  { name: 'Lốp xe ô tô 185/65R15', description: 'Lốp xe ô tô cao cấp, độ bền cao, an toàn', manufacturer: 'Michelin', partNumber: 'MIC-185-65-15', price: 1200000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Lốp xe ô tô 195/55R16', description: 'Lốp xe ô tô hiệu suất cao', manufacturer: 'Bridgestone', partNumber: 'BRI-195-55-16', price: 1500000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Lốp xe ô tô 205/60R16', description: 'Lốp xe ô tô tiết kiệm nhiên liệu', manufacturer: 'Goodyear', partNumber: 'GOO-205-60-16', price: 1350000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Lốp xe ô tô 215/65R16', description: 'Lốp xe ô tô SUV chất lượng cao', manufacturer: 'Continental', partNumber: 'CON-215-65-16', price: 1600000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },

  // Dầu nhớt
  { name: 'Dầu nhớt động cơ 5W-30', description: 'Dầu nhớt tổng hợp cho động cơ xăng', manufacturer: 'Castrol', partNumber: 'CAS-5W30-4L', price: 450000, status: 'active', warrantyPeriod: 6, warrantyCondition: 'tháng' },
  { name: 'Dầu nhớt động cơ 10W-40', description: 'Dầu nhớt bán tổng hợp', manufacturer: 'Shell', partNumber: 'SHE-10W40-4L', price: 380000, status: 'active', warrantyPeriod: 6, warrantyCondition: 'tháng' },
  { name: 'Dầu nhớt động cơ 0W-20', description: 'Dầu nhớt tiết kiệm nhiên liệu', manufacturer: 'Mobil', partNumber: 'MOB-0W20-4L', price: 520000, status: 'active', warrantyPeriod: 6, warrantyCondition: 'tháng' },
  { name: 'Dầu nhớt động cơ 15W-40', description: 'Dầu nhớt cho động cơ diesel', manufacturer: 'Total', partNumber: 'TOT-15W40-4L', price: 420000, status: 'active', warrantyPeriod: 6, warrantyCondition: 'tháng' },

  // Bộ lọc
  { name: 'Lọc gió động cơ', description: 'Lọc gió động cơ chất lượng cao', manufacturer: 'Bosch', partNumber: 'BOS-AIR-001', price: 250000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Lọc dầu động cơ', description: 'Lọc dầu động cơ chính hãng', manufacturer: 'Mann', partNumber: 'MAN-OIL-001', price: 180000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Lọc cabin (lọc gió điều hòa)', description: 'Lọc cabin chất lượng cao', manufacturer: 'Fram', partNumber: 'FRA-CAB-001', price: 320000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Lọc xăng', description: 'Lọc xăng chính hãng', manufacturer: 'Wix', partNumber: 'WIX-FUEL-001', price: 150000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },

  // Hệ thống phanh
  { name: 'Má phanh trước', description: 'Má phanh trước chất lượng cao', manufacturer: 'Brembo', partNumber: 'BRE-PAD-F', price: 850000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Má phanh sau', description: 'Má phanh sau chính hãng', manufacturer: 'Brembo', partNumber: 'BRE-PAD-R', price: 720000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Đĩa phanh trước', description: 'Đĩa phanh trước chất lượng cao', manufacturer: 'Brembo', partNumber: 'BRE-DISC-F', price: 1200000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Đĩa phanh sau', description: 'Đĩa phanh sau chính hãng', manufacturer: 'Brembo', partNumber: 'BRE-DISC-R', price: 950000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Dầu phanh DOT 4', description: 'Dầu phanh chất lượng cao', manufacturer: 'Bosch', partNumber: 'BOS-BRAKE-OIL', price: 120000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },

  // Hệ thống điện
  { name: 'Ắc quy ô tô 12V 60Ah', description: 'Ắc quy khô chất lượng cao', manufacturer: 'Varta', partNumber: 'VAR-12V-60AH', price: 2500000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Ắc quy ô tô 12V 75Ah', description: 'Ắc quy khô dung lượng lớn', manufacturer: 'Optima', partNumber: 'OPT-12V-75AH', price: 3200000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Bugi đánh lửa Iridium', description: 'Bugi đánh lửa hiệu suất cao', manufacturer: 'NGK', partNumber: 'NGK-IR-IX', price: 180000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Bugi đánh lửa Platinum', description: 'Bugi đánh lửa bền bỉ', manufacturer: 'Denso', partNumber: 'DEN-PT-001', price: 150000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },

  // Hệ thống làm mát
  { name: 'Nước làm mát động cơ', description: 'Nước làm mát chất lượng cao', manufacturer: 'Prestone', partNumber: 'PRS-COOL-2L', price: 280000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Quạt tản nhiệt', description: 'Quạt tản nhiệt chính hãng', manufacturer: 'Denso', partNumber: 'DEN-FAN-001', price: 1500000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Dây curoa', description: 'Dây curoa chất lượng cao', manufacturer: 'Gates', partNumber: 'GAT-BELT-001', price: 450000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },

  // Hệ thống treo
  { name: 'Giảm xóc trước', description: 'Giảm xóc trước chất lượng cao', manufacturer: 'KYB', partNumber: 'KYB-SHOCK-F', price: 1800000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Giảm xóc sau', description: 'Giảm xóc sau chính hãng', manufacturer: 'KYB', partNumber: 'KYB-SHOCK-R', price: 1600000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Lò xo treo trước', description: 'Lò xo treo trước chất lượng cao', manufacturer: 'Eibach', partNumber: 'EIB-SPRING-F', price: 950000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Lò xo treo sau', description: 'Lò xo treo sau chính hãng', manufacturer: 'Eibach', partNumber: 'EIB-SPRING-R', price: 850000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },

  // Hệ thống truyền động
  { name: 'Dầu hộp số tự động', description: 'Dầu hộp số tự động chất lượng cao', manufacturer: 'Mobil', partNumber: 'MOB-ATF-4L', price: 520000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Dầu hộp số sàn', description: 'Dầu hộp số sàn chính hãng', manufacturer: 'Shell', partNumber: 'SHE-MTF-1L', price: 280000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Nhông sên dĩa', description: 'Bộ nhông sên dĩa chất lượng cao', manufacturer: 'DID', partNumber: 'DID-SET-001', price: 1200000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },

  // Phụ kiện khác
  { name: 'Gương chiếu hậu', description: 'Gương chiếu hậu chính hãng', manufacturer: 'Rizoma', partNumber: 'RIZ-MIR-001', price: 450000, status: 'active', warrantyPeriod: 12, warrantyCondition: 'tháng' },
  { name: 'Cảm biến ABS', description: 'Cảm biến ABS chất lượng cao', manufacturer: 'Bosch', partNumber: 'BOS-ABS-001', price: 850000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Cảm biến oxy', description: 'Cảm biến oxy chính hãng', manufacturer: 'Denso', partNumber: 'DEN-O2-001', price: 650000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
  { name: 'Bộ điều chỉnh áp suất xăng', description: 'Bộ điều chỉnh áp suất xăng', manufacturer: 'Bosch', partNumber: 'BOS-FPR-001', price: 750000, status: 'active', warrantyPeriod: 24, warrantyCondition: 'tháng' },
];

async function seedParts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa tất cả linh kiện cũ
    await Part.deleteMany({});
    console.log('🗑️  Đã xóa tất cả linh kiện cũ');

    // Thêm linh kiện mới
    const created = await Part.insertMany(partsData);
    console.log(`✅ Đã thêm ${created.length} linh kiện vào database`);

    await mongoose.disconnect();
    console.log('✅ Ngắt kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedParts();


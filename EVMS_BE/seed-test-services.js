// Seed test services with periodic fields
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evms';

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  vehicleCategory: { type: String, enum: ['CAR', 'BICYCLE', 'MOTOBIKE'], required: true },
  duration: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  periodicEnabled: { type: Boolean, default: false },
  intervalMonths: { type: Number },
  defaultTotalVisits: { type: Number },
}, { timestamps: true });

async function seedServices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Service = mongoose.model('Service', ServiceSchema);

    // Clear existing services (optional - comment out if you want to keep existing)
    // await Service.deleteMany({});
    // console.log('🗑️  Cleared existing services\n');

    const testServices = [
      {
        name: 'Bảo dưỡng định kỳ xe đạp điện',
        price: 200000,
        vehicleCategory: 'BICYCLE',
        duration: 60,
        description: 'Kiểm tra và bảo dưỡng toàn bộ hệ thống xe đạp điện',
        image: 'https://example.com/bicycle-service.jpg',
        periodicEnabled: true,
        intervalMonths: 3,
        defaultTotalVisits: 12,
      },
      {
        name: 'Thay pin xe máy điện',
        price: 500000,
        vehicleCategory: 'MOTOBIKE',
        duration: 90,
        description: 'Thay thế pin cũ bằng pin mới chính hãng',
        image: 'https://example.com/battery-replacement.jpg',
        periodicEnabled: false,
      },
      {
        name: 'Bảo dưỡng định kỳ ô tô điện',
        price: 800000,
        vehicleCategory: 'CAR',
        duration: 120,
        description: 'Bảo dưỡng toàn diện cho xe ô tô điện',
        image: 'https://example.com/car-service.jpg',
        periodicEnabled: true,
        intervalMonths: 6,
        defaultTotalVisits: 8,
      },
      {
        name: 'Kiểm tra hệ thống phanh',
        price: 150000,
        vehicleCategory: 'BICYCLE',
        duration: 30,
        description: 'Kiểm tra và điều chỉnh hệ thống phanh',
        periodicEnabled: false,
      },
      {
        name: 'Bảo dưỡng động cơ xe máy điện',
        price: 350000,
        vehicleCategory: 'MOTOBIKE',
        duration: 75,
        description: 'Bảo dưỡng và kiểm tra động cơ điện',
        periodicEnabled: true,
        intervalMonths: 4,
        defaultTotalVisits: 10,
      },
    ];

    console.log('📝 Creating test services...\n');
    
    for (const serviceData of testServices) {
      const service = await Service.create(serviceData);
      console.log(`✅ Created: ${service.name}`);
      console.log(`   - Price: ${service.price.toLocaleString('vi-VN')} VNĐ`);
      console.log(`   - Duration: ${service.duration} phút`);
      console.log(`   - Vehicle: ${service.vehicleCategory}`);
      if (service.periodicEnabled) {
        console.log(`   - 🔄 Periodic: ${service.intervalMonths} tháng x ${service.defaultTotalVisits} lần`);
      } else {
        console.log(`   - ⚪ Not periodic`);
      }
      console.log('');
    }

    console.log('🎉 Successfully seeded test services!');
    console.log(`📊 Total: ${testServices.length} services created`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedServices();


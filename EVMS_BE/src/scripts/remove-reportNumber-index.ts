import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function removeReportNumberIndex() {
  try {
    await mongoose.connect(env.mongoUri || '', { dbName: env.dbName });
    console.log('✅ Đã kết nối MongoDB');

    const db = mongoose.connection.db;
    const collection = db?.collection('vehicleconditionreports');

    if (!collection) {
      console.error('❌ Không tìm thấy collection vehicleconditionreports');
      process.exit(1);
    }

    // Xóa index reportNumber_1
    try {
      await collection.dropIndex('reportNumber_1');
      console.log('✅ Đã xóa index reportNumber_1');
    } catch (error: any) {
      if (error.code === 27) {
        // Index không tồn tại
        console.log('ℹ️  Index reportNumber_1 không tồn tại');
      } else {
        throw error;
      }
    }

    // Liệt kê các index còn lại
    const indexes = await collection.indexes();
    console.log('\n📋 Các index hiện tại:');
    indexes.forEach((index: any) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

removeReportNumberIndex();


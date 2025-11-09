import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'evms';

console.log('🔌 Connecting to MongoDB Atlas...\n');

mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Test query giống như trong revenueController
    const now = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1); // 30 ngày qua
    const end = new Date();

    console.log('📅 Period:', start.toISOString(), 'to', end.toISOString());
    console.log('');

    // Test: Lấy completed appointments
    const completedAppointments = await mongoose.connection.db
      .collection('appointments')
      .find({ status: 'completed' })
      .toArray();

    console.log('╔════════════════════════════════════════╗');
    console.log('║     COMPLETED APPOINTMENTS             ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`Total: ${completedAppointments.length}`);
    console.log('');

    if (completedAppointments.length === 0) {
      console.log('⚠️  Chưa có Appointment nào có status = "completed"');
      console.log('');
      console.log('💡 Để test Revenue Dashboard:');
      console.log('   1. Tìm 1 Appointment trong database');
      console.log('   2. Update status = "completed"');
      console.log('   3. Hoặc tôi có thể tạo dữ liệu mẫu');
      console.log('');
    } else {
      // Hiển thị sample
      completedAppointments.slice(0, 3).forEach((apt, i) => {
        console.log(`Appointment #${i + 1}:`);
        console.log(`  ID: ${apt._id}`);
        console.log(`  Service ID: ${apt.serviceID || 'N/A'}`);
        console.log(`  Package ID: ${apt.servicePackageID || 'N/A'}`);
        console.log(`  Status: ${apt.status}`);
        console.log(`  Updated At: ${apt.updatedAt}`);
        console.log('');
      });

      // Test aggregation
      console.log('╔════════════════════════════════════════╗');
      console.log('║     REVENUE CALCULATION TEST           ║');
      console.log('╚════════════════════════════════════════╝\n');

      const revenueTest = await mongoose.connection.db.collection('appointments').aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $facet: {
            withService: [
              { $match: { serviceID: { $exists: true, $ne: null } } },
              {
                $lookup: {
                  from: 'services',
                  localField: 'serviceID',
                  foreignField: '_id',
                  as: 'service'
                }
              },
              { $unwind: '$service' },
              {
                $project: {
                  price: '$service.price',
                  serviceName: '$service.name'
                }
              }
            ],
            withPackage: [
              { $match: { servicePackageID: { $exists: true, $ne: null } } },
              {
                $lookup: {
                  from: 'servicepackages',
                  localField: 'servicePackageID',
                  foreignField: '_id',
                  as: 'package'
                }
              },
              { $unwind: '$package' },
              {
                $project: {
                  price: '$package.price',
                  packageName: '$package.name'
                }
              }
            ]
          }
        },
        {
          $project: {
            all: { $concatArrays: ['$withService', '$withPackage'] }
          }
        },
        { $unwind: '$all' },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$all.price' },
            totalTransactions: { $sum: 1 }
          }
        }
      ]).toArray();

      if (revenueTest.length > 0) {
        const result = revenueTest[0];
        console.log(`💰 Total Revenue: ${result.totalRevenue.toLocaleString('vi-VN')} VNĐ`);
        console.log(`📊 Total Transactions: ${result.totalTransactions}`);
        console.log(`💳 Average: ${Math.round(result.totalRevenue / result.totalTransactions).toLocaleString('vi-VN')} VNĐ`);
        console.log('');
        console.log('✅ Revenue Dashboard SẼ HOẠT ĐỘNG với dữ liệu này!');
      } else {
        console.log('⚠️  Không tính được revenue (có thể Service/Package bị thiếu)');
      }
    }

    console.log('');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });


import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'evms';

console.log('🔌 Connecting to MongoDB Atlas...\n');

mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Lấy appointment hiện có (status = pending)
    const pendingAppointment = await mongoose.connection.db
      .collection('appointments')
      .findOne({ status: 'pending' });

    if (!pendingAppointment) {
      console.log('❌ Không tìm thấy Appointment nào để update');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('📋 Tìm thấy Appointment:');
    console.log(`   ID: ${pendingAppointment._id}`);
    console.log(`   Service ID: ${pendingAppointment.serviceID || 'N/A'}`);
    console.log(`   Package ID: ${pendingAppointment.servicePackageID || 'N/A'}`);
    console.log(`   Status: ${pendingAppointment.status}`);
    console.log('');

    // Lấy thông tin Service để biết giá
    let price = 0;
    let itemName = '';

    if (pendingAppointment.serviceID) {
      const service = await mongoose.connection.db
        .collection('services')
        .findOne({ _id: pendingAppointment.serviceID });
      
      if (service) {
        price = service.price;
        itemName = service.name;
        console.log(`💰 Service: ${service.name} - ${service.price.toLocaleString('vi-VN')} VNĐ`);
      }
    } else if (pendingAppointment.servicePackageID) {
      const pkg = await mongoose.connection.db
        .collection('servicepackages')
        .findOne({ _id: pendingAppointment.servicePackageID });
      
      if (pkg) {
        price = pkg.price;
        itemName = pkg.name;
        console.log(`💰 Package: ${pkg.name} - ${pkg.price.toLocaleString('vi-VN')} VNĐ`);
      }
    }

    console.log('');
    console.log('🔄 Updating appointment to "completed"...');

    // Update appointment thành completed
    const result = await mongoose.connection.db
      .collection('appointments')
      .updateOne(
        { _id: pendingAppointment._id },
        { 
          $set: { 
            status: 'completed',
            updatedAt: new Date()
          } 
        }
      );

    if (result.modifiedCount > 0) {
      console.log('✅ Updated successfully!');
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║     REVENUE DASHBOARD STATUS           ║');
      console.log('╚════════════════════════════════════════╝\n');
      console.log('✅ Có 1 Appointment completed');
      console.log(`💰 Doanh thu: ${price.toLocaleString('vi-VN')} VNĐ`);
      console.log(`📊 Giao dịch: 1`);
      console.log('');
      console.log('🎉 Revenue Dashboard bây giờ sẽ hiển thị dữ liệu!');
      console.log('');
      console.log('📍 Truy cập: http://192.168.2.2:5173/admin/revenue');
    } else {
      console.log('❌ Update failed');
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


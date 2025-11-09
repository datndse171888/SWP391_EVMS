import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'evms';

console.log('🔌 Connecting to MongoDB Atlas...\n');

mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Check all collections
    const collections = [
      'users',
      'appointments',
      'services',
      'servicepackages',
      'payments',
      'bills',
      'parts',
      'inventories'
    ];

    console.log('╔════════════════════════════════════════╗');
    console.log('║     DATABASE OVERVIEW                  ║');
    console.log('╚════════════════════════════════════════╝\n');

    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        const icon = count > 0 ? '✅' : '⚠️ ';
        console.log(`${icon} ${collectionName.padEnd(20)} : ${count} documents`);
      } catch (err) {
        console.log(`❌ ${collectionName.padEnd(20)} : Error - ${err.message}`);
      }
    }

    console.log('\n');

    // Check Appointments
    const appointmentCount = await mongoose.connection.db.collection('appointments').countDocuments();
    if (appointmentCount > 0) {
      console.log('╔════════════════════════════════════════╗');
      console.log('║     APPOINTMENTS SAMPLE                ║');
      console.log('╚════════════════════════════════════════╝\n');
      
      const appointments = await mongoose.connection.db.collection('appointments').find().limit(3).toArray();
      appointments.forEach((apt, i) => {
        console.log(`Appointment #${i + 1}:`);
        console.log(`  ID: ${apt._id}`);
        console.log(`  User ID: ${apt.userID}`);
        console.log(`  Service ID: ${apt.serviceID || 'N/A'}`);
        console.log(`  Service Package ID: ${apt.servicePackageID || 'N/A'}`);
        console.log(`  Status: ${apt.status}`);
        console.log(`  Booking Date: ${apt.bookingDate}`);
        console.log('');
      });
    }

    // Check Services
    const serviceCount = await mongoose.connection.db.collection('services').countDocuments();
    if (serviceCount > 0) {
      console.log('╔════════════════════════════════════════╗');
      console.log('║     SERVICES SAMPLE                    ║');
      console.log('╚════════════════════════════════════════╝\n');
      
      const services = await mongoose.connection.db.collection('services').find().limit(3).toArray();
      services.forEach((svc, i) => {
        console.log(`Service #${i + 1}:`);
        console.log(`  ID: ${svc._id}`);
        console.log(`  Name: ${svc.name}`);
        console.log(`  Price: ${svc.price?.toLocaleString('vi-VN')} VNĐ`);
        console.log(`  Category: ${svc.vehicleCategory}`);
        console.log('');
      });
    }

    console.log('╔════════════════════════════════════════╗');
    console.log('║     REVENUE DASHBOARD STATUS           ║');
    console.log('╚════════════════════════════════════════╝\n');

    const hasAppointments = appointmentCount > 0;
    const hasServices = serviceCount > 0;
    const hasPayments = await mongoose.connection.db.collection('payments').countDocuments() > 0;

    if (!hasAppointments) {
      console.log('❌ Chưa có Appointments - Cần tạo đặt lịch trước');
    } else {
      console.log('✅ Có Appointments');
    }

    if (!hasServices) {
      console.log('❌ Chưa có Services - Cần tạo dịch vụ trước');
    } else {
      console.log('✅ Có Services');
    }

    if (!hasPayments) {
      console.log('❌ Chưa có Payments - Revenue Dashboard sẽ hiển thị 0 VNĐ');
      console.log('');
      console.log('💡 Để tạo Payment:');
      console.log('   - Có thể tạo thủ công qua API POST /api/payments');
      console.log('   - Hoặc user thanh toán qua hệ thống booking');
      console.log('   - Hoặc tôi có thể tạo dữ liệu mẫu cho bạn');
    } else {
      console.log('✅ Có Payments - Revenue Dashboard sẽ hoạt động!');
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


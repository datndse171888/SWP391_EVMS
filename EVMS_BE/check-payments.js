import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evms';
const DB_NAME = process.env.DB_NAME || 'evms';

// Connect to MongoDB
console.log('🔌 Connecting to MongoDB Atlas...\n');
mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Define Payment schema
    const PaymentSchema = new mongoose.Schema({
      appointmentID: mongoose.Schema.Types.ObjectId,
      billID: mongoose.Schema.Types.ObjectId,
      amount: Number,
      paymentMethod: String,
      status: String,
      completedAt: Date,
      createdAt: Date,
      updatedAt: Date
    }, { strict: false });

    const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

    // Get statistics
    const totalCount = await Payment.countDocuments();
    const completedCount = await Payment.countDocuments({ status: 'completed' });
    const pendingCount = await Payment.countDocuments({ status: 'pending' });
    const cancelledCount = await Payment.countDocuments({ status: 'cancelled' });

    console.log('╔════════════════════════════════════════╗');
    console.log('║     PAYMENT DATABASE STATISTICS        ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log('📊 Total Payments:', totalCount);
    console.log('✅ Completed:', completedCount);
    console.log('⏳ Pending:', pendingCount);
    console.log('❌ Cancelled:', cancelledCount);
    console.log('');

    if (totalCount === 0) {
      console.log('⚠️  DATABASE TRỐNG - Chưa có Payment nào!');
      console.log('');
      console.log('💡 Để Revenue Dashboard hoạt động, bạn cần:');
      console.log('   1. Tạo Appointment (đặt lịch)');
      console.log('   2. Tạo Payment cho Appointment');
      console.log('   3. Mark Payment status = "completed"');
      console.log('');
    } else {
      // Get sample payments
      console.log('╔════════════════════════════════════════╗');
      console.log('║     SAMPLE PAYMENTS (First 5)          ║');
      console.log('╚════════════════════════════════════════╝\n');
      
      const samples = await Payment.find().limit(5).lean();
      samples.forEach((payment, index) => {
        console.log(`Payment #${index + 1}:`);
        console.log(`  ID: ${payment._id}`);
        console.log(`  Amount: ${payment.amount?.toLocaleString('vi-VN')} VNĐ`);
        console.log(`  Method: ${payment.paymentMethod}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Completed At: ${payment.completedAt || 'N/A'}`);
        console.log(`  Created At: ${payment.createdAt}`);
        console.log('');
      });

      // Calculate total revenue
      if (completedCount > 0) {
        const revenueStats = await Payment.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amount' },
              avgRevenue: { $avg: '$amount' }
            }
          }
        ]);

        if (revenueStats.length > 0) {
          console.log('╔════════════════════════════════════════╗');
          console.log('║     REVENUE SUMMARY (All Time)         ║');
          console.log('╚════════════════════════════════════════╝\n');
          console.log(`💰 Total Revenue: ${revenueStats[0].totalRevenue.toLocaleString('vi-VN')} VNĐ`);
          console.log(`📊 Average Transaction: ${Math.round(revenueStats[0].avgRevenue).toLocaleString('vi-VN')} VNĐ`);
          console.log(`🔢 Completed Transactions: ${completedCount}`);
          console.log('');
        }
      }
    }

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });


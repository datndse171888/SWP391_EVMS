// Test script to check if services have periodic fields
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evms';

async function testServiceFields() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }));

    // Get all services
    const services = await Service.find().lean();
    
    console.log(`📊 Found ${services.length} services\n`);

    if (services.length === 0) {
      console.log('⚠️  No services found in database');
      return;
    }

    // Check first service
    const firstService = services[0];
    console.log('🔍 First Service Structure:');
    console.log('─'.repeat(50));
    console.log('_id:', firstService._id);
    console.log('name:', firstService.name);
    console.log('price:', firstService.price);
    console.log('duration:', firstService.duration);
    console.log('vehicleCategory:', firstService.vehicleCategory);
    console.log('description:', firstService.description);
    console.log('image:', firstService.image);
    console.log('─'.repeat(50));
    console.log('periodicEnabled:', firstService.periodicEnabled);
    console.log('intervalMonths:', firstService.intervalMonths);
    console.log('defaultTotalVisits:', firstService.defaultTotalVisits);
    console.log('─'.repeat(50));

    // Count services with periodic enabled
    const periodicServices = services.filter(s => s.periodicEnabled === true);
    console.log(`\n✅ Services with periodicEnabled=true: ${periodicServices.length}`);
    
    if (periodicServices.length > 0) {
      console.log('\n📋 Periodic Services:');
      periodicServices.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name}`);
        console.log(`     - Chu kỳ: ${s.intervalMonths} tháng`);
        console.log(`     - Số lần: ${s.defaultTotalVisits} lần`);
      });
    }

    // Check for services missing periodic fields
    const missingFields = services.filter(s => 
      s.periodicEnabled === undefined || 
      s.periodicEnabled === null
    );
    
    if (missingFields.length > 0) {
      console.log(`\n⚠️  ${missingFields.length} services missing periodicEnabled field`);
      console.log('   These services need to be updated with default values');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testServiceFields();


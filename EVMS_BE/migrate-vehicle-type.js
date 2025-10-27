import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Migration script để chuyển đổi vehicleType thành vehicleCategory
    const result = await db.collection('vehicles').updateMany(
      { vehicleType: { $exists: true } },
      [
        {
          $set: {
            vehicleCategory: {
              $switch: {
                branches: [
                  { case: { $eq: ['$vehicleType', 'electric_car'] }, then: 'CAR' },
                  { case: { $eq: ['$vehicleType', 'electric_motorcycle'] }, then: 'MOTOBIKE' },
                  { case: { $eq: ['$vehicleType', 'electric_bike'] }, then: 'BICYCLE' }
                ],
                default: 'CAR' // fallback value
              }
            }
          }
        },
        {
          $unset: 'vehicleType'
        }
      ]
    );
    
    console.log(`Migration completed: ${result.modifiedCount} documents updated`);
    
    // Kiểm tra kết quả
    const vehiclesWithOldField = await db.collection('vehicles').countDocuments({ vehicleType: { $exists: true } });
    const vehiclesWithNewField = await db.collection('vehicles').countDocuments({ vehicleCategory: { $exists: true } });
    
    console.log(`Vehicles with old vehicleType field: ${vehiclesWithOldField}`);
    console.log(`Vehicles with new vehicleCategory field: ${vehiclesWithNewField}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
});

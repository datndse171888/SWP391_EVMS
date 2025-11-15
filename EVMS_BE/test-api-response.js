// Test API response to check if periodic fields are returned
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/services';

async function testApiResponse() {
  try {
    console.log('🌐 Testing API endpoint:', API_URL);
    console.log('─'.repeat(60));

    const response = await axios.get(API_URL, {
      params: {
        page: 1,
        limit: 10
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('📦 Response Data Structure:');
    console.log('   - items:', response.data.items?.length || 0);
    console.log('   - page:', response.data.page);
    console.log('   - limit:', response.data.limit);
    console.log('   - total:', response.data.total);
    console.log('');

    if (response.data.items && response.data.items.length > 0) {
      const firstService = response.data.items[0];
      
      console.log('🔍 First Service from API:');
      console.log('─'.repeat(60));
      console.log('_id:', firstService._id);
      console.log('name:', firstService.name);
      console.log('price:', firstService.price);
      console.log('duration:', firstService.duration, '(type:', typeof firstService.duration + ')');
      console.log('vehicleCategory:', firstService.vehicleCategory);
      console.log('description:', firstService.description);
      console.log('image:', firstService.image);
      console.log('─'.repeat(60));
      console.log('periodicEnabled:', firstService.periodicEnabled, '(type:', typeof firstService.periodicEnabled + ')');
      console.log('intervalMonths:', firstService.intervalMonths, '(type:', typeof firstService.intervalMonths + ')');
      console.log('defaultTotalVisits:', firstService.defaultTotalVisits, '(type:', typeof firstService.defaultTotalVisits + ')');
      console.log('─'.repeat(60));

      // Check if periodic fields exist
      const hasPeriodicFields = 'periodicEnabled' in firstService;
      const hasIntervalMonths = 'intervalMonths' in firstService;
      const hasDefaultVisits = 'defaultTotalVisits' in firstService;

      console.log('\n✅ Field Existence Check:');
      console.log('   - periodicEnabled:', hasPeriodicFields ? '✓' : '✗');
      console.log('   - intervalMonths:', hasIntervalMonths ? '✓' : '✗');
      console.log('   - defaultTotalVisits:', hasDefaultVisits ? '✓' : '✗');

      if (!hasPeriodicFields || !hasIntervalMonths || !hasDefaultVisits) {
        console.log('\n⚠️  WARNING: Some periodic fields are missing from API response!');
        console.log('   This means the backend is not returning these fields.');
      } else {
        console.log('\n🎉 SUCCESS: All periodic fields are present in API response!');
      }

      // Count periodic services
      const periodicServices = response.data.items.filter(s => s.periodicEnabled === true);
      console.log(`\n📊 Statistics:`);
      console.log(`   - Total services: ${response.data.items.length}`);
      console.log(`   - Periodic services: ${periodicServices.length}`);
      console.log(`   - Regular services: ${response.data.items.length - periodicServices.length}`);

      if (periodicServices.length > 0) {
        console.log('\n🔄 Periodic Services:');
        periodicServices.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.name}`);
          console.log(`      - Chu kỳ: ${s.intervalMonths} tháng`);
          console.log(`      - Số lần: ${s.defaultTotalVisits} lần`);
        });
      }

    } else {
      console.log('⚠️  No services found in API response');
    }

  } catch (error) {
    console.error('❌ Error testing API:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received. Is the backend running?');
      console.error('   Make sure to start backend with: npm run dev');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testApiResponse();


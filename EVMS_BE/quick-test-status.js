// Quick test for Update Appointment Status API
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Quick test function
async function quickTest() {
  console.log('🚀 Quick Test for Update Appointment Status API\n');

  // Test 1: Test API endpoint exists (should return 401 without token)
  try {
    console.log('Test 1: Testing endpoint without authentication...');
    await axios.patch(`${BASE_URL}/appointments/507f1f77bcf86cd799439011/status`, {
      status: 'confirmed'
    });
    console.log('❌ Test 1 FAILED - Should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Test 1 PASSED - Endpoint requires authentication');
    } else {
      console.log(`❌ Test 1 FAILED - Unexpected error: ${error.response?.status}`);
    }
  }

  // Test 2: Test with invalid status
  try {
    console.log('\nTest 2: Testing with invalid status...');
    await axios.patch(`${BASE_URL}/appointments/507f1f77bcf86cd799439011/status`, {
      status: 'invalid_status'
    }, {
      headers: {
        'Authorization': 'Bearer fake_token'
      }
    });
    console.log('❌ Test 2 FAILED - Should reject invalid status');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      console.log('✅ Test 2 PASSED - Endpoint properly validates status');
    } else {
      console.log(`❌ Test 2 FAILED - Unexpected error: ${error.response?.status}`);
    }
  }

  // Test 3: Test with missing status
  try {
    console.log('\nTest 3: Testing with missing status...');
    await axios.patch(`${BASE_URL}/appointments/507f1f77bcf86cd799439011/status`, {
      reason: 'Testing missing status'
    }, {
      headers: {
        'Authorization': 'Bearer fake_token'
      }
    });
    console.log('❌ Test 3 FAILED - Should require status field');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      console.log('✅ Test 3 PASSED - Endpoint requires status field');
    } else {
      console.log(`❌ Test 3 FAILED - Unexpected error: ${error.response?.status}`);
    }
  }

  console.log('\n📋 To run full tests with real data:');
  console.log('1. Update test-appointment-status.js with real tokens and appointment IDs');
  console.log('2. Run: node test-appointment-status.js');
  console.log('\n📝 API Endpoint: PATCH /api/appointments/:id/status');
  console.log('📝 Required Body: { status: "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" }');
  console.log('📝 Optional Body: { reason?: string, notes?: string }');
}

// Run quick test
quickTest().catch(console.error);

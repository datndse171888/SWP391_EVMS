// Test script for Update Appointment Status API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testData = {
  // You'll need to replace these with actual IDs from your database
  appointmentId: 'YOUR_APPOINTMENT_ID_HERE',
  adminToken: 'YOUR_ADMIN_TOKEN_HERE',
  staffToken: 'YOUR_STAFF_TOKEN_HERE',
  technicianToken: 'YOUR_TECHNICIAN_TOKEN_HERE'
};

// Test cases
const testCases = [
  {
    name: 'Test 1: Valid transition pending -> confirmed (Admin)',
    token: testData.adminToken,
    appointmentId: testData.appointmentId,
    body: {
      status: 'confirmed',
      reason: 'Admin approved the appointment',
      notes: 'Customer confirmed availability'
    },
    expectedStatus: 200
  },
  {
    name: 'Test 2: Valid transition confirmed -> in_progress (Staff)',
    token: testData.staffToken,
    appointmentId: testData.appointmentId,
    body: {
      status: 'in_progress',
      notes: 'Work started on time'
    },
    expectedStatus: 200
  },
  {
    name: 'Test 3: Valid transition in_progress -> completed (Technician)',
    token: testData.technicianToken,
    appointmentId: testData.appointmentId,
    body: {
      status: 'completed',
      notes: 'All work completed successfully',
      reason: 'Service completed as requested'
    },
    expectedStatus: 200
  },
  {
    name: 'Test 4: Invalid transition pending -> completed (Admin)',
    token: testData.adminToken,
    appointmentId: testData.appointmentId,
    body: {
      status: 'completed',
      reason: 'Trying to skip confirmed and in_progress'
    },
    expectedStatus: 400
  },
  {
    name: 'Test 5: Invalid status value',
    token: testData.adminToken,
    appointmentId: testData.appointmentId,
    body: {
      status: 'invalid_status',
      reason: 'Testing invalid status'
    },
    expectedStatus: 400
  },
  {
    name: 'Test 6: Missing status field',
    token: testData.adminToken,
    appointmentId: testData.appointmentId,
    body: {
      reason: 'Testing missing status'
    },
    expectedStatus: 400
  },
  {
    name: 'Test 7: Non-existent appointment ID',
    token: testData.adminToken,
    appointmentId: '507f1f77bcf86cd799439011', // Non-existent ID
    body: {
      status: 'confirmed',
      reason: 'Testing non-existent appointment'
    },
    expectedStatus: 404
  },
  {
    name: 'Test 8: Unauthorized access (Customer)',
    token: 'CUSTOMER_TOKEN_HERE',
    appointmentId: testData.appointmentId,
    body: {
      status: 'confirmed',
      reason: 'Customer trying to change status'
    },
    expectedStatus: 403
  }
];

// Function to run a single test
async function runTest(testCase) {
  try {
    console.log(`\n🧪 Running: ${testCase.name}`);
    
    const response = await axios.patch(
      `${BASE_URL}/appointments/${testCase.appointmentId}/status`,
      testCase.body,
      {
        headers: {
          'Authorization': `Bearer ${testCase.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Status: ${response.status} (Expected: ${testCase.expectedStatus})`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === testCase.expectedStatus) {
      console.log('✅ Test PASSED');
    } else {
      console.log('❌ Test FAILED - Unexpected status code');
    }

  } catch (error) {
    const status = error.response?.status || 500;
    console.log(`✅ Status: ${status} (Expected: ${testCase.expectedStatus})`);
    
    if (error.response?.data) {
      console.log(`📄 Error Response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`📄 Error:`, error.message);
    }

    if (status === testCase.expectedStatus) {
      console.log('✅ Test PASSED');
    } else {
      console.log('❌ Test FAILED - Unexpected status code');
    }
  }
}

// Function to run all tests
async function runAllTests() {
  console.log('🚀 Starting Appointment Status API Tests...\n');
  console.log('⚠️  Note: Please update testData with actual IDs and tokens before running tests\n');

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    await runTest(testCase);
    if (testCase.name.includes('PASSED')) {
      passedTests++;
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please check the output above.');
  }
}

// Instructions
console.log(`
📋 INSTRUCTIONS FOR TESTING:

1. Start your backend server:
   cd EVMS_BE
   npm run dev

2. Update the testData object with real values:
   - appointmentId: Get from your database
   - adminToken: Login as admin and get token
   - staffToken: Login as staff and get token  
   - technicianToken: Login as technician and get token

3. Install axios if not already installed:
   npm install axios

4. Run this test file:
   node test-appointment-status.js

📝 Test Cases Covered:
- Valid status transitions
- Invalid status transitions
- Invalid status values
- Missing required fields
- Non-existent appointment
- Unauthorized access
- Role-based permissions
`);

// Export for manual testing
module.exports = {
  runTest,
  runAllTests,
  testCases
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

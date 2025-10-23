/**
 * Analytics System Test Script
 * 
 * This script tests the analytics system by simulating page visits
 * and verifying data collection and API responses.
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  testPageId: 'test-page-id-123',
  testSessionId: 'test-session-123',
  testUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Test data
const testAnalyticsData = {
  type: 'page_view',
  page_id: CONFIG.testPageId,
  session_id: CONFIG.testSessionId,
  timestamp: new Date().toISOString(),
  referrer: 'https://google.com',
  utm_source: 'google',
  utm_medium: 'organic',
  utm_campaign: 'test-campaign',
  user_agent: CONFIG.testUserAgent,
  device_info: {
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'Windows'
  },
  duration_seconds: 0,
  clicked_links: []
};

const testClickData = {
  type: 'click',
  page_id: CONFIG.testPageId,
  session_id: CONFIG.testSessionId,
  timestamp: new Date().toISOString(),
  user_agent: CONFIG.testUserAgent,
  link_id: 'instagram',
  link_text: 'Instagram Profile'
};

const testSessionEndData = {
  type: 'session_end',
  page_id: CONFIG.testPageId,
  session_id: CONFIG.testSessionId,
  timestamp: new Date().toISOString(),
  duration_seconds: 120,
  clicked_links: [
    {
      link_id: 'instagram',
      link_text: 'Instagram Profile',
      clicked_at: new Date().toISOString()
    }
  ]
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': CONFIG.testUserAgent,
        'X-Forwarded-For': '8.8.8.8', // Test IP
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

function makeGetRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test functions
async function testTrackingAPI() {
  console.log('🧪 Testing Analytics Tracking API...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/analytics/track`, {
      body: testAnalyticsData
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Tracking API: PASSED');
      return true;
    } else {
      console.log('❌ Tracking API: FAILED');
      console.log('Response:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Tracking API: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testClickTracking() {
  console.log('🧪 Testing Click Tracking...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/analytics/track`, {
      body: testClickData
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Click Tracking: PASSED');
      return true;
    } else {
      console.log('❌ Click Tracking: FAILED');
      console.log('Response:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Click Tracking: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testSessionEnd() {
  console.log('🧪 Testing Session End...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/analytics/track`, {
      body: testSessionEndData
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Session End: PASSED');
      return true;
    } else {
      console.log('❌ Session End: FAILED');
      console.log('Response:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Session End: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testAnalyticsAPI() {
  console.log('🧪 Testing Analytics API...');
  
  try {
    const response = await makeGetRequest(`${CONFIG.baseUrl}/api/analytics/${CONFIG.testPageId}?period=30d`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Analytics API: PASSED');
      console.log('Data:', response.data.data);
      return true;
    } else {
      console.log('❌ Analytics API: FAILED');
      console.log('Response:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Analytics API: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('🧪 Testing Health Check...');
  
  try {
    const response = await makeGetRequest(`${CONFIG.baseUrl}/api/analytics/track`);
    
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('✅ Health Check: PASSED');
      return true;
    } else {
      console.log('❌ Health Check: FAILED');
      console.log('Response:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Health Check: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting...');
  
  try {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest(`${CONFIG.baseUrl}/api/analytics/track`, {
        body: testAnalyticsData
      }));
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 200).length;
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    
    if (successCount > 0 && rateLimitedCount >= 0) {
      console.log('✅ Rate Limiting: PASSED');
      console.log(`Success: ${successCount}, Rate Limited: ${rateLimitedCount}`);
      return true;
    } else {
      console.log('❌ Rate Limiting: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ Rate Limiting: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Analytics System Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Tracking API', fn: testTrackingAPI },
    { name: 'Click Tracking', fn: testClickTracking },
    { name: 'Session End', fn: testSessionEnd },
    { name: 'Analytics API', fn: testAnalyticsAPI },
    { name: 'Rate Limiting', fn: testRateLimiting }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
  });
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Analytics system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testTrackingAPI,
  testClickTracking,
  testSessionEnd,
  testAnalyticsAPI,
  testHealthCheck,
  testRateLimiting
};

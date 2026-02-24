#!/usr/bin/env node

/**
 * Bizhub Integration Test Script
 * Run this to verify your Bizhub API integration is working correctly
 */

const https = require('https');

// Configuration
const BIZHUB_API_URL = process.env.NEXT_PUBLIC_BIZHUB_API_URL || 'https://bizhub-production-0622.up.railway.app/api/v1/storefront';
const BIZHUB_API_KEY = process.env.NEXT_PUBLIC_BIZHUB_API_KEY;

if (!BIZHUB_API_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_BIZHUB_API_KEY environment variable not set');
  console.log('Please set your Bizhub API key:');
  console.log('export NEXT_PUBLIC_BIZHUB_API_KEY=your_api_key_here');
  process.exit(1);
}

// Helper function to make API requests
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BIZHUB_API_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'x-api-key': BIZHUB_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test functions
async function testApiConnection() {
  console.log('🔍 Testing API connection...');
  
  try {
    const response = await makeRequest('/products?limit=1');
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.log('❌ API connection failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ API connection error:', error.message);
    return false;
  }
}

async function testProducts() {
  console.log('🔍 Testing products endpoint...');
  
  try {
    const response = await makeRequest('/products?limit=5');
    
    if (response.status === 200 && response.data.success) {
      const products = response.data.data;
      console.log(`✅ Products endpoint working - found ${products.length} products`);
      
      if (products.length > 0) {
        const product = products[0];
        console.log(`   Sample product: ${product.name} - ₵${product.price}`);
      }
      
      return true;
    } else {
      console.log('❌ Products endpoint failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Products endpoint error:', error.message);
    return false;
  }
}

async function testCategories() {
  console.log('🔍 Testing categories endpoint...');
  
  try {
    const response = await makeRequest('/categories');
    
    if (response.status === 200 && response.data.success) {
      const categories = response.data.data;
      console.log(`✅ Categories endpoint working - found ${categories.length} categories`);
      console.log(`   Categories: ${categories.join(', ')}`);
      return true;
    } else {
      console.log('❌ Categories endpoint failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Categories endpoint error:', error.message);
    return false;
  }
}

async function testSingleProduct() {
  console.log('🔍 Testing single product endpoint...');
  
  try {
    // First get a product ID
    const productsResponse = await makeRequest('/products?limit=1');
    
    if (!productsResponse.data.success || productsResponse.data.data.length === 0) {
      console.log('❌ No products available to test single product endpoint');
      return false;
    }
    
    const productId = productsResponse.data.data[0].id;
    const response = await makeRequest(`/products/${productId}`);
    
    if (response.status === 200 && response.data.success) {
      const product = response.data.data;
      console.log(`✅ Single product endpoint working`);
      console.log(`   Product: ${product.name} (ID: ${product.id})`);
      return true;
    } else {
      console.log('❌ Single product endpoint failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Single product endpoint error:', error.message);
    return false;
  }
}

async function testFiltering() {
  console.log('🔍 Testing product filtering...');
  
  try {
    // Test category filter
    const response = await makeRequest('/products?category=Laptop&limit=3');
    
    if (response.status === 200 && response.data.success) {
      const products = response.data.data;
      console.log(`✅ Product filtering working - found ${products.length} laptops`);
      return true;
    } else {
      console.log('❌ Product filtering failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Product filtering error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Bizhub Integration Tests\n');
  console.log(`API URL: ${BIZHUB_API_URL}`);
  console.log(`API Key: ${BIZHUB_API_KEY.substring(0, 10)}...`);
  console.log('');

  const tests = [
    testApiConnection,
    testProducts,
    testCategories,
    testSingleProduct,
    testFiltering
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log('❌ Test error:', error.message);
      failed++;
    }
    console.log(''); // Empty line between tests
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your Bizhub integration is ready for soft launch! 🚀');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration and try again.');
    console.log('💡 Refer to BIZHUB_INTEGRATION.md for troubleshooting steps.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
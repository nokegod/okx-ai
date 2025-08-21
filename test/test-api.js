const axios = require('axios');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5001/chat-294cc/us-central1/okxChainAI';
const TEST_CONTRACT = '0x1234567890123456789012345678901234567890';

// Test cases
const tests = [
    {
        name: 'Health Check',
        method: 'GET',
        endpoint: '/health',
        expectedStatus: 200
    },
    {
        name: 'Token Analysis',
        method: 'POST',
        endpoint: '/api/token/analyze',
        data: { contractAddress: TEST_CONTRACT },
        expectedStatus: 200
    },
    {
        name: 'Smart Contract Generation',
        method: 'POST',
        endpoint: '/api/contract/generate',
        data: { 
            requirements: 'Generate a simple Meme token contract',
            contractType: 'token'
        },
        expectedStatus: 200
    },
    {
        name: 'NFT Metadata Generation',
        method: 'POST',
        endpoint: '/api/nft/generate',
        data: { 
            description: 'A cute cat NFT',
            attributes: 'Rarity, Color, Background'
        },
        expectedStatus: 200
    },
    {
        name: 'AI Chat',
        method: 'POST',
        endpoint: '/api/chat',
        data: { 
            message: 'What is the OKX Chain RPC address?',
            sessionId: 'test-session'
        },
        expectedStatus: 200
    },
    {
        name: 'On-chain Data Analysis',
        method: 'POST',
        endpoint: '/api/chain/analyze',
        data: { contractAddress: TEST_CONTRACT },
        expectedStatus: 200
    },
    {
        name: 'Investment Advice',
        method: 'POST',
        endpoint: '/api/investment/advice',
        data: { 
            contractAddress: TEST_CONTRACT,
            riskProfile: 'moderate'
        },
        expectedStatus: 200
    },
    {
        name: 'Wallet Query',
        method: 'GET',
        endpoint: `/api/wallet/${TEST_CONTRACT}`,
        expectedStatus: 200
    },
    {
        name: 'Token Balance Query',
        method: 'GET',
        endpoint: `/api/token/${TEST_CONTRACT}/balance/${TEST_CONTRACT}`,
        expectedStatus: 200
    },
    {
        name: 'Analysis History',
        method: 'GET',
        endpoint: '/api/analyses?limit=5',
        expectedStatus: 200
    },
    {
        name: 'Real-time On-chain Data',
        method: 'GET',
        endpoint: '/api/realtime/chain-stats',
        expectedStatus: 200
    }
];

// Run tests
async function runTests() {
    console.log('🧪 Starting API tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            console.log(`📋 Test: ${test.name}`);
            console.log(`🔗 Endpoint: ${test.method} ${test.endpoint}`);
            
            let response;
            if (test.method === 'GET') {
                response = await axios.get(`${BASE_URL}${test.endpoint}`);
            } else if (test.method === 'POST') {
                response = await axios.post(`${BASE_URL}${test.endpoint}`, test.data);
            }
            
            if (response.status === test.expectedStatus) {
                console.log(`✅ Passed - Status code: ${response.status}`);
                passed++;
            } else {
                console.log(`❌ Failed - Expected status code: ${test.expectedStatus}, Actual: ${response.status}`);
                failed++;
            }
            
            // Display response summary
            if (response.data && response.data.success) {
                console.log(`📊 Response: Success`);
            } else if (response.data && response.data.error) {
                console.log(`⚠️  Response: ${response.data.error}`);
            }
            
        } catch (error) {
            console.log(`❌ Failed - ${error.message}`);
            failed++;
        }
        
        console.log('---\n');
    }
    
    // Test results summary
    console.log('📊 Test Results Summary');
    console.log('================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed, please check API configuration');
    }
}

// Performance test
async function performanceTest() {
    console.log('\n🚀 Starting performance test...\n');
    
    const testEndpoint = '/api/chat';
    const testData = { message: 'Performance test', sessionId: 'perf-test' };
    const iterations = 10;
    
    const startTime = Date.now();
    const responseTimes = [];
    
    for (let i = 0; i < iterations; i++) {
        const requestStart = Date.now();
        try {
            await axios.post(`${BASE_URL}${testEndpoint}`, testData);
            const requestTime = Date.now() - requestStart;
            responseTimes.push(requestTime);
            console.log(`Request ${i + 1}: ${requestTime}ms`);
        } catch (error) {
            console.log(`Request ${i + 1}: Failed - ${error.message}`);
        }
    }
    
    const totalTime = Date.now() - startTime;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    console.log('\n📊 Performance Test Results');
    console.log('================');
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Total requests: ${iterations}`);
    console.log(`Successful requests: ${responseTimes.length}`);
}

// Error handling test
async function errorHandlingTest() {
    console.log('\n🔍 Starting error handling test...\n');
    
    const errorTests = [
        {
            name: 'Invalid contract address',
            endpoint: '/api/token/analyze',
            data: { contractAddress: 'invalid-address' },
            expectedError: 'Invalid contract address format'
        },
        {
            name: 'Missing required parameters',
            endpoint: '/api/token/analyze',
            data: {},
            expectedError: 'Please provide token contract address'
        },
        {
            name: 'Empty message',
            endpoint: '/api/chat',
            data: { message: '' },
            expectedError: 'Please provide message content'
        }
    ];
    
    for (const test of errorTests) {
        try {
            console.log(`📋 Test: ${test.name}`);
            const response = await axios.post(`${BASE_URL}${test.endpoint}`, test.data);
            
            if (response.data.error && response.data.error.includes(test.expectedError)) {
                console.log(`✅ Error handling correct - ${response.data.error}`);
            } else {
                console.log(`❌ Error handling exception - Expected: ${test.expectedError}, Actual: ${response.data.error}`);
            }
        } catch (error) {
            if (error.response && error.response.data.error) {
                console.log(`✅ Error handling correct - ${error.response.data.error}`);
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }
        console.log('---\n');
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 OKX Chain AI Assistant - API Test Suite');
        console.log('================================\n');
        
        // Run basic functionality tests
        await runTests();
        
        // Run performance test
        await performanceTest();
        
        // Run error handling test
        await errorHandlingTest();
        
        console.log('\n🎯 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

// If this file is run directly
if (require.main === module) {
    main();
}

module.exports = {
    runTests,
    performanceTest,
    errorHandlingTest
};

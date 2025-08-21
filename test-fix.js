// Test the fixed ensureStringResponse function
class TestTelegramBot {
  // Helper function: Ensure response content is in string format
  ensureStringResponse(response) {
    try {
      if (typeof response === 'string') {
        return response;
      } else if (response && typeof response === 'object') {
        // If it's an object, try JSON serialization
        const jsonString = JSON.stringify(response, null, 2);
        console.log('AI response object converted to JSON string:', jsonString.substring(0, 100) + '...');
        return jsonString;
      } else if (response === null || response === undefined) {
        console.warn('AI response is null/undefined, returning default message');
        return 'Sorry, AI is temporarily unable to answer, please try again later.';
      } else {
        // Convert other types to string
        const stringResponse = String(response);
        console.log('AI response converted to string:', stringResponse.substring(0, 100) + '...');
        return stringResponse;
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      console.error('Original response:', response);
      return 'Sorry, an error occurred while processing AI response, please try again later.';
    }
  }
}

// Test various scenarios
const bot = new TestTelegramBot();

console.log('🧪 Testing ensureStringResponse function fix effect:\n');

// Test 1: Normal string
console.log('1. Normal string:');
console.log('Input:', 'Hello World');
console.log('Output:', bot.ensureStringResponse('Hello World'));
console.log('');

// Test 2: Object (simulate AI returning object scenario)
console.log('2. Object response:');
const objectResponse = { message: 'This is a test message', code: 200, data: { name: 'Test Token', symbol: 'TEST' } };
console.log('Input:', objectResponse);
console.log('Output:', bot.ensureStringResponse(objectResponse));
console.log('');

// Test 3: Number
console.log('3. Number response:');
console.log('Input:', 123);
console.log('Output:', bot.ensureStringResponse(123));
console.log('');

// Test 4: Null value
console.log('4. Null response:');
console.log('Input:', null);
console.log('Output:', bot.ensureStringResponse(null));
console.log('');

// Test 5: Undefined
console.log('5. Undefined response:');
console.log('Input:', undefined);
console.log('Output:', bot.ensureStringResponse(undefined));
console.log('');

// Test 6: Complex object
console.log('6. Complex object response:');
const complexResponse = {
  success: true,
  data: {
    narrative: 'This is a complex token analysis result',
    analysis: {
      technical: 'Technical analysis result',
      fundamental: 'Fundamental analysis result'
    },
    recommendations: ['Buy', 'Hold', 'Sell']
  }
};
console.log('Input:', complexResponse);
console.log('Output:', bot.ensureStringResponse(complexResponse));
console.log('');

console.log('✅ Test completed! All scenarios should be handled correctly, no more "object Object" errors.');

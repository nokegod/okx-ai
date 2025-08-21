// Test modified ensureStringResponse function
class TestTelegramBot {
  // Modified ensureStringResponse function
  ensureStringResponse(response) {
    try {
      if (typeof response === 'string') {
        return response;
      } else if (response && typeof response === 'object') {
        // If it's an object, prioritize extracting message field, if not available then convert to JSON
        if (response.message && typeof response.message === 'string') {
          console.log('AI response object extracted message field:', response.message.substring(0, 100) + '...');
          return response.message;
        } else {
          const jsonString = JSON.stringify(response, null, 2);
          console.log('AI response object converted to JSON string:', jsonString.substring(0, 100) + '...');
          return jsonString;
        }
      } else if (response === null || response === undefined) {
        console.warn('AI response is empty, returning default message');
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
      return 'Sorry, an error occurred while processing the AI response, please try again later.';
    }
  }

  // Test different types of AI responses
  testDifferentResponseTypes() {
    console.log('🧪 Testing modified ensureStringResponse function:\n');
    
    // Test 1: String response
    console.log('Test 1 - String response:');
    const stringResponse = 'This is a simple string reply';
    const result1 = this.ensureStringResponse(stringResponse);
    console.log('Original:', stringResponse);
    console.log('Result:', result1);
    console.log('');
    
    // Test 2: Object response containing message field
    console.log('Test 2 - Object response containing message field:');
    const objectResponse = {
      type: 'normal_response',
      message: 'Sorry, I can only answer questions related to XLayer network (Chain ID: 196), especially about blockchain investor token narrative analysis. If you have related questions or need any help, please let me know.'
    };
    console.log('Original object:', objectResponse);
    const result2 = this.ensureStringResponse(objectResponse);
    console.log('Result:', result2);
    console.log('');
    
    // Test 3: Object response without message field
    console.log('Test 3 - Object response without message field:');
    const objectResponse2 = {
      type: 'error',
      code: 500,
      details: 'Server internal error'
    };
    console.log('Original object:', objectResponse2);
    const result3 = this.ensureStringResponse(objectResponse2);
    console.log('Result:', result3);
    console.log('');
    
    // Test 4: Null response
    console.log('Test 4 - Null response:');
    const nullResponse = null;
    const result4 = this.ensureStringResponse(nullResponse);
    console.log('Original:', nullResponse);
    console.log('Result:', result4);
    console.log('');
    
    // Test 5: Final message format
    console.log('Test 5 - Final message format:');
    const finalMessage = `🤖 AI Answer\n\n${result2}`;
    console.log('Final format:');
    console.log(finalMessage);
    console.log('');
  }
}

// Run tests
function runTests() {
  const bot = new TestTelegramBot();
  
  console.log('🚀 Starting tests for modified ensureStringResponse function...\n');
  
  // Test different types of responses
  bot.testDifferentResponseTypes();
  
  console.log('✅ All tests completed! Now AI responses should only display message field content.');
}

// Run tests
runTests();

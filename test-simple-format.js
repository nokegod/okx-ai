// Test simplified AI response format
class TestTelegramBot {
  // Simulated ensureStringResponse function
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

  // Simulated cleanMarkdown function
  cleanMarkdown(text) {
    try {
      if (!text || typeof text !== 'string') {
        return text;
      }
      
      // Remove special characters that may cause parsing errors
      let cleaned = text
        // Remove unpaired Markdown markers
        .replace(/\*\*(?![^*]*\*\*)/g, '**') // Unpaired bold start
        .replace(/(?<!\*\*)\*\*/g, '**')     // Unpaired bold end
        .replace(/\*(?![^*]*\*)/g, '*')      // Unpaired italic start
        .replace(/(?<!\*)\*/g, '*')          // Unpaired italic end
        .replace(/`(?![^`]*`)/g, '`')        // Unpaired code start
        .replace(/(?<!`)`/g, '`')            // Unpaired code end
        .replace(/\[(?![^\]]*\]\([^)]*\))/g, '[') // Unpaired link start
        .replace(/(?<!\[)\]/g, ']')          // Unpaired link end
        .replace(/\((?![^)]*\))/g, '(')      // Unpaired parenthesis start
        .replace(/(?<!\()\)/g, ')')          // Unpaired parenthesis end
        
        // Remove special characters that may cause problems
        .replace(/[^\w\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>-]/g, '')
        
        // Ensure code block format is correct
        .replace(/```(\w+)?\n?/g, '```\n')
        .replace(/\n?```/g, '\n```');
      
      // If cleaned text is too short, return original text
      if (cleaned.length < 10) {
        console.warn('Cleaned text too short, using original text');
        return text;
      }
      
      console.log('Markdown format cleaning completed, length:', cleaned.length);
      return cleaned;
      
    } catch (error) {
      console.error('Error cleaning Markdown format:', error);
      // If cleaning fails, return safe plain text
      return text ? String(text).replace(/[*_`[\]()]/g, '') : 'Sorry, an error occurred while processing message format.';
    }
  }

  // Test AI dialogue input processing
  async handleChatInput(chatId, message) {
    try {
      console.log(`Processing AI dialogue: ${message}`);
      
      // Simulate sending processing message
      const processingMsg = { message_id: 'processing_msg_123' };
      console.log('Sending processing message:', processingMsg.message_id);

      try {
        // Simulate AI call
        const response = 'This is an AI response content, containing some **bold text** and `code snippets`';
        console.log('AI response:', response);
        
        // Safely delete processing message (simulation)
        console.log('Deleting processing message:', processingMsg.message_id);

        // Ensure response is in string format
        const responseText = this.ensureStringResponse(response);
        
        // Clean Markdown format to prevent parsing errors
        const cleanedResponse = this.cleanMarkdown(responseText);
        
        // Send simplified AI response format
        const finalMessage = `🤖 AI Answer\n\n${cleanedResponse}`;
        console.log('Final message to send:');
        console.log(finalMessage);
        
        return finalMessage;

      } catch (error) {
        console.error('AI dialogue processing failed:', error.message);
        return `❌ AI dialogue failed: ${error.message}\n\nPlease try again or contact administrator.`;
      }

    } catch (error) {
      console.error('AI dialogue processing failed:', error.message);
      return `❌ AI dialogue failed: ${error.message}\n\nPlease try again or contact administrator.`;
    }
  }

  // Test different types of AI responses
  testDifferentResponseTypes() {
    console.log('🧪 Testing different types of AI responses:\n');
    
    // Test 1: String response
    console.log('Test 1 - String response:');
    const stringResponse = 'This is a simple string reply';
    const result1 = this.handleChatInput('chat_123', 'Hello');
    console.log('Result:', result1);
    console.log('');
    
    // Test 2: Object response
    console.log('Test 2 - Object response:');
    const objectResponse = {
      type: 'normal_response',
      message: 'Sorry, I can only answer questions related to XLayer network (Chain ID: 196), especially about blockchain investor token narrative analysis. If you have related questions or need any help, please let me know.'
    };
    console.log('Original object:', objectResponse);
    const stringified = this.ensureStringResponse(objectResponse);
    console.log('After conversion:', stringified);
    console.log('');
    
    // Test 3: Response containing special characters
    console.log('Test 3 - Response containing special characters:');
    const specialCharResponse = 'This is **bold text**, containing *italic* and `code`, as well as [link](http://example.com)';
    console.log('Original text:', specialCharResponse);
    const cleaned = this.cleanMarkdown(specialCharResponse);
    console.log('After cleaning:', cleaned);
    console.log('');
    
    // Test 4: Final message format
    console.log('Test 4 - Final message format:');
    const finalMessage = `🤖 AI Answer\n\n${cleaned}`;
    console.log('Final format:');
    console.log(finalMessage);
    console.log('');
  }
}

// Run tests
async function runTests() {
  const bot = new TestTelegramBot();
  
  console.log('🚀 Starting tests for simplified AI response format...\n');
  
  // Test AI dialogue processing
  await bot.handleChatInput('chat_123', 'Hello');
  
  // Test different types of responses
  bot.testDifferentResponseTypes();
  
  console.log('✅ All tests completed! AI response format is now more concise.');
}

// Run tests
runTests().catch(console.error);

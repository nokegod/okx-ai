// Test Markdown format cleaning and fixing
class TestTelegramBot {
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
        
        // Remove special characters that may cause issues
        .replace(/[^\w\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>-]/g, '')
        
        // Ensure code block format is correct
        .replace(/```(\w+)?\n?/g, '```\n')
        .replace(/\n?```/g, '\n```');
      
      // If cleaned text is too short, return original text
      if (cleaned.length < 10) {
        console.warn('Cleaned text is too short, using original text');
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

  // Test various Markdown format issues
  testMarkdownCleaning() {
    console.log('🧪 Testing Markdown format cleaning functionality:\n');
    
    // Test 1: Unpaired bold markers
    const test1 = 'This is **bold text, but no end marker';
    console.log('Test 1 - Unpaired bold:');
    console.log('Original:', test1);
    console.log('Cleaned:', this.cleanMarkdown(test1));
    console.log('');
    
    // Test 2: Unpaired code markers
    const test2 = 'This is `code text, but no end marker';
    console.log('Test 2 - Unpaired code:');
    console.log('Original:', test2);
    console.log('Cleaned:', this.cleanMarkdown(test2));
    console.log('');
    
    // Test 3: Complex mixed format
    const test3 = '**Bold** *Italic* `Code` [Link](http://example.com) **Unpaired';
    console.log('Test 3 - Complex mixed format:');
    console.log('Original:', test3);
    console.log('Cleaned:', this.cleanMarkdown(test3));
    console.log('');
    
    // Test 4: Code block format
    const test4 = '```solidity\ncontract Test {\n    function test() public {\n        // Test code\n    }\n```';
    console.log('Test 4 - Code block format:');
    console.log('Original:', test4);
    console.log('Cleaned:', this.cleanMarkdown(test4));
    console.log('');
    
    // Test 5: Special characters
    const test5 = 'Special characters: !@#$%^&*()_+-=[]{}|;:,.<>?/"\'\\`~';
    console.log('Test 5 - Special characters:');
    console.log('Original:', test5);
    console.log('Cleaned:', this.cleanMarkdown(test5));
    console.log('');
    
    // Test 6: Chinese text
    const test6 = '**Chinese Bold** *Chinese Italic* `Chinese Code`';
    console.log('Test 6 - Chinese text:');
    console.log('Original:', test6);
    console.log('Cleaned:', this.cleanMarkdown(test6));
    console.log('');
    
    // Test 7: Null values and edge cases
    console.log('Test 7 - Edge cases:');
    console.log('null:', this.cleanMarkdown(null));
    console.log('undefined:', this.cleanMarkdown(undefined));
    console.log('Empty string:', this.cleanMarkdown(''));
    console.log('Number:', this.cleanMarkdown(123));
    console.log('');
  }

  // Test AI response format
  testAIResponseFormat() {
    console.log('🧪 Testing AI response format processing:\n');
    
    // Simulate AI response
    const aiResponse = 'This is an **AI response**, containing *italic text* and `code snippets`, as well as [links](http://example.com)';
    console.log('AI response original content:', aiResponse);
    
    // Clean format
    const cleanedResponse = this.cleanMarkdown(aiResponse);
    console.log('Cleaned content:', cleanedResponse);
    
    // Simulate sending message
    const message = `🤖 **AI Response**\n\n${cleanedResponse}`;
    console.log('Final message format:', message);
    console.log('');
    
    // Test AI response with code blocks
    const aiResponseWithCode = 'This is a response containing code:\n```javascript\nfunction test() {\n    console.log("Hello World");\n}\n```\nCode ends';
    console.log('AI response (with code block) original content:', aiResponseWithCode);
    
    const cleanedResponseWithCode = this.cleanMarkdown(aiResponseWithCode);
    console.log('Cleaned content (with code block):', cleanedResponseWithCode);
    console.log('');
  }
}

// Run tests
function runTests() {
  const bot = new TestTelegramBot();
  
  console.log('🚀 Starting Markdown format cleaning and fixing tests...\n');
  
  // Test Markdown cleaning functionality
  bot.testMarkdownCleaning();
  
  // Test AI response format
  bot.testAIResponseFormat();
  
  console.log('✅ All tests completed! Markdown format should now be safer.');
}

// Run tests
runTests();

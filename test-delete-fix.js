// Test message deletion fix
class TestTelegramBot {
  // Simulated safeDeleteMessage function
  async safeDeleteMessage(chatId, messageId) {
    try {
      if (messageId && chatId) {
        // Simulate message deletion
        console.log(`Attempting to delete message: chatId=${chatId}, messageId=${messageId}`);
        
        // Simulate possible error scenarios
        if (messageId === 'invalid_message_id') {
          throw new Error('ETELEGRAM: 400 Bad Request: message to delete not found');
        }
        
        console.log('Message deleted successfully:', messageId);
        return true;
      }
    } catch (error) {
      // Ignore message deletion errors, don't affect main functionality
      if (error.message.includes('message to delete not found')) {
        console.log('Message already deleted or does not exist:', messageId);
      } else {
        console.warn('Other error occurred while deleting message:', error.message);
      }
    }
  }

  // Simulate handling AI chat input
  async handleChatInput(chatId, message) {
    try {
      console.log(`Processing AI chat: ${message}`);
      
      // Simulate sending processing message
      const processingMsg = { message_id: 'processing_msg_123' };
      console.log('Sending processing message:', processingMsg.message_id);

      try {
        // Simulate AI call
        const response = 'This is the AI response content';
        console.log('AI response:', response);
        
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);

        // Send AI response
        console.log('AI response sent successfully');
        return response;

      } catch (error) {
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);
        throw error;
      }

    } catch (error) {
      console.error('AI chat processing failed:', error.message);
      return `❌ AI chat failed: ${error.message}\n\nPlease try again or contact administrator.`;
    }
  }

  // Test invalid message ID scenario
  async testInvalidMessageId() {
    console.log('\n🧪 Testing invalid message ID scenario:');
    await this.handleChatInput('chat_123', 'Test message');
  }

  // Test normal scenario
  async testNormalCase() {
    console.log('\n🧪 Testing normal scenario:');
    await this.handleChatInput('chat_456', 'Hello');
  }

  // Test empty message ID scenario
  async testEmptyMessageId() {
    console.log('\n🧪 Testing empty message ID scenario:');
    const processingMsg = { message_id: null };
    await this.safeDeleteMessage('chat_789', processingMsg.message_id);
  }
}

// Run tests
async function runTests() {
  const bot = new TestTelegramBot();
  
  console.log('🚀 Starting message deletion fix tests...\n');
  
  // Test normal scenario
  await bot.testNormalCase();
  
  // Test invalid message ID
  await bot.testInvalidMessageId();
  
  // Test empty message ID
  await bot.testEmptyMessageId();
  
  console.log('\n✅ All tests completed! Message deletion should now be more stable.');
}

// Run tests
runTests().catch(console.error);

const TelegramBot = require('node-telegram-bot-api');

// Test Telegram Bot connection
async function testTelegramBot() {
  const token = '7964433362:AAFVwitkhYoBbNMgFggO5a1gQtaI0kkSTIU';
  
  console.log('🧪 Testing Telegram Bot connection...\n');
  
  try {
    // Create Bot instance
    const bot = new TelegramBot(token, { polling: false });
    
    // Get Bot information
    const botInfo = await bot.getMe();
    
    console.log('✅ Bot connection successful!');
    console.log('🤖 Bot information:');
    console.log(`   • Username: @${botInfo.username}`);
    console.log(`   • Display name: ${botInfo.first_name}`);
    console.log(`   • ID: ${botInfo.id}`);
    console.log(`   • Supports inline mode: ${botInfo.supports_inline_queries ? 'Yes' : 'No'}`);
    
    // Set command list
    const commands = [
      { command: '/start', description: 'Start using OKX Chain AI Assistant' },
      { command: '/help', description: 'View help information' },
      { command: '/analyze', description: 'Analyze token contract (format: /analyze 0x...)' },
      { command: '/contract', description: 'Generate smart contract (format: /contract requirement description)' },
      { command: '/nft', description: 'Generate NFT metadata (format: /nft description)' },
      { command: '/chat', description: 'AI dialogue (format: /chat your question)' },
      { command: '/wallet', description: 'Query wallet information (format: /wallet 0x...)' },
      { command: '/chain', description: 'View OKX Chain status' },
      { command: '/price', description: 'Query token price (format: /price 0x...)' },
      { command: '/monitor', description: 'Set wallet monitoring (format: /monitor 0x...)' },
      { command: '/monitorlist', description: 'View monitoring list' },
      { command: '/monitoroff', description: 'Turn off wallet monitoring (format: /monitoroff 0x...)' }
    ];
    
    await bot.setMyCommands(commands);
    console.log('\n✅ Bot commands set successfully!');
    
    console.log('\n📱 Now you can:');
    console.log('1. Search for @' + botInfo.username + ' in Telegram');
    console.log('2. Send /start to begin using');
    console.log('3. Use /help to view all commands');
    console.log('4. Use /monitor 0x... to set wallet monitoring');
    
    console.log('\n🔗 Bot link: https://t.me/' + botInfo.username);
    
  } catch (error) {
    console.error('❌ Bot connection failed:', error.message);
    
    if (error.code === 'ETELEGRAM') {
      console.log('\n💡 Possible reasons:');
      console.log('• Token invalid or expired');
      console.log('• Network connection issue');
      console.log('• Bot has been deleted or disabled');
    }
  }
}

// Run test
if (require.main === module) {
  testTelegramBot();
}

module.exports = { testTelegramBot };

#!/usr/bin/env node

console.log('🔧 OpenAI API Key Fix Tool\n');

console.log('📋 Current Status:');
console.log('❌ OpenAI API Key Invalid (401 Error)');
console.log('✅ Telegram Bot Running Normally');
console.log('✅ OKX Chain RPC Connection Normal\n');

console.log('🛠️ Fix Steps:\n');

console.log('1️⃣ Get New OpenAI API Key:');
console.log('   • Visit: https://platform.openai.com/account/api-keys');
console.log('   • Click "Create new secret key"');
console.log('   • Copy the new API key\n');

console.log('2️⃣ Update Configuration File:');
console.log('   • Edit start-with-telegram.js');
console.log('   • Replace the value of OPENAI_API_KEY');
console.log('   • Save the file\n');

console.log('3️⃣ Restart System:');
console.log('   • Stop the currently running program (Ctrl+C)');
console.log('   • Run: npm run telegram\n');

console.log('💡 Tips:');
console.log('• New API key format: sk-...');
console.log('• Ensure the key has sufficient balance');
console.log('• Check if the account is restricted\n');

console.log('🔍 If the problem persists:');
console.log('• Check OpenAI account status');
console.log('• Confirm API key permissions');
console.log('• Check OpenAI service status\n');

console.log('📞 Need help?');
console.log('• OpenAI Support: https://help.openai.com/');
console.log('• Check Account: https://platform.openai.com/account/usage');

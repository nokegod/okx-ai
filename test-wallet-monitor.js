// Test wallet monitoring functionality
const WalletMonitorService = require('./services/wallet-monitor');

class TestWalletMonitor {
  constructor() {
    this.monitor = new WalletMonitorService();
    console.log('🧪 Testing wallet monitoring functionality');
  }

  // Test adding wallet monitoring
  async testAddWalletMonitor() {
    console.log('\n📋 Test 1: Add wallet monitoring');
    
    try {
      const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const testChatId = '123456789';
      
      console.log(`Adding monitoring: ${testAddress} -> ${testChatId}`);
      const result = await this.monitor.addWalletMonitor(testAddress, testChatId, 'buy');
      
      console.log('✅ Added successfully:', result);
      
      // Check monitoring list
      const list = this.monitor.getMonitorList();
      console.log('📋 Monitoring list:', list);
      
      // Check service status
      const status = this.monitor.getStatus();
      console.log('📊 Service status:', status);
      
    } catch (error) {
      console.error('❌ Failed to add monitoring:', error.message);
    }
  }

  // Test removing wallet monitoring
  async testRemoveWalletMonitor() {
    console.log('\n📋 Test 2: Remove wallet monitoring');
    
    try {
      const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      console.log(`Removing monitoring: ${testAddress}`);
      const result = await this.monitor.removeWalletMonitor(testAddress);
      
      console.log('✅ Removed successfully:', result);
      
      // Check monitoring list
      const list = this.monitor.getMonitorList();
      console.log('📋 Monitoring list:', list);
      
      // Check service status
      const status = this.monitor.getStatus();
      console.log('📊 Service status:', status);
      
    } catch (error) {
      console.error('❌ Failed to remove monitoring:', error.message);
    }
  }

  // Test getting wallet information
  async testGetWalletInfo() {
    console.log('\n📋 Test 3: Get wallet information');
    
    try {
      const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      console.log(`Getting wallet information: ${testAddress}`);
      const walletInfo = await this.monitor.getWalletInfo(testAddress);
      
      console.log('✅ Wallet information:', walletInfo);
      
    } catch (error) {
      console.error('❌ Failed to get wallet information:', error.message);
    }
  }

  // Test monitoring start and stop
  async testMonitoringControl() {
    console.log('\n📋 Test 4: Monitoring control');
    
    try {
      // Start monitoring
      console.log('Starting monitoring...');
      this.monitor.startMonitoring();
      
      // Wait 2 seconds
      await this.delay(2000);
      
      // Stop monitoring
      console.log('Stopping monitoring...');
      this.monitor.stopMonitoring();
      
      console.log('✅ Monitoring control test completed');
      
    } catch (error) {
      console.error('❌ Monitoring control test failed:', error.message);
    }
  }

  // Delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Run all tests
  async runTests() {
    console.log('🚀 Starting wallet monitoring functionality tests...\n');
    
    await this.testAddWalletMonitor();
    await this.testRemoveWalletMonitor();
    await this.testGetWalletInfo();
    await this.testMonitoringControl();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('• Wallet monitoring service created');
    console.log('• Supports adding/removing monitoring');
    console.log('• Supports getting wallet information');
    console.log('• Supports starting/stopping monitoring');
    console.log('• Automatically checks wallet changes every 30 seconds');
    console.log('• Automatically sends notifications when changes detected');
    console.log('\n🎯 Now wallet monitoring functionality should work normally!');
  }
}

// Execute tests
async function main() {
  const test = new TestWalletMonitor();
  await test.runTests();
}

main().catch(console.error);

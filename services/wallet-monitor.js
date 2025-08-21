const { ethers } = require('ethers');
const OKXRPCService = require('./okx-rpc');

class WalletMonitorService {
  constructor(telegramBot = null) {
    this.okxRPC = new OKXRPCService();
    this.telegramBot = telegramBot; // Telegram Bot instance
    this.monitoredWallets = new Map(); // Store monitored wallet information
    this.provider = null;
    this.isMonitoring = false;
    this.monitoringInterval = null;
    
    // Initialize Ethereum provider
    this.initProvider();
  }

  // Initialize Ethereum provider
  async initProvider() {
    try {
      // Use OKX Chain RPC endpoint
      const rpcUrl = process.env.OKX_RPC_URL || 'https://www.okx.com/';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      console.log('✅ Wallet monitoring service initialized successfully');
    } catch (error) {
      console.error('❌ Wallet monitoring service initialization failed:', error.message);
    }
  }

  // Add wallet monitoring
  async addWalletMonitor(walletAddress, telegramChatId, notificationType = 'buy') {
    try {
      // Validate address format
      if (!this.okxRPC.isValidAddress(walletAddress)) {
        throw new Error('Invalid wallet address format');
      }

      // Get current wallet status
      const walletInfo = await this.getWalletInfo(walletAddress);
      
      // Store monitoring information
      this.monitoredWallets.set(walletAddress, {
        telegramChatId,
        notificationType,
        lastBalance: walletInfo.balance,
        lastTokenCount: walletInfo.tokenCount,
        addedAt: Date.now(),
        lastChecked: Date.now()
      });

      console.log(`✅ Wallet monitoring added: ${walletAddress} -> ${telegramChatId}`);

      // If monitoring hasn't started yet, start monitoring
      if (!this.isMonitoring) {
        this.startMonitoring();
      }

      return {
        success: true,
        message: 'Wallet monitoring set successfully',
        walletInfo
      };

    } catch (error) {
      console.error('❌ Failed to add wallet monitoring:', error.message);
      throw error;
    }
  }

  // Remove wallet monitoring
  async removeWalletMonitor(walletAddress) {
    try {
      if (this.monitoredWallets.has(walletAddress)) {
        this.monitoredWallets.delete(walletAddress);
        console.log(`✅ Wallet monitoring removed: ${walletAddress}`);
        
        // If no wallets are monitored, stop monitoring
        if (this.monitoredWallets.size === 0) {
          this.stopMonitoring();
        }
        
        return { success: true, message: 'Wallet monitoring removed' };
      } else {
        throw new Error('This wallet is not in the monitoring list');
      }
    } catch (error) {
      console.error('❌ Failed to remove wallet monitoring:', error.message);
      throw error;
    }
  }

  // Get monitoring list
  getMonitorList() {
    const list = [];
    for (const [address, info] of this.monitoredWallets.entries()) {
      list.push({
        address,
        telegramChatId: info.telegramChatId,
        notificationType: info.notificationType,
        addedAt: info.addedAt,
        lastChecked: info.lastChecked
      });
    }
    return list;
  }

  // Get wallet information
  async getWalletInfo(walletAddress) {
    try {
      const balance = await this.okxRPC.getWalletBalance(walletAddress);
      const contractInfo = await this.okxRPC.getContractCode(walletAddress);
      
      // Get token balance (simplified here, should get all tokens in practice)
      const tokenCount = contractInfo.hasCode ? 1 : 0; // Simplified: if has contract code, count as having tokens
      
      return {
        balance: balance.ethBalance,
        tokenCount,
        isContract: contractInfo.hasCode,
        chainId: balance.chainId
      };
    } catch (error) {
      console.error('Failed to get wallet information:', error.message);
      return {
        balance: '0',
        tokenCount: 0,
        isContract: false,
        chainId: '196'
      };
    }
  }

  // Start monitoring
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Starting wallet monitoring...');

    // Check wallet status every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.checkWallets();
    }, 30000); // 30 seconds
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Wallet monitoring stopped');
  }

  // Check all monitored wallets
  async checkWallets() {
    if (this.monitoredWallets.size === 0) {
      return;
    }

    console.log(`🔍 Checking ${this.monitoredWallets.size} monitored wallets...`);

    for (const [address, info] of this.monitoredWallets.entries()) {
      try {
        await this.checkWallet(address, info);
        // Update last check time
        info.lastChecked = Date.now();
      } catch (error) {
        console.error(`Failed to check wallet ${address}:`, error.message);
      }
    }
  }

  // Check single wallet
  async checkWallet(address, info) {
    try {
      const currentInfo = await this.getWalletInfo(address);
      const previousInfo = {
        balance: info.lastBalance,
        tokenCount: info.lastTokenCount
      };

      // Check for changes
      const hasChanges = this.detectChanges(currentInfo, previousInfo);

      if (hasChanges) {
        // Send notification
        await this.sendNotification(address, info, currentInfo, previousInfo);
        
        // Update status
        info.lastBalance = currentInfo.balance;
        info.lastTokenCount = currentInfo.tokenCount;
      }

    } catch (error) {
      console.error(`Error checking wallet ${address}:`, error.message);
    }
  }

  // Detect changes
  detectChanges(current, previous) {
    // Check balance changes
    const balanceChanged = parseFloat(current.balance) !== parseFloat(previous.balance);
    
    // Check token count changes
    const tokenCountChanged = current.tokenCount !== previous.tokenCount;
    
    return balanceChanged || tokenCountChanged;
  }

  // Send notification
  async sendNotification(address, info, current, previous) {
    try {
      const message = this.formatNotificationMessage(address, info, current, previous);
      
      if (this.telegramBot) {
        // Use Telegram Bot to send notification
        await this.telegramBot.sendMessage(info.telegramChatId, message, { parse_mode: 'Markdown' });
        console.log(`✅ Wallet monitoring notification sent to ${info.telegramChatId}`);
      } else {
        // If no Telegram Bot, print to console
        console.log(`📢 Wallet monitoring notification (${address}):`);
        console.log(message);
      }
      
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }
  }

  // Format notification message
  formatNotificationMessage(address, info, current, previous) {
    const changes = [];
    
    // Check balance changes
    if (parseFloat(current.balance) !== parseFloat(previous.balance)) {
      const balanceDiff = parseFloat(current.balance) - parseFloat(previous.balance);
      const changeType = balanceDiff > 0 ? 'increased' : 'decreased';
      changes.push(`💰 OKC balance ${changeType}: ${Math.abs(balanceDiff).toFixed(6)} OKC`);
    }
    
    // Check token count changes
    if (current.tokenCount !== previous.tokenCount) {
      const tokenDiff = current.tokenCount - previous.tokenCount;
      const changeType = tokenDiff > 0 ? 'added' : 'decreased';
      changes.push(`🪙 Token count ${changeType}: ${Math.abs(tokenDiff)} tokens`);
    }
    
    return `🔔 **Wallet Monitoring Notification**

📍 **Monitored Address**: \`${address}\`
⏰ **Detection Time**: ${new Date().toLocaleString('en-US')}

📊 **Change Details**:
${changes.join('\n')}

💡 **Current Status**:
• OKC Balance: ${current.balance} OKC
• Token Count: ${current.tokenCount} tokens
• Is Contract: ${current.isContract ? 'Yes' : 'No'}

🔍 **View Details**: Use /wallet ${address} command`;
  }

  // Get service status
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      monitoredWalletsCount: this.monitoredWallets.size,
      providerConnected: !!this.provider,
      lastCheck: this.monitoredWallets.size > 0 ? 
        Math.max(...Array.from(this.monitoredWallets.values()).map(w => w.lastChecked)) : null
    };
  }
}

module.exports = WalletMonitorService;

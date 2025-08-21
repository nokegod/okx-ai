# 🔔 Wallet Monitoring Feature Usage Guide

## 📋 Feature Overview

The wallet monitoring feature can monitor buy transactions of specified wallet addresses in real-time. When a wallet buys new tokens, it automatically pushes notifications to Telegram and records the bought token contract addresses (CA).

## 🚀 Quick Start

### 1. Set Up Telegram Bot

1. Create a new Bot at [@BotFather](https://t.me/botfather)
2. Get Bot Token
3. Configure in `.env` file:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 2. Start System

```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Or deploy to Firebase
npm run deploy
```

## 📱 Telegram Bot Commands

### Basic Commands
- `/start` - Start using
- `/help` - View help
- `/analyze 0x...` - Analyze token contract
- `/wallet 0x...` - Query wallet information

### Wallet Monitoring Commands
- `/monitor 0x...` - Set wallet monitoring
- `/monitorlist` - View monitoring list
- `/monitoroff 0x...` - Turn off wallet monitoring

## 🔍 Usage Examples

### Set Wallet Monitoring
```
/monitor 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

Bot will reply:
```
✅ Wallet monitoring set successfully!

📍 Monitoring address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
🔔 Notification type: Buy transactions
⏰ Set time: 2024/1/1 12:00:00

Now monitoring buy transactions for this wallet!
```

### View Monitoring List
```
/monitorlist
```

### Turn Off Monitoring
```
/monitoroff 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

## 🌐 API Interfaces

### 1. Set Wallet Monitoring
```http
POST /api/wallet/monitor/setup
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "telegramChatId": "123456789",
  "notificationType": "buy"
}
```

### 2. Query Wallet Monitoring
```http
POST /api/wallet/monitor
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "action": "buy",
  "limit": 50
}
```

### 3. Get Monitoring History
```http
GET /api/wallet/monitor/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6?limit=20&offset=0
```

## 🔧 Technical Implementation

### Monitoring Principle
1. **Event Listening**: Listen to Transfer events of wallet addresses
2. **Buy Recognition**: Identify tokens transferred from DEX or contracts
3. **Real-time Push**: Send notifications through Telegram Bot
4. **Data Storage**: Save to Firebase Firestore

### Data Flow
```
Wallet Transaction → On-chain Event → Buy Recognition → Notification Push → Data Storage
```

## 📊 Monitoring Data

### Buy Transaction Information
- **Token Contract Address** (CA)
- **Buy Amount**
- **Transaction Hash**
- **Block Height**
- **Timestamp**

### Storage Location
- **Firestore**: `wallet_monitors` collection
- **Realtime Database**: Monitoring status and configuration

## ⚠️ Important Notes

1. **Address Format**: Must be valid Ethereum address format
2. **Network Limitations**: Currently supports OKX Chain (XLayer)
3. **API Limitations**: Avoid frequent queries, recommend reasonable monitoring intervals
4. **Privacy Protection**: Monitoring data is only used for notifications, won't leak user privacy

## 🧪 Testing

Run test script:
```bash
node test-wallet-monitor.js
```

## 🆘 Common Questions

### Q: Monitoring not working?
A: Check Bot Token configuration and network connection

### Q: How to modify notification types?
A: Currently supports buy transaction monitoring, will add sell, transfer, etc. later

### Q: Can I monitor multiple wallets?
A: Yes, each wallet can be monitored independently

### Q: Will monitoring data expire?
A: Monitoring data is permanently saved, can query historical records via API

## 🔮 Future Features

- [ ] Sell transaction monitoring
- [ ] Price change monitoring
- [ ] Whale movement analysis
- [ ] Multi-chain support
- [ ] Custom notification rules

## 📞 Technical Support

If you have questions, please contact through:
- Telegram: [Your Bot Username]
- GitHub: [Project Address]
- Email: [Your Email]

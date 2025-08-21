# 🚀 Quick Start Guide - OKX Chain AI Assistant + Telegram Bot

## ⚡ 5-Minute Quick Start

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Test Telegram Bot Connection
```bash
npm run telegram:test
# Or
node test-telegram-bot.js
```

### 3️⃣ Start Complete System
```bash
npm run telegram
# Or
node start-with-telegram.js
```

## 📱 Using Telegram Bot

### Step 1: Find Your Bot
1. Run the test script to get your Bot username
2. Search for `@YourBotUsername` in Telegram
3. Click "Start" or send `/start`

### Step 2: Start Using
- `/start` - Start using
- `/help` - View all commands
- `/monitor 0x...` - Set wallet monitoring ⭐

### Step 3: Set Wallet Monitoring
```
/monitor 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

## 🔔 Wallet Monitoring Features

### Monitoring Commands
- `/monitor 0x...` - Set wallet monitoring
- `/monitorlist` - View monitoring list
- `/monitoroff 0x...` - Turn off monitoring

### Monitoring Effects
✅ Automatically monitor wallet buy transactions  
✅ Real-time push of bought token CAs  
✅ Save monitoring history records  
✅ Support monitoring multiple wallets simultaneously  

## 🧠 Smart Feature Easter Eggs

### 🎯 Incomplete Command Smart Hints
- Input `/anal` → Bot prompts: Please provide token contract address
- Input `/mon` → Bot prompts: Please provide wallet address
- Input `/wal` → Bot prompts: Please provide wallet address

### 🌟 Chinese Keyword Smart Recognition
- Input "query" → Bot guides to query function
- Input "analyze" → Bot guides to analysis function  
- Input "monitor" → Bot guides to monitoring function
- Input "contract" → Bot guides to contract function

### 💡 Smart Error Handling
- When inputting invalid commands, Bot provides friendly prompts
- Provides correct command format examples
- Intelligently suggests related functions

### 🚀 User Experience Improvements
✅ No need to re-enter complete commands  
✅ Intelligently guides users to complete operations  
✅ Supports Chinese natural language interaction  
✅ Error prompts are more friendly  

## 🧪 Testing Features

### Test Bot Connection
```bash
node test-telegram-bot.js
```

### Test Smart Features
```bash
npm run smart:test
# Or
node test-smart-features.js
```

### Test Wallet Monitoring API
```bash
node test-wallet-monitor.js
```

### Test Complete System
```bash
npm run telegram
```

## 🌐 API Interfaces

### Local Development
- Main service: http://localhost:5001
- Health check: http://localhost:5001/health
- Wallet monitoring: http://localhost:5001/api/wallet/monitor

### Production Environment
- Main service: https://chat-294cc.cloudfunctions.net/okxChainAI

## 📚 Detailed Documentation

- `WALLET_MONITOR_GUIDE.md` - Detailed wallet monitoring guide
- `README.md` - Complete project description
- `FIREBASE_SETUP.md` - Firebase deployment guide

## 🆘 Common Questions

### Q: Bot not responding?
A: Check if Token is correct and network is normal

### Q: Monitoring not working?
A: Ensure wallet address format is correct (42-character address starting with 0x)

### Q: How to deploy to production?
A: Use `npm run deploy` to deploy to Firebase

## 🎯 Next Steps

1. ✅ Test Bot connection
2. ✅ Start monitoring system
3. ✅ Set wallet monitoring
4. 🔄 Wait for buy notifications
5. 📊 Analyze monitoring data

---

**Start monitoring wallets now, don't miss any buying opportunities!** 🚀💰

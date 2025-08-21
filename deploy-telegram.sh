#!/bin/bash

echo "🚀 Deploying OKX Chain AI Assistant + Telegram Bot..."

# Check environment variables
if [ ! -f .env ]; then
    echo "❌ .env file not found, please configure environment variables first"
    echo "📝 Copy env.example to .env and configure:"
    echo "cp env.example .env"
    exit 1
fi

# Check Telegram Bot Token
if grep -q "your_telegram_bot_token_here" .env; then
    echo "⚠️  Warning: Please configure real TELEGRAM_BOT_TOKEN in .env file"
    echo "📱 Get Token: https://t.me/botfather"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not installed, please install first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Select project
echo "🏗️  Selecting Firebase project..."
firebase use chat-294cc

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📱 Telegram Bot usage:"
echo "1. Configure TELEGRAM_BOT_TOKEN in .env"
echo "2. Restart Firebase Functions"
echo "3. Search for your Bot in Telegram"
echo "4. Send /start to begin using"
echo ""
echo "🔔 Wallet monitoring commands:"
echo "/monitor 0x... - Set wallet monitoring"
echo "/monitorlist - View monitoring list"
echo "/monitoroff 0x... - Turn off monitoring"
echo ""
echo "🌐 API address: https://chat-294cc.cloudfunctions.net/okxChainAI"
echo "📚 Detailed documentation: Check WALLET_MONITOR_GUIDE.md"

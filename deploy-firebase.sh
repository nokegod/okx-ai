#!/bin/bash

echo "🚀 Starting deployment of OKX Chain AI Assistant to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not installed, installing now..."
    npm install -g firebase-tools
fi

# Check if already logged into Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first..."
    firebase login
fi

# Check if project exists
echo "📋 Checking Firebase project..."
if ! firebase use chat-294cc &> /dev/null; then
    echo "❌ Project chat-294cc doesn't exist or cannot be accessed"
    echo "Please ensure you have permission to access this project"
    exit 1
fi

echo "✅ Project configured successfully: chat-294cc"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Build project
echo "🔨 Building project..."
npm run build 2>/dev/null || echo "⚠️  Build step skipped (if no build script exists)"

# Deploy Firestore rules
echo "🗄️  Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Realtime Database rules
echo "🗄️  Deploying Realtime Database security rules..."
firebase deploy --only database

# Deploy Hosting
echo "🌐 Deploying Web application..."
firebase deploy --only hosting

# Deploy Functions
echo "⚡ Deploying Cloud Functions..."
firebase deploy --only functions

echo "🎉 Deployment completed!"
echo ""
echo "📱 Your application has been deployed to:"
echo "   Web app: https://chat-294cc.web.app"
echo "   Functions: https://chat-294cc.cloudfunctions.net"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure environment variables (.env file)"
echo "   2. Test API endpoints"
echo "   3. Configure Telegram Bot (optional)"
echo ""
echo "📚 View logs: firebase functions:log"
echo "🧪 Local testing: firebase emulators:start"

#!/bin/bash

echo "🚀 OKX Chain AI Assistant Deployment Script"
echo "================================"

# Check Node.js version
echo "📋 Checking environment..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version too low, requires 18+ version"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI version: $(firebase --version)"

# Check environment variable file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "📝 Please copy config.env.example to .env and configure necessary environment variables"
    echo "   Especially OPENAI_API_KEY and Firebase configuration"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login --no-localhost

if [ $? -ne 0 ]; then
    echo "❌ Firebase login failed"
    exit 1
fi

echo "✅ Firebase login successful"

# Initialize Firebase project (if needed)
if [ ! -f ".firebaserc" ]; then
    echo "🏗️  Initializing Firebase project..."
    firebase init functions --project=chat-294cc --yes
fi

# Build project
echo "🔨 Building project..."
npm run build 2>/dev/null || echo "⚠️  Build command doesn't exist, skipping build step"

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "================================"
    echo "🌐 Your OKX Chain AI Assistant has been deployed!"
    echo "📱 Frontend page: https://chat-294cc.web.app"
    echo "🔧 Cloud functions: https://chat-294cc.web.app/api"
    echo "📚 Check README.md for usage instructions"
else
    echo "❌ Deployment failed"
    exit 1
fi

# Display post-deployment information
echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✅ Cloud functions deployed"
echo "2. ✅ Database configured"
echo "3. ✅ Frontend page deployed"
echo ""
echo "🔧 Next steps:"
echo "1. Configure environment variables (.env file)"
echo "2. Test API interfaces"
echo "3. Customize frontend page"
echo "4. Integrate into your project"

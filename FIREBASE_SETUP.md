# 🔥 Firebase Setup Guide

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **Firebase project** created (chat-294cc)
3. **Firebase CLI** installed

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

**Important**: Your OpenAI API key is already configured!

### 3. Login to Firebase
```bash
firebase login
```

### 4. Select Project
```bash
firebase use chat-294cc
```

### 5. Deploy to Firebase
```bash
# Use deployment script
chmod +x deploy-firebase.sh
./deploy-firebase.sh

# Or deploy manually
firebase deploy
```

## 🏗️ Project Structure

```
project-root/
├── functions/           # Cloud Functions
│   ├── index.js        # Main function entry
│   ├── services/       # Service layer
│   └── package.json    # Function dependencies
├── public/             # Web application
│   ├── index.html      # Main page
│   └── firebase-config.js # Firebase configuration
├── firebase.json       # Firebase configuration
├── .firebaserc         # Project configuration
├── firestore.rules     # Firestore security rules
├── database.rules.json # Realtime Database rules
└── deploy-firebase.sh  # Deployment script
```

## 🔧 Configuration

### Firebase Services
- **Cloud Functions**: Backend API services
- **Firestore**: Document database (analysis history, contracts, etc.)
- **Realtime Database**: Real-time data (chain status, user data)
- **Hosting**: Web application hosting

### Security Rules
- **Development stage**: Allow all read/write operations
- **Production environment**: Need to configure stricter rules

## 🧪 Local Testing

### Start Emulator
```bash
firebase emulators:start
```

### Test API
```bash
npm test
```

## 📱 Access Addresses

After deployment, your application will be available at:

- **Web Application**: https://chat-294cc.web.app
- **API Endpoints**: https://chat-294cc.cloudfunctions.net/okxChainAI
- **Firebase Console**: https://console.firebase.google.com/project/chat-294cc

## 🔍 Common Questions

### Q: What if deployment fails?
A: Check Firebase CLI version and project permissions

### Q: How to view logs?
A: `firebase functions:log`

### Q: How to rollback deployment?
A: `firebase functions:rollback`

## 📚 Next Steps

1. **Test all API endpoints**
2. **Configure Telegram Bot** (optional)
3. **Customize frontend interface**
4. **Add more features**

## 🆘 Need Help?

- Firebase Documentation: https://firebase.google.com/docs
- Project GitHub: [Your Repository Address]
- Issue Feedback: [Your Contact Information]

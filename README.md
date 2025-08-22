# OKX Chain Exclusive AI Assistant 🚀

An OKX Chain (OKC) exclusive AI assistant based on Firebase Cloud Functions and OpenAI, specifically designed to provide intelligent services for blockchain developers and users.

X:https://x.com/okoxaibot?s=21 
github：https://github.com/nokegod/okx-ai.git
tg：@https://t.me/okxxAIbot 

## ✨ Core Features

### 1. 🎯 Token Narrative Generation AI
- **Automatic CA Analysis**: Users only need to input a token contract address, and AI automatically retrieves on-chain data and generates professional narratives
- **On-chain Data Integration**: Combines real-time on-chain data with AI analysis to provide reliable token analysis
- **Visualization Display**: Clear data presentation and label classification

### 2. 🔧 Smart Contract Development AI
- **Code Generation**: Input functional requirements, AI automatically generates Solidity contract code
- **Deployment Assistant**: Generates one-click deployment scripts and RPC configurations
- **Security Audit**: Provides security considerations and Gas optimization suggestions

### 3. 🎨 NFT Creation AI
- **Metadata Generation**: Automatically generates NFT metadata and image descriptions based on descriptions
- **Minting Scripts**: Automatically generates scripts for deployment to OKX Chain
- **Interactive Elements**: Supports user voting to determine NFT features

### 4. 📊 On-chain Data Analysis
- **Real-time Monitoring**: Monitors OKX Chain status, Gas fees, block information
- **Whale Movements**: Analyzes wallet activities, identifies potential trends
- **Risk Assessment**: Provides investment advice based on on-chain data

### 5. 💬 Intelligent Dialogue System
- **Professional Q&A**: Answers OKX Chain related technical questions
- **Development Guidance**: Provides development tutorials and best practices
- **Community Interaction**: Supports Telegram/Discord integration

### 6. 🔔 Wallet Monitoring System
- **Real-time Monitoring**: Monitors buy transactions of specified wallets
- **CA Push**: Automatically pushes bought token contract addresses
- **Telegram Notifications**: Sends monitoring results to Telegram in real-time
- **Historical Records**: Saves all monitoring data and transaction records

## 🏗️ Technical Architecture

### Backend Technology Stack
- **Firebase Functions**: Cloud function services
- **Firebase Firestore**: Document database
- **Firebase Realtime Database**: Real-time data
- **OpenAI GPT-4**: AI dialogue and analysis
- **Ethers.js**: Blockchain interaction
- **Express.js**: Web framework

### Frontend Technology Stack
- **HTML5 + CSS3**: Responsive design
- **Bootstrap 5**: UI component library
- **Vanilla JavaScript**: Native JS, no framework dependencies
- **Chart.js**: Data visualization

### Blockchain Integration
- **OKX Chain (OKC)**: Main chain support, Chain ID: 66
- **EVM Compatible**: Supports standard Ethereum tools
- **RPC Interface**: Real-time on-chain data retrieval

## 🚀 Quick Start

### Requirements
- Node.js 18+
- Firebase CLI
- OpenAI API Key

### Installation Steps

1. **Clone Project**
```bash
git clone <repository-url>
cd okx-chain-ai
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
```bash
cp config.env.example .env
# Edit .env file and enter your API keys
```

4. **Configure Firebase**
```bash
firebase login
firebase init functions
```

5. **Deploy Cloud Functions**
```bash
npm run deploy
```

6. **Start Local Development**
```bash
npm run dev
```

7. **Configure Telegram Bot (Optional)**
```bash
# Configure Bot Token in .env
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Restart service
npm run dev
```

8. **Use Wallet Monitoring**
- Search for your Bot in Telegram
- Send `/monitor 0x...` to set wallet monitoring
- Automatically receive buy notifications and CA information

## 📡 API Interfaces

### Core Interfaces

#### 1. Token Analysis
```http
POST /api/token/analyze
Content-Type: application/json

{
  "contractAddress": "0x1234..."
}
```

#### 2. Smart Contract Generation
```http
POST /api/contract/generate
Content-Type: application/json

{
  "requirements": "Generate a Meme token contract",
  "contractType": "token"
}
```

#### 3. NFT Metadata Generation
```http
POST /api/nft/generate
Content-Type: application/json

{
  "description": "A cute cat NFT",
  "attributes": "Rarity, color, background"
}
```

#### 4. AI Dialogue
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What is the RPC address of OKX Chain?",
  "sessionId": "user123"
}
```

#### 5. On-chain Data Analysis
```http
POST /api/chain/analyze
Content-Type: application/json

{
  "contractAddress": "0x1234..."
}
```

### Query Interfaces

#### Wallet Information
```http
GET /api/wallet/{address}
```

#### Token Balance
```http
GET /api/token/{contractAddress}/balance/{walletAddress}
```

#### Analysis History
```http
GET /api/analyses?limit=20&offset=0
```

#### Real-time On-chain Data
```http
GET /api/realtime/chain-stats
```

## 🔧 Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# OKX Chain Configuration
OKX_RPC_URL=https://www.okx.com/priapi/v5/public/blockchain/okc
OKX_CHAIN_ID=66
OKX_EXPLORER=https://www.oklink.com/okc

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Firebase Configuration
Ensure your Firebase project has enabled the following services:
- Cloud Functions
- Firestore Database
- Realtime Database
- Hosting (Optional)

## 📱 Usage Examples

### 1. Token Analysis
User inputs token contract address, AI automatically:
- Retrieves token basic information
- Analyzes on-chain data
- Generates professional narratives
- Provides investment advice

### 2. Smart Contract Development
Developer describes requirements, AI generates:
- Complete Solidity contracts
- Deployment scripts
- Test files
- Security recommendations

### 3. NFT Creation
User describes NFT, AI generates:
- Metadata JSON
- Image descriptions
- Minting scripts
- Deployment guides

## 🔒 Security Features

- **Input Validation**: Strict address format validation
- **Rate Limiting**: API call frequency control
- **Error Handling**: Comprehensive exception handling mechanisms
- **Data Isolation**: Secure user data isolation

## 📈 Performance Optimization

- **Caching Mechanism**: On-chain data caching
- **Asynchronous Processing**: Non-blocking API calls
- **Batch Operations**: Database batch writes
- **Real-time Updates**: Scheduled task data updates

## 🌟 Special Highlights

1. **OKX Chain Exclusive**: Deep integration with OKX Chain ecosystem
2. **AI-Driven**: GPT-4 provides intelligent analysis
3. **Real-time Data**: On-chain data updates in real-time
4. **Developer Friendly**: Complete API documentation and examples
5. **Cost Controllable**: Firebase free tier sufficient for prototype development
6. **Quick Deployment**: One-click deployment to cloud

## 🤝 Contribution Guidelines

Welcome to submit Issues and Pull Requests!

### Development Standards
- Use ES6+ syntax
- Follow ESLint rules
- Add appropriate comments
- Write unit tests

### Commit Standards
```
feat: Add new features
fix: Fix bugs
docs: Update documentation
style: Code format adjustments
refactor: Code refactoring
test: Add tests
chore: Build process or auxiliary tool changes
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🆘 Support and Feedback

- **Issue Feedback**: [GitHub Issues](https://github.com/your-repo/issues)
- **Feature Suggestions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Technical Support**: Please describe issues in detail when submitting Issues

## 🔮 Future Plans

- [ ] Telegram Bot integration
- [ ] Discord Bot integration
- [ ] Mobile APP
- [ ] More chain support
- [ ] Advanced data analysis
- [ ] Machine learning models

---

**Let AI become your OKX Chain development assistant!** 🚀✨


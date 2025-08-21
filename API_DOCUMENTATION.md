# 🔥 OKX Chain AI API Documentation

## 📋 Overview

The OKX Chain AI API provides intelligent analysis services for blockchain data, token evaluation, investment advice, and AI-powered insights. This API allows developers and businesses to integrate advanced AI capabilities into their applications.

## 🚀 Quick Start

### Base URL
```
https://chat-294cc.cloudfunctions.net/okxChainAI
```

### Authentication
All API requests require an API key. Include it in one of these ways:

**Option 1: X-API-Key header**
```http
X-API-Key: your_api_key_here
```

**Option 2: Authorization header**
```http
Authorization: Bearer your_api_key_here
```

## 🔑 API Key Management

### Generate API Key
```http
POST /api/keys/generate
```

**Request Body:**
```json
{
  "userId": "your_user_id",
  "plan": "BASIC",
  "description": "My application API key"
}
```

**Response:**
```json
{
  "success": true,
  "apiKey": "okx_abc123...",
  "plan": "BASIC",
  "limits": {
    "name": "Basic",
    "requests": 1000,
    "cost": 9.99
  },
  "message": "API key generated successfully"
}
```

### Get API Key Info
```http
GET /api/keys/{apiKey}
```

**Response:**
```json
{
  "userId": "your_user_id",
  "plan": "BASIC",
  "description": "My application API key",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastUsed": "2024-01-15T10:30:00.000Z",
  "totalUsage": 150,
  "currentUsage": {
    "allowed": true,
    "used": 150,
    "limit": 1000,
    "resetDate": "2024-02-01T00:00:00.000Z"
  },
  "limits": {
    "name": "Basic",
    "requests": 1000,
    "cost": 9.99
  }
}
```

### Get Available Plans
```http
GET /api/plans
```

**Response:**
```json
{
  "plans": {
    "FREE": {
      "name": "Free",
      "requests": 100,
      "cost": 0
    },
    "BASIC": {
      "name": "Basic",
      "requests": 1000,
      "cost": 9.99
    },
    "PRO": {
      "name": "Pro",
      "requests": 10000,
      "cost": 49.99
    },
    "ENTERPRISE": {
      "name": "Enterprise",
      "requests": -1,
      "cost": 199.99
    }
  },
  "message": "Available subscription plans"
}
```

### Get Usage Statistics
```http
GET /api/usage/{userId}?month=1&year=2024
```

**Response:**
```json
{
  "userId": "your_user_id",
  "period": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-02-01T00:00:00.000Z"
  },
  "usage": [
    {
      "endpoint": "/api/token/analyze",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "cost": 0.005
    }
  ],
  "totalCost": 0.005,
  "count": 1
}
```

## 🤖 AI Services

### 1. Token Analysis
Analyze any token contract address and get AI-generated insights.

```http
POST /api/token/analyze
```

**Request Body:**
```json
{
  "contractAddress": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "analysis_1705312200000",
  "contractAddress": "0x1234567890abcdef...",
  "tokenData": {
    "name": "Sample Token",
    "symbol": "SMPL",
    "decimals": 18,
    "totalSupply": "1000000000000000000000000"
  },
  "narrative": "This token shows strong fundamentals with...",
  "riskAssessment": "Medium risk",
  "recommendation": "Consider for portfolio diversification"
}
```

### 2. Chain Analysis
Get comprehensive analysis of OKX Chain trends and market data.

```http
POST /api/chain/analyze
```

**Request Body:**
```json
{
  "contractAddress": "0x1234567890abcdef...",
  "analysisType": "trend"
}
```

**Response:**
```json
{
  "success": true,
  "chainData": {
    "totalTransactions": 1500000,
    "activeWallets": 45000,
    "gasPrice": "0.00000001",
    "blockHeight": 12345678
  },
  "trends": {
    "transactionVolume": "increasing",
    "userActivity": "stable",
    "marketSentiment": "bullish"
  },
  "insights": "The chain is experiencing increased activity..."
}
```

### 3. Investment Advice
Get AI-powered investment recommendations based on your risk profile.

```http
POST /api/investment/advice
```

**Request Body:**
```json
{
  "contractAddress": "0x1234567890abcdef...",
  "riskProfile": "moderate",
  "investmentAmount": "1000",
  "timeHorizon": "1_year"
}
```

**Response:**
```json
{
  "success": true,
  "advice": {
    "recommendation": "BUY",
    "confidence": 0.85,
    "reasoning": "Strong fundamentals and positive market indicators...",
    "riskFactors": ["Market volatility", "Regulatory changes"],
    "expectedReturn": "15-25%",
    "timeHorizon": "6-12 months"
  }
}
```

### 4. AI Chat
Intelligent dialogue system for blockchain and crypto questions.

```http
POST /api/chat
```

**Request Body:**
```json
{
  "message": "What are the risks of investing in this token?",
  "context": "Token analysis context",
  "sessionId": "session_123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on my analysis, this token presents several risks...",
  "sessionId": "session_123",
  "suggestions": [
    "Check liquidity",
    "Verify contract security",
    "Review team background"
  ]
}
```

### 5. Translation Service
Multi-language support for content translation.

```http
POST /api/translate
```

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "targetLanguage": "chinese"
}
```

**Response:**
```json
{
  "success": true,
  "originalText": "Hello, how are you?",
  "translatedText": "你好，你好吗？",
  "targetLanguage": "chinese",
  "confidence": 0.95
}
```

### 6. Wallet Monitoring
Monitor wallet activities and get notifications for specific actions.

```http
POST /api/wallet/monitor
```

**Request Body:**
```json
{
  "walletAddress": "0x1234567890abcdef...",
  "action": "buy",
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "walletAddress": "0x1234567890abcdef...",
  "recentTransactions": [
    {
      "token": "0xabcdef123456...",
      "action": "buy",
      "amount": "1000",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalTransactions": 25
}
```

### 7. Wallet Monitor Setup
Configure wallet monitoring with Telegram notifications.

```http
POST /api/wallet/monitor/setup
```

**Request Body:**
```json
{
  "walletAddress": "0x1234567890abcdef...",
  "telegramChatId": "123456789",
  "notificationType": "buy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet monitoring configured successfully",
  "monitoringId": "monitor_1705312200000",
  "notifications": "Telegram notifications enabled for buy actions"
}
```

## 📊 Rate Limits & Pricing

### Plan Limits
- **Free**: 100 requests/month
- **Basic**: 1,000 requests/month ($9.99)
- **Pro**: 10,000 requests/month ($49.99)
- **Enterprise**: Unlimited requests ($199.99)

### API Costs (per request)
- **Chat**: $0.001
- **Token Analysis**: $0.005
- **Chain Analysis**: $0.003
- **Investment Advice**: $0.004
- **Wallet Monitor**: $0.002
- **Translation**: $0.001

### Plan Discounts
- **Basic**: 10% discount
- **Pro**: 30% discount
- **Enterprise**: 50% discount

## 🛡️ Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "API key required",
  "message": "Please provide your API key in the x-api-key header or Authorization: Bearer header"
}
```

**429 Too Many Requests**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded your BASIC plan limit of 1000 requests per month",
  "limit": 1000,
  "used": 1000,
  "resetDate": "2024-02-01T00:00:00.000Z"
}
```

**400 Bad Request**
```json
{
  "error": "Invalid contract address format"
}
```

## 📱 SDK Examples

### JavaScript/Node.js
```javascript
class OKXChainAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://chat-294cc.cloudfunctions.net/okxChainAI';
  }
  
  async request(endpoint, data = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  }
  
  async analyzeToken(contractAddress) {
    return this.request('/api/token/analyze', { contractAddress });
  }
  
  async chat(message) {
    return this.request('/api/chat', { message });
  }
  
  async getInvestmentAdvice(contractAddress, riskProfile = 'moderate') {
    return this.request('/api/investment/advice', { 
      contractAddress, 
      riskProfile 
    });
  }
}

// Usage
const ai = new OKXChainAI('your_api_key_here');

// Analyze a token
const analysis = await ai.analyzeToken('0x1234567890abcdef...');
console.log(analysis.narrative);

// Chat with AI
const response = await ai.chat('What is the best time to buy this token?');
console.log(response.response);
```

### Python
```python
import requests
import json

class OKXChainAI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://chat-294cc.cloudfunctions.net/okxChainAI'
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
    
    def request(self, endpoint, data=None):
        if data is None:
            data = {}
        
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            json=data
        )
        
        response.raise_for_status()
        return response.json()
    
    def analyze_token(self, contract_address):
        return self.request('/api/token/analyze', {
            'contractAddress': contract_address
        })
    
    def chat(self, message):
        return self.request('/api/chat', {'message': message})

# Usage
ai = OKXChainAI('your_api_key_here')

# Analyze a token
analysis = ai.analyze_token('0x1234567890abcdef...')
print(analysis['narrative'])
```

### cURL Examples
```bash
# Token Analysis
curl -X POST https://chat-294cc.cloudfunctions.net/okxChainAI/api/token/analyze \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"contractAddress": "0x1234567890abcdef..."}'

# AI Chat
curl -X POST https://chat-294cc.cloudfunctions.net/okxChainAI/api/chat \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the risks of this token?"}'
```

## 🔗 Webhook Integration

### Set up webhook for real-time notifications
```http
POST /api/webhook/setup
```

**Request Body:**
```json
{
  "webhookUrl": "https://your-app.com/webhook",
  "events": ["token_analysis", "wallet_activity"],
  "secret": "your_webhook_secret"
}
```

## 📈 Best Practices

1. **Store API keys securely** - Never expose them in client-side code
2. **Implement retry logic** - Handle rate limits gracefully
3. **Cache responses** - Store analysis results to reduce API calls
4. **Monitor usage** - Track your API consumption to optimize costs
5. **Handle errors gracefully** - Implement proper error handling for production use

## 🆘 Support & Contact

- **API Status**: Check `/health` endpoint
- **Documentation**: This document
- **Rate Limits**: Check your plan limits via `/api/keys/{apiKey}`
- **Usage Tracking**: Monitor via `/api/usage/{userId}`

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Token analysis
- Chain analysis
- Investment advice
- AI chat
- Translation service
- Wallet monitoring
- API key management
- Usage tracking
- Subscription plans

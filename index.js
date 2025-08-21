const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers'); // Import ethers.js

// Environment configuration
// IMPORTANT: Do NOT hardcode secrets here. Use environment variables or Firebase config.
// OPENAI_API_KEY, TELEGRAM_BOT_TOKEN, etc. should be provided via deployment environment.
process.env.OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
process.env.OKX_RPC_URL = process.env.OKX_RPC_URL || 'https://exchainrpc.okex.org';
process.env.OKX_CHAIN_ID = process.env.OKX_CHAIN_ID || '66';
process.env.OKX_EXPLORER = process.env.OKX_EXPLORER || 'https://www.oklink.com/okc';

// Import services
const OKXRPCService = require('./services/okx-rpc');
const OpenAIService = require('./services/openai-service');
const TelegramBotService = require('./services/telegram-bot');
const { db, rtdb } = require('./firebase-admin');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Authentication & Subscription System
const API_PLANS = {
  FREE: { name: 'Free', requests: 100, cost: 0 },
  BASIC: { name: 'Basic', requests: 1000, cost: 9.99 },
  PRO: { name: 'Pro', requests: 10000, cost: 49.99 },
  ENTERPRISE: { name: 'Enterprise', requests: -1, cost: 199.99 } // -1 means unlimited
};

// API Key validation middleware
const authenticateAPI = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required',
        message: 'Please provide your API key in the x-api-key header or Authorization: Bearer header'
      });
    }

    // Get API key from database
    const apiKeyDoc = await db.collection('api_keys').doc(apiKey).get();
    
    if (!apiKeyDoc.exists) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    const keyData = apiKeyDoc.data();
    
    // Check if key is active
    if (!keyData.active) {
      return res.status(401).json({ 
        error: 'API key inactive',
        message: 'This API key has been deactivated'
      });
    }

    // Check usage limits
    const usage = await checkUsageLimits(keyData.userId, keyData.plan);
    if (!usage.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `You have exceeded your ${keyData.plan} plan limit of ${API_PLANS[keyData.plan].requests} requests per month`,
        limit: API_PLANS[keyData.plan].requests,
        used: usage.used,
        resetDate: usage.resetDate
      });
    }

    // Add user info to request
    req.user = {
      userId: keyData.userId,
      plan: keyData.plan,
      apiKey: apiKey
    };

    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Usage tracking middleware
const trackAPIUsage = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Track successful API calls
    if (res.statusCode < 400 && req.user) {
      trackUsage(req.user.userId, req.user.plan, req.path, req.user.apiKey);
    }
    originalSend.call(this, data);
  };
  
  next();
};

// Check usage limits
const checkUsageLimits = async (userId, plan) => {
  const planLimit = API_PLANS[plan].requests;
  
  if (planLimit === -1) return { allowed: true, used: 0, resetDate: null }; // Enterprise unlimited
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const usageSnapshot = await db.collection('api_usage')
    .where('userId', '==', userId)
    .where('timestamp', '>=', startOfMonth)
    .get();
  
  const used = usageSnapshot.size;
  const allowed = used < planLimit;
  
  return {
    allowed,
    used,
    limit: planLimit,
    resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  };
};

// Track API usage
const trackUsage = async (userId, plan, endpoint, apiKey) => {
  try {
    await db.collection('api_usage').add({
      userId,
      plan,
      endpoint,
      apiKey: apiKey.substring(0, 8) + '...', // Only store partial key for security
      timestamp: new Date(),
      cost: calculateAPICost(endpoint, plan)
    });
  } catch (error) {
    console.error('Failed to track API usage:', error);
  }
};

// Calculate API cost based on endpoint and plan
const calculateAPICost = (endpoint, plan) => {
  const baseCosts = {
    '/api/chat': 0.001,
    '/api/token/analyze': 0.005,
    '/api/chain/analyze': 0.003,
    '/api/investment/advice': 0.004,
    '/api/wallet/:address': 0.002,
    '/api/translate': 0.001
  };
  
  const baseCost = baseCosts[endpoint] || 0.001;
  
  // Apply plan discounts
  const discounts = {
    FREE: 1.0,      // No discount
    BASIC: 0.9,     // 10% discount
    PRO: 0.7,       // 30% discount
    ENTERPRISE: 0.5 // 50% discount
  };
  
  return baseCost * (discounts[plan] || 1.0);
};

// Initialize services
const okxRPC = new OKXRPCService();
const openaiService = new OpenAIService();

// Initialize Telegram Bot (if token is configured)
let telegramBot = null;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token_here') {
  try {
    telegramBot = new TelegramBotService();
    telegramBot.start();
    console.log('🤖 Telegram Bot started successfully!');
  } catch (error) {
    console.error('❌ Telegram Bot startup failed:', error.message);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OKX Chain AI',
    timestamp: new Date().toISOString(),
    chainId: 66
  });
});

// API Management Endpoints
app.post('/api/keys/generate', async (req, res) => {
  try {
    const { userId, plan = 'FREE', description = '' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!API_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan specified' });
    }
    
    // Generate unique API key
    const apiKey = 'okx_' + require('crypto').randomBytes(32).toString('hex');
    
    // Save to database
    await db.collection('api_keys').doc(apiKey).set({
      userId,
      plan,
      description,
      active: true,
      createdAt: new Date(),
      lastUsed: null,
      totalUsage: 0
    });
    
    res.json({
      success: true,
      apiKey,
      plan,
      limits: API_PLANS[plan],
      message: 'API key generated successfully'
    });
    
  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

app.get('/api/keys/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    const keyDoc = await db.collection('api_keys').doc(apiKey).get();
    
    if (!keyDoc.exists) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    const keyData = keyDoc.data();
    const usage = await checkUsageLimits(keyData.userId, keyData.plan);
    
    res.json({
      userId: keyData.userId,
      plan: keyData.plan,
      description: keyData.description,
      active: keyData.active,
      createdAt: keyData.createdAt,
      lastUsed: keyData.lastUsed,
      totalUsage: keyData.totalUsage,
      currentUsage: usage,
      limits: API_PLANS[keyData.plan]
    });
    
  } catch (error) {
    console.error('API key info error:', error);
    res.status(500).json({ error: 'Failed to get API key info' });
  }
});

app.get('/api/plans', (req, res) => {
  res.json({
    plans: API_PLANS,
    message: 'Available subscription plans'
  });
});

app.get('/api/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;
    
    let startDate;
    if (month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    
    const usageSnapshot = await db.collection('api_usage')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<', endDate)
      .orderBy('timestamp', 'desc')
      .get();
    
    const usage = [];
    let totalCost = 0;
    
    usageSnapshot.forEach(doc => {
      const data = doc.data();
      usage.push({
        endpoint: data.endpoint,
        timestamp: data.timestamp,
        cost: data.cost
      });
      totalCost += data.cost;
    });
    
    res.json({
      userId,
      period: { start: startDate, end: endDate },
      usage,
      totalCost,
      count: usage.length
    });
    
  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ error: 'Failed to get usage data' });
  }
});

// 1. Token analysis API - Input CA automatically generates narrative
app.post('/api/token/analyze', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { contractAddress } = req.body;
    
    if (!contractAddress) {
      return res.status(400).json({ error: 'Please provide token contract address' });
    }

    // Validate address format
    if (!okxRPC.isValidAddress(contractAddress)) {
      return res.status(400).json({ error: 'Invalid contract address format' });
    }

    // Get token information
    const tokenData = await okxRPC.getTokenInfo(contractAddress);
    
    // Get on-chain data
    const chainData = await okxRPC.getChainStats();
    
    // Get token price data
    let priceData = {};
    try {
      priceData = await okxRPC.getTokenPriceData(contractAddress);
    } catch (error) {
      console.log('Price data retrieval failed, using default values');
    }

    // AI generate token narrative
    const narrative = await openaiService.generateTokenNarrative(
      contractAddress, 
      tokenData, 
      chainData
    );

    // Save to database
    const analysisId = `analysis_${Date.now()}`;
    await db.collection('token_analyses').doc(analysisId).set({
      contractAddress,
      tokenData,
      chainData,
      priceData,
      narrative,
      timestamp: new Date(),
      analysisId
    });

    // Build user-friendly response data (hide technical details, highlight official media information)
    const userFriendlyData = {
      contractAddress,
      tokenData: {
        // Basic information
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        image: tokenData.image,
        // Official media information
        website: tokenData.website,
        telegram: tokenData.telegram,
        twitter: tokenData.twitter,
        // Network information
        network: tokenData.network,
        explorer: tokenData.explorer,
        // Hide technical details
        isPumpToken: tokenData.isPumpToken,
        detectionMethod: tokenData.detectionMethod
      },
      // Hide technical details, only keep necessary information
      chainData: {
        network: tokenData.network,
        chainId: tokenData.chainId
      },
      priceData,
      narrative,
      analysisId,
      explorer: tokenData.explorer
    };

    res.json({
      success: true,
      data: userFriendlyData
    });

  } catch (error) {
    console.error('Token analysis failed:', error);
    res.status(500).json({ 
      error: 'Token analysis failed', 
      message: error.message 
    });
  }
});

// Removed: Smart contract generation API and NFT generation API (streamlined functionality as needed)

// 4. Chain data analysis API
app.post('/api/chain/analyze', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { contractAddress } = req.body;
    
    // Get on-chain data
    const chainData = await okxRPC.getChainStats();
    
    let tokenData = null;
    let analysis = null;
    
    if (contractAddress) {
      try {
        tokenData = await okxRPC.getTokenInfo(contractAddress);
        analysis = await openaiService.analyzeChainTrends(chainData, tokenData);
      } catch (error) {
        console.log('Token analysis failed, returning only on-chain data');
      }
    }

    res.json({
      success: true,
      data: {
        chainData,
        tokenData,
        analysis,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chain analysis failed:', error);
    res.status(500).json({ 
      error: 'Chain analysis failed', 
      message: error.message 
    });
  }
});

// 4.1 DEX factory detection API
app.get('/api/dex/factory/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!okxRPC.isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid factory contract address' });
    }

    const info = await okxRPC.getDexFactoryInfo(address, 10);

    res.json({ success: true, data: info });
  } catch (error) {
    console.error('DEX factory detection failed:', error);
    res.status(500).json({ error: 'DEX factory detection failed', message: error.message });
  }
});

// 5. Investment advice API
app.post('/api/investment/advice', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { contractAddress, riskProfile = 'moderate' } = req.body;
    
    if (!contractAddress) {
      return res.status(400).json({ error: 'Please provide token contract address' });
    }

    // Get token information
    const tokenData = await okxRPC.getTokenInfo(contractAddress);
    
    // Get price data
    let marketData = {};
    try {
      marketData = await okxRPC.getTokenPriceData(contractAddress);
    } catch (error) {
      console.log('Price data retrieval failed');
    }

    // AI generate investment advice
    const advice = await openaiService.generateInvestmentAdvice(
      tokenData, 
      marketData, 
      riskProfile
    );

    // Save to database
    const adviceId = `advice_${Date.now()}`;
    await db.collection('investment_advice').doc(adviceId).set({
      contractAddress,
      tokenData,
      marketData,
      riskProfile,
      advice,
      timestamp: new Date(),
      adviceId
    });

    res.json({
      success: true,
      data: {
        advice,
        adviceId,
        tokenData,
        marketData
      }
    });

  } catch (error) {
    console.error('Investment advice generation failed:', error);
    res.status(500).json({ 
      error: 'Investment advice generation failed', 
      message: error.message 
    });
  }
});

// 6. General AI chat API (integrates token analysis functionality)
app.post('/api/chat', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { message, context = '', sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Please provide message content' });
    }

    // AI chat
    const response = await openaiService.chat(message, context);

    // Check if it's a token analysis request
    if (response.type === 'token_analysis_request') {
      // If a contract address is detected, perform analysis directly
      if (response.detectedAddress) {
        try {
          // Get token information
          const tokenData = await okxRPC.getTokenInfo(response.detectedAddress);
          
          // Get on-chain data
          const chainData = await okxRPC.getChainStats();
          
          // Get token price data
          let priceData = {};
          try {
            priceData = await okxRPC.getTokenPriceData(response.detectedAddress);
          } catch (error) {
            console.log('Price data retrieval failed, using default values');
          }

          // AI generate token narrative
          const narrative = await openaiService.generateTokenNarrative(
            response.detectedAddress, 
            tokenData, 
            chainData
          );

          // Save to database
          const analysisId = `analysis_${Date.now()}`;
          await db.collection('token_analyses').doc(analysisId).set({
            contractAddress: response.detectedAddress,
            tokenData,
            chainData,
            priceData,
            narrative,
            timestamp: new Date(),
            analysisId
          });

          // Build user-friendly response data
          const userFriendlyData = {
            contractAddress: response.detectedAddress,
            tokenData: {
              name: tokenData.name,
              symbol: tokenData.symbol,
              description: tokenData.description,
              image: tokenData.image,
              website: tokenData.website,
              telegram: tokenData.telegram,
              twitter: tokenData.twitter,
              network: tokenData.network,
              explorer: tokenData.explorer,
              isPumpToken: tokenData.isPumpToken,
              detectionMethod: tokenData.detectionMethod
            },
            chainData: {
              network: tokenData.network,
              chainId: tokenData.chainId
            },
            priceData,
            narrative,
            analysisId,
            explorer: tokenData.explorer
          };

          // Save chat history
          const chatId = `chat_${Date.now()}`;
          await db.collection('chat_history').doc(chatId).set({
            sessionId: sessionId || `session_${Date.now()}`,
            message,
            response: {
              type: 'token_analysis_result',
              data: userFriendlyData
            },
            context,
            timestamp: new Date(),
            chatId
          });

          res.json({
            success: true,
            data: {
              type: 'token_analysis_result',
              response: `✅ Token analysis completed!\n\nToken name: ${tokenData.name}\nToken symbol: ${tokenData.symbol}\nNetwork: ${tokenData.network}\n\nAI narrative analysis:\n${narrative}`,
              analysisData: userFriendlyData,
              chatId,
              sessionId: sessionId || `session_${Date.now()}`
            }
          });
          return;
        } catch (error) {
          console.error('Token analysis failed:', error);
          // If analysis fails, return normal chat response
        }
      }

      // Save chat history
      const chatId = `chat_${Date.now()}`;
      await db.collection('chat_history').doc(chatId).set({
        sessionId: sessionId || `session_${Date.now()}`,
        message,
        response: response.message,
        context,
        timestamp: new Date(),
        chatId
      });

      res.json({
        success: true,
        data: {
          type: 'token_analysis_request',
          response: response.message,
          detectedAddress: response.detectedAddress,
          chatId,
          sessionId: sessionId || `session_${Date.now()}`
        }
      });
      return;
    }

    // Normal chat response
    // Save chat history
    const chatId = `chat_${Date.now()}`;
    await db.collection('chat_history').doc(chatId).set({
      sessionId: sessionId || `session_${Date.now()}`,
      message,
      response: response.message,
      context,
      timestamp: new Date(),
      chatId
    });

    res.json({
      success: true,
      data: {
        type: 'normal_response',
        response: response.message,
        chatId,
        sessionId: sessionId || `session_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('AI chat failed:', error);
    res.status(500).json({ 
      error: 'AI chat failed', 
      message: error.message 
    });
  }
});

// 6.1 Special Chinese/English translation API
app.post('/api/translate', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { text, targetLanguage = 'chinese' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Please provide text to translate' });
    }

    // Use specialized translation prompt
    const translatePrompt = `You are a professional translator. Translate the following text to ${targetLanguage}, maintaining the exact format, structure, and meaning. Do not add new content or analysis, just translate:

${text}

Translation:`;

    const response = await openaiService.chat(translatePrompt, 'translation');

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: response,
        targetLanguage,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Translation failed:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      message: error.message 
    });
  }
});

// 7. Wallet query API
app.get('/api/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!okxRPC.isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Get wallet balance
    const balance = await okxRPC.getWalletBalance(address);
    
    // Get contract code information
    const contractInfo = await okxRPC.getContractCode(address);

    res.json({
      success: true,
      data: {
        ...balance,
        contractInfo,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Wallet query failed:', error);
    res.status(500).json({ 
      error: 'Wallet query failed', 
      message: error.message 
    });
  }
});

// 8. Token balance query API
app.get('/api/token/:contractAddress/balance/:walletAddress', async (req, res) => {
  try {
    const { contractAddress, walletAddress } = req.params;
    
    if (!okxRPC.isValidAddress(contractAddress)) {
      return res.status(400).json({ error: 'Invalid token contract address' });
    }
    
    if (!okxRPC.isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Get token balance
    const balance = await okxRPC.getTokenBalance(contractAddress, walletAddress);

    res.json({
      success: true,
      data: {
        ...balance,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Token balance query failed:', error);
    res.status(500).json({ 
      error: 'Token balance query failed', 
      message: error.message 
    });
  }
});

// 9. Get analysis history API
app.get('/api/analyses', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const snapshot = await db.collection('token_analyses')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const analyses = [];
    snapshot.forEach(doc => {
      analyses.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: {
        analyses,
        total: analyses.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Failed to get analysis history:', error);
    res.status(500).json({ 
      error: 'Failed to get analysis history', 
      message: error.message 
    });
  }
});

// 10. Real-time data stream API (using Firebase Realtime Database)
app.get('/api/realtime/chain-stats', async (req, res) => {
  try {
    // Set up real-time data listener
    const statsRef = rtdb.ref('chain_stats');
    
    // Get current on-chain data
    const chainData = await okxRPC.getChainStats();
    
    // Update real-time database
    await statsRef.set({
      ...chainData,
      lastUpdated: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        ...chainData,
        realtimeRef: 'chain_stats',
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Real-time data retrieval failed:', error);
    res.status(500).json({ 
      error: 'Real-time data retrieval failed', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Server internal error',
    message: error.message 
  });
});

// 404 handling
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/token/analyze - Token analysis',
      'POST /api/contract/generate - Smart contract generation',
      'POST /api/nft/generate - NFT metadata generation',
      'POST /api/chain/analyze - Chain data analysis',
      'POST /api/investment/advice - Investment advice',
      'POST /api/chat - AI chat',
      'GET /api/wallet/:address - Wallet query',
      'GET /api/token/:contractAddress/balance/:walletAddress - Token balance query',
      'GET /api/analyses - Get analysis history',
      'GET /api/realtime/chain-stats - Real-time chain data'
    ]
  });
});

// Export Firebase Cloud Function
exports.okxChainAI = functions.https.onRequest(app);

// 11. Wallet monitoring API - Monitor tokens bought by wallets
app.post('/api/wallet/monitor', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { walletAddress, action = 'buy', limit = 50 } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Please provide wallet address' });
    }
    
    if (!okxRPC.isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Get wallet transaction history
    const transactions = await okxRPC.getTransactionHistory(walletAddress, 1, limit);
    
    // Analyze buy transactions
    const buyTransactions = await analyzeBuyTransactions(walletAddress, transactions);
    
    // Save monitoring record to database
    const monitorId = `monitor_${Date.now()}`;
    await db.collection('wallet_monitors').doc(monitorId).set({
      walletAddress,
      action,
      buyTransactions,
      timestamp: new Date(),
      monitorId
    });

    res.json({
      success: true,
      data: {
        walletAddress,
        action,
        buyTransactions,
        totalBuys: buyTransactions.length,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Wallet monitoring failed:', error);
    res.status(500).json({ 
      error: 'Wallet monitoring failed', 
      message: error.message 
    });
  }
});

// 12. Get wallet monitoring history
app.get('/api/wallet/monitor/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    if (!okxRPC.isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const snapshot = await db.collection('wallet_monitors')
      .where('walletAddress', '==', address)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const monitors = [];
    snapshot.forEach(doc => {
      monitors.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: {
        walletAddress: address,
        monitors,
        total: monitors.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Failed to get monitoring history:', error);
    res.status(500).json({ 
      error: 'Failed to get monitoring history', 
      message: error.message 
    });
  }
});

// 13. Set wallet monitoring (supports Telegram notifications)
app.post('/api/wallet/monitor/setup', authenticateAPI, trackAPIUsage, async (req, res) => {
  try {
    const { walletAddress, telegramChatId, notificationType = 'buy' } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Please provide wallet address' });
    }
    
    if (!okxRPC.isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Save monitoring settings
    const monitorSetupId = `setup_${Date.now()}`;
    await db.collection('monitor_setups').doc(monitorSetupId).set({
      walletAddress,
      telegramChatId,
      notificationType,
      isActive: true,
      createdAt: new Date(),
      monitorSetupId
    });

    // If Telegram Bot is configured, send confirmation message
    if (telegramBot && telegramChatId) {
      try {
        await telegramBot.bot.sendMessage(telegramChatId, 
          `🔔 **Wallet monitoring setup successful!**\n\n📍 Monitoring address: \`${walletAddress}\`\n📱 Notification type: ${notificationType}\n⏰ Setup time: ${new Date().toLocaleString('zh-CN')}\n\nNow monitoring this wallet's ${notificationType} transactions!`
        );
      } catch (tgError) {
        console.error('Telegram notification failed:', tgError);
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Wallet monitoring setup successful',
        monitorSetupId,
        walletAddress,
        notificationType,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Failed to set wallet monitoring:', error);
    res.status(500).json({ 
      error: 'Failed to set wallet monitoring', 
      message: error.message 
    });
  }
});

// Helper function: Analyze buy transactions
async function analyzeBuyTransactions(walletAddress, transactions) {
  try {
    const buyTransactions = [];
    
    // This needs to be parsed based on the actual transaction data structure
    // Due to OKX API limitations, we might need to use other methods
    
    // Try to get buy information from on-chain events
    const latestBlock = await okxRPC.provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 10000); // Recent 10000 blocks
    
    // Listen for Transfer events (token buys)
    const transferTopic = ethers.id('Transfer(address,address,uint256)');
    const logs = await okxRPC.provider.getLogs({
      fromBlock,
      toBlock: 'latest',
      topics: [
        transferTopic,
        null, // from address (any)
        '0x' + '0'.repeat(24) + walletAddress.slice(2) // to address (target wallet)
      ]
    });
    
    // Analyze Transfer events
    for (const log of logs) {
      try {
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const parsedLog = iface.parseLog(log);
        
        // Check if it's a buy transaction (from DEX or contract transfer)
        if (parsedLog.args.to.toLowerCase() === walletAddress.toLowerCase()) {
          buyTransactions.push({
            tokenAddress: log.address,
            from: parsedLog.args.from,
            to: parsedLog.args.to,
            value: parsedLog.args.value.toString(),
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: new Date()
          });
        }
      } catch (parseError) {
        console.error('Failed to parse Transfer event:', parseError);
      }
    }
    
    return buyTransactions;
    
  } catch (error) {
    console.error('Failed to analyze buy transactions:', error);
    return [];
  }
}

// Scheduled task: Update on-chain data (commented out for now as new API has changes)
// exports.updateChainStats = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
//   try {
//     const chainData = await okxRPC.getChainStats();
//     
//     // Update Firebase Realtime Database
//     await rtdb.ref('chain_stats').set({
//       ...chainData,
//       lastUpdated: new Date().toISOString()
//     });

//     console.log('Chain data updated successfully:', chainData);
//     return null;
//   } catch (error) {
//     console.error('Scheduled update failed:', error);
//     return null;
//     }
// });

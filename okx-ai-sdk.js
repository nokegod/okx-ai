/**
 * OKX Chain AI SDK
 * A comprehensive JavaScript SDK for integrating with OKX Chain AI services
 * 
 * @version 1.0.0
 * @author OKX Chain AI Team
 * @license MIT
 */

class OKXChainAI {
  /**
   * Initialize the OKX Chain AI SDK
   * @param {string} apiKey - Your API key from the dashboard
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Custom base URL (optional)
   * @param {number} options.timeout - Request timeout in milliseconds (default: 30000)
   * @param {boolean} options.retryOnFailure - Whether to retry failed requests (default: true)
   * @param {number} options.maxRetries - Maximum number of retries (default: 3)
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required. Please provide your API key from the dashboard.');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://chat-294cc.cloudfunctions.net/okxChainAI';
    this.timeout = options.timeout || 30000;
    this.retryOnFailure = options.retryOnFailure !== false;
    this.maxRetries = options.maxRetries || 3;
    
    // Validate API key format
    if (!this.apiKey.startsWith('okx_')) {
      console.warn('Warning: API key format appears to be invalid. Expected format: okx_...');
    }
  }

  /**
   * Make an authenticated request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {string} method - HTTP method (default: 'POST')
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, data = {}, method = 'POST') {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    };

    const config = {
      method,
      headers,
      timeout: this.timeout
    };

    if (method === 'POST' && Object.keys(data).length > 0) {
      config.body = JSON.stringify(data);
    }

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle specific error cases
          if (response.status === 401) {
            throw new Error('Invalid or expired API key. Please check your credentials.');
          } else if (response.status === 429) {
            throw new Error(`Rate limit exceeded: ${errorData.message || 'Too many requests'}`);
          } else if (response.status === 400) {
            throw new Error(`Bad request: ${errorData.message || 'Invalid request data'}`);
          } else {
            throw new Error(`API request failed: ${errorData.message || response.statusText}`);
          }
        }
        
        return await response.json();
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.message.includes('Invalid or expired API key') || 
            error.message.includes('Rate limit exceeded') ||
            error.message.includes('Bad request')) {
          break;
        }
        
        // Retry on server errors or network issues
        if (this.retryOnFailure && attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.warn(`Request failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        break;
      }
    }
    
    throw lastError;
  }

  /**
   * Analyze a token contract address
   * @param {string} contractAddress - The token contract address to analyze
   * @returns {Promise<Object>} Token analysis results
   */
  async analyzeToken(contractAddress) {
    if (!contractAddress) {
      throw new Error('Contract address is required');
    }
    
    if (!this.isValidAddress(contractAddress)) {
      throw new Error('Invalid contract address format');
    }
    
    return this.request('/api/token/analyze', { contractAddress });
  }

  /**
   * Get AI-powered investment advice for a token
   * @param {string} contractAddress - The token contract address
   * @param {Object} options - Investment advice options
   * @param {string} options.riskProfile - Risk profile: 'conservative', 'moderate', 'aggressive'
   * @param {string} options.investmentAmount - Investment amount in USD
   * @param {string} options.timeHorizon - Investment time horizon
   * @returns {Promise<Object>} Investment advice
   */
  async getInvestmentAdvice(contractAddress, options = {}) {
    if (!contractAddress) {
      throw new Error('Contract address is required');
    }
    
    const {
      riskProfile = 'moderate',
      investmentAmount,
      timeHorizon
    } = options;
    
    const data = { contractAddress, riskProfile };
    if (investmentAmount) data.investmentAmount = investmentAmount;
    if (timeHorizon) data.timeHorizon = timeHorizon;
    
    return this.request('/api/investment/advice', data);
  }

  /**
   * Analyze OKX Chain trends and market data
   * @param {string} contractAddress - Optional contract address for specific analysis
   * @param {string} analysisType - Type of analysis: 'trend', 'market', 'technical'
   * @returns {Promise<Object>} Chain analysis results
   */
  async analyzeChain(contractAddress = null, analysisType = 'trend') {
    const data = { analysisType };
    if (contractAddress) data.contractAddress = contractAddress;
    
    return this.request('/api/chain/analyze', data);
  }

  /**
   * Chat with the AI about blockchain and crypto topics
   * @param {string} message - Your message to the AI
   * @param {Object} options - Chat options
   * @param {string} options.context - Additional context for the conversation
   * @param {string} options.sessionId - Session ID for conversation continuity
   * @returns {Promise<Object>} AI response
   */
  async chat(message, options = {}) {
    if (!message) {
      throw new Error('Message is required');
    }
    
    const { context = '', sessionId } = options;
    const data = { message, context };
    if (sessionId) data.sessionId = sessionId;
    
    return this.request('/api/chat', data);
  }

  /**
   * Translate text between languages
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language (default: 'chinese')
   * @returns {Promise<Object>} Translation results
   */
  async translate(text, targetLanguage = 'chinese') {
    if (!text) {
      throw new Error('Text to translate is required');
    }
    
    return this.request('/api/translate', { text, targetLanguage });
  }

  /**
   * Monitor wallet activities
   * @param {string} walletAddress - The wallet address to monitor
   * @param {Object} options - Monitoring options
   * @param {string} options.action - Action type: 'buy', 'sell', 'transfer'
   * @param {number} options.limit - Maximum number of transactions to return
   * @returns {Promise<Object>} Wallet monitoring results
   */
  async monitorWallet(walletAddress, options = {}) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    const { action = 'buy', limit = 50 } = options;
    
    return this.request('/api/wallet/monitor', { 
      walletAddress, 
      action, 
      limit 
    });
  }

  /**
   * Set up wallet monitoring with notifications
   * @param {string} walletAddress - The wallet address to monitor
   * @param {Object} options - Setup options
   * @param {string} options.telegramChatId - Telegram chat ID for notifications
   * @param {string} options.notificationType - Type of notifications: 'buy', 'sell', 'all'
   * @returns {Promise<Object>} Setup results
   */
  async setupWalletMonitoring(walletAddress, options = {}) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    const { 
      telegramChatId, 
      notificationType = 'buy' 
    } = options;
    
    const data = { walletAddress, notificationType };
    if (telegramChatId) data.telegramChatId = telegramChatId;
    
    return this.request('/api/wallet/monitor/setup', data);
  }

  /**
   * Get information about your API key
   * @returns {Promise<Object>} API key information
   */
  async getAPIKeyInfo() {
    return this.request(`/api/keys/${this.apiKey}`, {}, 'GET');
  }

  /**
   * Get your usage statistics
   * @param {Object} options - Usage options
   * @param {number} options.month - Month (1-12)
   * @param {number} options.year - Year
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats(options = {}) {
    const { month, year } = options;
    let url = `/api/usage/${this.apiKey.split('_')[1]}`; // Extract user ID from API key
    
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    
    return this.request(url, {}, 'GET');
  }

  /**
   * Get available subscription plans
   * @returns {Promise<Object>} Available plans
   */
  async getAvailablePlans() {
    return this.request('/api/plans', {}, 'GET');
  }

  /**
   * Check API health status
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    return this.request('/health', {}, 'GET');
  }

  /**
   * Validate Ethereum address format
   * @param {string} address - Address to validate
   * @returns {boolean} Whether the address is valid
   */
  isValidAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  }

  /**
   * Create a new session for continuous conversation
   * @returns {string} New session ID
   */
  createSession() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Batch analyze multiple tokens
   * @param {string[]} contractAddresses - Array of contract addresses
   * @param {Object} options - Batch options
   * @param {number} options.concurrency - Maximum concurrent requests (default: 3)
   * @returns {Promise<Object[]>} Array of analysis results
   */
  async batchAnalyzeTokens(contractAddresses, options = {}) {
    if (!Array.isArray(contractAddresses) || contractAddresses.length === 0) {
      throw new Error('Contract addresses array is required and cannot be empty');
    }
    
    const { concurrency = 3 } = options;
    const results = [];
    const errors = [];
    
    // Process in batches
    for (let i = 0; i < contractAddresses.length; i += concurrency) {
      const batch = contractAddresses.slice(i, i + concurrency);
      const batchPromises = batch.map(async (address, index) => {
        try {
          const result = await this.analyzeToken(address);
          return { success: true, address, result, index: i + index };
        } catch (error) {
          return { success: false, address, error: error.message, index: i + index };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
        }
      });
      
      // Small delay between batches to avoid overwhelming the API
      if (i + concurrency < contractAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return {
      results,
      errors,
      total: contractAddresses.length,
      successful: results.length,
      failed: errors.length
    };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS (Node.js)
  module.exports = OKXChainAI;
} else if (typeof define === 'function' && define.amd) {
  // AMD
  define(function() { return OKXChainAI; });
} else if (typeof window !== 'undefined') {
  // Browser global
  window.OKXChainAI = OKXChainAI;
}

// Example usage (will be removed in production)
if (typeof window !== 'undefined') {
  console.log(`
🚀 OKX Chain AI SDK loaded successfully!

Example usage:
const ai = new OKXChainAI('your_api_key_here');

// Analyze a token
ai.analyzeToken('0x1234...').then(result => {
  console.log('Token analysis:', result);
});

// Chat with AI
ai.chat('What are the risks of this token?').then(response => {
  console.log('AI response:', response);
});

For more information, visit: https://chat-294cc.web.app
  `);
}

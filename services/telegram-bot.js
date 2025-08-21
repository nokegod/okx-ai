const TelegramBot = require('node-telegram-bot-api');
const OpenAIService = require('./openai-service');
const OKXRPCService = require('./okx-rpc');
const WalletMonitorService = require('./wallet-monitor');

class TelegramBotService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.openaiService = new OpenAIService();
    this.okxRPC = new OKXRPCService();
    
    // Add user state management
    this.userStates = new Map(); // Store user current state
    
    this.setupCommands();
    this.setupMessageHandlers();
    
    // Initialize wallet monitoring service (pass Bot instance)
    this.walletMonitor = new WalletMonitorService(this.bot);
  }

  // Helper function: Ensure response content is in string format
  ensureStringResponse(response) {
    try {
      if (typeof response === 'string') {
        return response;
      } else if (response && typeof response === 'object') {
        // If it's an object, prioritize extracting message field, if not available then convert to JSON
        if (response.message && typeof response.message === 'string') {
          console.log('AI response object extracted message field:', response.message.substring(0, 100) + '...');
          return response.message;
        } else {
          const jsonString = JSON.stringify(response, null, 2);
          console.log('AI response object converted to JSON string:', jsonString.substring(0, 100) + '...');
          return jsonString;
        }
      } else if (response === null || response === undefined) {
        console.warn('AI response is empty, returning default message');
        return 'Sorry, AI is temporarily unable to answer, please try again later.';
      } else {
        // Convert other types to string
        const stringResponse = String(response);
        console.log('AI response converted to string:', stringResponse.substring(0, 100) + '...');
        return stringResponse;
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      console.error('Original response:', response);
      return 'Sorry, an error occurred while processing AI response, please try again later.';
    }
  }

  // Helper function: Clean Markdown format to prevent parsing errors
  cleanMarkdown(text) {
    try {
      if (!text || typeof text !== 'string') {
        return text;
      }
      
      // Remove special characters that may cause parsing errors
      let cleaned = text
        // Remove unpaired Markdown markers
        .replace(/\*\*(?![^*]*\*\*)/g, '**') // Unpaired bold start
        .replace(/(?<!\*\*)\*\*/g, '**')     // Unpaired bold end
        .replace(/\*(?![^*]*\*)/g, '*')      // Unpaired italic start
        .replace(/(?<!\*)\*/g, '*')          // Unpaired italic end
        .replace(/`(?![^`]*`)/g, '`')        // Unpaired code start
        .replace(/(?<!`)`/g, '`')            // Unpaired code end
        .replace(/\[(?![^\]]*\]\([^)]*\))/g, '[') // Unpaired link start
        .replace(/(?<!\[)\]/g, ']')          // Unpaired link end
        .replace(/\((?![^)]*\))/g, '(')      // Unpaired parenthesis start
        .replace(/(?<!\()\)/g, ')')          // Unpaired parenthesis end
        
        // Remove special characters that may cause problems
        .replace(/[^\w\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>-]/g, '')
        
        // Ensure code block format is correct
        .replace(/```(\w+)?\n?/g, '```\n')
        .replace(/\n?```/g, '\n```');
      
      // If cleaned text is too short, return original text
      if (cleaned.length < 10) {
        console.warn('Cleaned text too short, using original text');
        return text;
      }
      
      console.log('Markdown format cleaning completed, length:', cleaned.length);
      return cleaned;
      
    } catch (error) {
      console.error('Error cleaning Markdown format:', error);
      // If cleaning fails, return safe plain text
      return text ? String(text).replace(/[*_`[\]()]/g, '') : 'Sorry, an error occurred while processing message format.';
    }
  }

  // Helper function: Safely delete message
  async safeDeleteMessage(chatId, messageId) {
    try {
      if (messageId && chatId) {
        await this.bot.deleteMessage(chatId, messageId);
        console.log('Message deleted successfully:', messageId);
      }
    } catch (error) {
      // Ignore errors deleting messages, do not affect main functionality
      if (error.message.includes('message to delete not found')) {
        console.log('Message already deleted or does not exist:', messageId);
      } else {
        console.warn('Error deleting message:', error.message);
      }
    }
  }

  // Set commands
  setupCommands() {
    this.bot.setMyCommands([
      { command: '/start', description: 'Start using OKX Chain AI assistant' },
      { command: '/help', description: 'View help information' },
      { command: '/analyze', description: 'Analyze token contract (format: /analyze 0x...)' },
      { command: '/contract', description: 'Generate smart contract (format: /contract requirement description)' },
      { command: '/nft', description: 'Generate NFT metadata (format: /nft description)' },
      { command: '/chat', description: 'AI chat (format: /chat your question)' },
      { command: '/wallet', description: 'Query wallet information (format: /wallet 0x...)' },
      { command: '/chain', description: 'View OKX Chain status' },
      { command: '/price', description: 'Query token price (format: /price 0x...)' },
      { command: '/monitor', description: 'Set up wallet monitoring (format: /monitor 0x...)' },
      { command: '/monitorlist', description: 'View monitoring list' },
      { command: '/monitoroff', description: 'Turn off wallet monitoring (format: /monitoroff 0x...)' }
    ]);
  }

  // Set message handlers
  setupMessageHandlers() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🚀 Welcome to OKX Chain AI Assistant!

I am your blockchain development assistant, I can help you:

🔍 **Token Analysis**: Input contract address, AI analyzes automatically
💻 **Smart Contract**: Describe requirements, generate complete code
🎨 **NFT Creation**: Describe NFT, generate metadata
💬 **AI Chat**: Answer OKX Chain related questions
📊 **On-chain Data**: Real-time monitoring of chain status

Use /help to view detailed command instructions
      `;
      
      await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
📚 **OKX Chain AI Assistant Guide**

🔍 **Token Analysis**
/analyze 0x1234... - Analyze token contract

💻 **Smart Contract Generation**
/contract requirement description - Generate contract code

🎨 **NFT Metadata Generation**
/nft description - Generate NFT metadata

💬 **AI Chat**
/chat your question - Get AI answer

📊 **On-chain Data Query**
/wallet 0x... - Query wallet information
/chain - View chain status
/price 0x... - Query token price

🔔 **Wallet Monitoring Function**
/monitor 0x... - Set up wallet monitoring
/monitorlist - View monitoring list
/monitoroff 0x... - Turn off wallet monitoring

💡 **Usage Tips**
• Contract address must be 42 characters starting with 0x
• The more detailed the description, the more accurate the AI-generated content
• Supports both Chinese and English input
• After setting up monitoring, new tokens bought will be automatically pushed notifications
      `;
      
      await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Token analysis command - Interactive flow
    this.bot.onText(/\/analyze$/, async (msg) => {
      const chatId = msg.chat.id;
      
      // Set user state to wait for input CA
      this.setUserState(chatId, {
        action: 'analyze_token',
        step: 'waiting_ca',
        timestamp: Date.now()
      });

      const message = `🔍 **Token Analysis**\n\nPlease send the token's contract address (CA):\n\n💡 **Example format:**\n\`0x1234567890abcdef...\`\n\n⏰ Please complete the operation within 5 minutes, it will be cancelled automatically`;
      
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel Operation', callback_data: 'cancel_operation' }]
          ]
        }
      });
    });

    // Keep the original analyze command with parameters
    this.bot.onText(/\/analyze (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const contractAddress = match[1].trim();
      
      if (!this.okxRPC.isValidAddress(contractAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid contract address format, please use a 42-character address starting with 0x');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🔍 AI is analyzing token, please wait...');
        
        // Get token information
        const tokenData = await this.okxRPC.getTokenInfo(contractAddress);
        const chainData = await this.okxRPC.getChainStats();
        
        // AI generate narrative
        const narrative = await this.openaiService.generateTokenNarrative(
          contractAddress, 
          tokenData, 
          chainData
        );
        
        // Ensure narrative is in string format
        const narrativeText = this.ensureStringResponse(narrative);

        const resultMessage = `
🎯 **Token Analysis Result**

📋 **Basic Information**
• Name: ${tokenData.name}
• Symbol: ${tokenData.symbol}
• Total Supply: ${tokenData.totalSupply}
• Decimals: ${tokenData.decimals}

🔗 **On-chain Data**
• Block Height: ${chainData.blockNumber}
• Gas Price: ${chainData.gasPrice} Gwei
• Chain ID: ${chainData.chainId}

🧠 **AI Narrative Analysis**
${narrativeText}

🔍 **Block Explorer**
${tokenData.explorer}
        `;
        
        await this.bot.sendMessage(chatId, resultMessage, { parse_mode: 'Markdown' });
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Analysis failed: ${error.message}`);
      }
    });

    // Smart contract generation command
    this.bot.onText(/\/contract (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const requirements = match[1].trim();
      
      if (!requirements) {
        await this.bot.sendMessage(chatId, '❌ Please provide a smart contract requirement description');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '💻 AI is generating smart contract, please wait...');
        
        const contractCode = await this.openaiService.generateSmartContract(requirements);
        
        // Ensure contractCode is in string format
        const contractCodeText = this.ensureStringResponse(contractCode);
        
        // Clean code format, ensure code block is correct
        const cleanedCode = this.cleanMarkdown(contractCodeText);
        
        // Send long messages in segments
        const maxLength = 4000;
        if (cleanedCode.length > maxLength) {
          const parts = this.splitMessage(cleanedCode, maxLength);
          for (let i = 0; i < parts.length; i++) {
            const codeMessage = `📄 Smart Contract Code (Part ${i + 1}):\n\n\`\`\`solidity\n${parts[i]}\n\`\`\``;
            try {
              await this.bot.sendMessage(chatId, codeMessage, { parse_mode: 'Markdown' });
            } catch (markdownError) {
              console.warn('Code block Markdown sending failed, using plain text:', markdownError.message);
              await this.bot.sendMessage(chatId, `📄 Smart Contract Code (Part ${i + 1}):\n\n${parts[i]}`);
            }
            await this.delay(1000); // Avoid sending too fast
          }
        } else {
          const codeMessage = `📄 **Smart Contract Code**\n\n\`\`\`solidity\n${cleanedCode}\n\`\`\``;
          try {
            await this.bot.sendMessage(chatId, codeMessage, { parse_mode: 'Markdown' });
          } catch (markdownError) {
            console.warn('Code block Markdown sending failed, using plain text:', markdownError.message);
            await this.bot.sendMessage(chatId, `📄 Smart Contract Code\n\n${cleanedCode}`);
          }
        }
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Smart contract generation failed: ${error.message}`);
      }
    });

    // NFT generation command
    this.bot.onText(/\/nft (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const description = match[1].trim();
      
      if (!description) {
        await this.bot.sendMessage(chatId, '❌ Please provide an NFT description');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🎨 AI is generating NFT metadata, please wait...');
        
        const metadata = await this.openaiService.generateNFTMetadata(description, '');
        
        // Ensure metadata is in string format
        const metadataText = this.ensureStringResponse(metadata);
        
        // Clean JSON format, ensure code block is correct
        const cleanedMetadata = this.cleanMarkdown(metadataText);
        
        const metadataMessage = `🎨 **NFT Metadata**\n\n\`\`\`json\n${cleanedMetadata}\n\`\`\``;
        try {
          await this.bot.sendMessage(chatId, metadataMessage, { parse_mode: 'Markdown' });
        } catch (markdownError) {
          console.warn('NFT metadata Markdown sending failed, using plain text:', markdownError.message);
          await this.bot.sendMessage(chatId, `🎨 NFT Metadata\n\n${cleanedMetadata}`);
        }
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ NFT generation failed: ${error.message}`);
      }
    });

    // AI chat command - Interactive flow
    this.bot.onText(/\/chat$/, async (msg) => {
      const chatId = msg.chat.id;
      
      // Set user state to wait for input message
      this.setUserState(chatId, {
        action: 'ai_chat',
        step: 'waiting_message',
        timestamp: Date.now()
      });

      const message = `🤖 **AI Smart Chat**\n\nPlease send your question:\n\n💡 **Supported Features:**\n• Token analysis consultation\n• Investment advice\n• Technical questions\n• General conversation\n\n⏰ Please complete the operation within 5 minutes, it will be cancelled automatically`;
      
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel Operation', callback_data: 'cancel_operation' }]
          ]
        }
      });
    });

    // Keep the original AI chat command with parameters
    this.bot.onText(/\/chat (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const message = match[1].trim();
      
      if (!message) {
        await this.bot.sendMessage(chatId, '❌ Please enter your question');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🤖 AI is thinking, please wait...');
        
        const response = await this.openaiService.chat(message, '');
        
        // Ensure response is in string format
        const responseText = this.ensureStringResponse(response);
        
        await this.bot.sendMessage(chatId, `🤖 AI Answer\n\n${responseText}`);
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ AI chat failed: ${error.message}`);
      }
    });

    // Wallet query command - Interactive flow
    this.bot.onText(/\/wallet$/, async (msg) => {
      const chatId = msg.chat.id;
      
      // Set user state to wait for input wallet address
      this.setUserState(chatId, {
        action: 'query_wallet',
        step: 'waiting_wallet',
        timestamp: Date.now()
      });

      const message = `💰 **Wallet Query**\n\nPlease send the wallet address you want to query:\n\n💡 **Example format:**\n\`0x1234567890abcdef...\`\n\n⏰ Please complete the operation within 5 minutes, it will be cancelled automatically`;
      
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel Operation', callback_data: 'cancel_operation' }]
          ]
        }
      });
    });

    // Keep the original wallet query command with parameters
    this.bot.onText(/\/wallet (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const address = match[1].trim();
      
      if (!this.okxRPC.isValidAddress(address)) {
        await this.bot.sendMessage(chatId, '❌ Invalid wallet address format');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🔍 Querying wallet information...');
        
        const balance = await this.okxRPC.getWalletBalance(address);
        const contractInfo = await this.okxRPC.getContractCode(address);
        
        const walletMessage = `
💰 **Wallet Information**

📍 **Address**: \`${address}\`
💎 **OKC Balance**: ${balance.ethBalance} OKC
🔗 **Chain ID**: ${balance.chainId}

📋 **Contract Information**
• Is Contract: ${contractInfo.hasCode ? 'Yes' : 'No'}
• Code Length: ${contractInfo.codeLength} characters
        `;
        
        await this.bot.sendMessage(chatId, walletMessage, { parse_mode: 'Markdown' });
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Wallet query failed: ${error.message}`);
      }
    });

    // Chain status query command
    this.bot.onText(/\/chain/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        await this.bot.sendMessage(chatId, '📊 Getting chain status...');
        
        const chainData = await this.okxRPC.getChainStats();
        
        const chainMessage = `
🌐 **OKX Chain Real-time Status**

🔢 **Block Information**
• Current Block: ${chainData.blockNumber}
• Gas Price: ${chainData.gasPrice} Gwei
• Chain ID: ${chainData.chainId}

⏰ **Update Time**: ${new Date().toLocaleString('zh-CN')}
        `;
        
        await this.bot.sendMessage(chatId, chainMessage, { parse_mode: 'Markdown' });
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Chain status query failed: ${error.message}`);
      }
    });

    // Token price query command
    this.bot.onText(/\/price (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const contractAddress = match[1].trim();
      
      if (!this.okxRPC.isValidAddress(contractAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid token contract address');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '💱 Querying token price...');
        
        const priceData = await this.okxRPC.getTokenPriceData(contractAddress);
        
        if (priceData && Object.keys(priceData).length > 0) {
          const priceMessage = `
💱 **Token Price Information**

�� **Contract Address**: \`${contractAddress}\`

${Object.entries(priceData).map(([currency, price]) => 
  `• ${currency.toUpperCase()}: ${price}`
).join('\n')}
          `;
          
          await this.bot.sendMessage(chatId, priceMessage, { parse_mode: 'Markdown' });
        } else {
          await this.bot.sendMessage(chatId, '⚠️ No price information found for this token yet');
        }
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Price query failed: ${error.message}`);
      }
    });

    // Wallet monitoring setup command - Interactive flow
    this.bot.onText(/\/monitor$/, async (msg) => {
      const chatId = msg.chat.id;
      
      // Set user state to wait for input wallet address
      this.setUserState(chatId, {
        action: 'setup_monitor',
        step: 'waiting_wallet',
        timestamp: Date.now()
      });

      const message = `🔔 **Wallet Monitoring Setup**\n\nPlease send the wallet address you want to monitor:\n\n💡 **Example format:**\n\`0x1234567890abcdef...\`\n\n⏰ Please complete the operation within 5 minutes, it will be cancelled automatically`;
      
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel Operation', callback_data: 'cancel_operation' }]
          ]
        }
      });
    });

    // Keep the original monitor command with parameters
    this.bot.onText(/\/monitor (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const walletAddress = match[1].trim();
      
      if (!this.okxRPC.isValidAddress(walletAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid wallet address format');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🔔 Setting up wallet monitoring...');
        
        // Call API to set up monitoring
        const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:5001'}/api/wallet/monitor/setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress,
            telegramChatId: chatId,
            notificationType: 'buy'
          })
        });

        if (response.ok) {
          const result = await response.json();
          await this.bot.sendMessage(chatId, 
            `✅ **Wallet monitoring setup successful!**\n\n📍 Monitoring Address: \`${walletAddress}\`\n🔔 Notification Type: Buy Transaction\n⏰ Setup Time: ${new Date().toLocaleString('zh-CN')}\n\nNow monitoring buy transactions for this wallet!`
          );
        } else {
          throw new Error('API call failed');
        }
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Monitoring setup failed: ${error.message}`);
      }
    });

    // View monitoring list command
    this.bot.onText(/\/monitorlist/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        await this.bot.sendMessage(chatId, '📋 Getting monitoring list...');
        
        // Get real monitoring list
        const monitorList = this.walletMonitor.getMonitorList();
        
        if (monitorList.length === 0) {
          await this.bot.sendMessage(chatId, 
            `📋 **Wallet Monitoring List**\n\nNo wallets are currently monitored.\n\n💡 Use /monitor 0x... command to add wallet monitoring!`
          );
        } else {
          const listMessage = `📋 **Wallet Monitoring List**\n\nCurrently monitoring ${monitorList.length} wallets:\n\n${monitorList.map((item, index) => 
            `${index + 1}. \`${item.address}\`\n   📱 Notification ID: ${item.telegramChatId}\n   🔔 Type: ${item.notificationType}\n   ⏰ Added Time: ${new Date(item.addedAt).toLocaleString('zh-CN')}`
          ).join('\n\n')}\n\n💡 Use /monitoroff 0x... command to turn off monitoring`;
          
          await this.bot.sendMessage(chatId, listMessage, { parse_mode: 'Markdown' });
        }
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Failed to get monitoring list: ${error.message}`);
      }
    });

    // Turn off monitoring command
    this.bot.onText(/\/monitoroff (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const walletAddress = match[1].trim();
      
      if (!this.okxRPC.isValidAddress(walletAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid wallet address format');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🔕 Turning off wallet monitoring...');
        
        // Use the real wallet monitoring service to turn off monitoring
        const result = await this.walletMonitor.removeWalletMonitor(walletAddress);
        
        await this.bot.sendMessage(chatId, 
          `🔕 **Wallet monitoring turned off**\n\n📍 Address: \`${walletAddress}\`\n⏰ Turned off Time: ${new Date().toLocaleString('zh-CN')}\n\nThis wallet will no longer push buy notifications.`
        );
        
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Failed to turn off monitoring: ${error.message}`);
      }
    });

    // Handle normal text messages
    this.bot.on('message', async (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        const chatId = msg.chat.id;
        const userMessage = msg.text;
        
        // Check user state, handle interactive input
        const userState = this.getUserState(chatId);
        if (userState) {
          await this.handleUserInput(msg);
          return;
        }
        
        // Check if it's a contract address
        if (this.okxRPC.isValidAddress(userMessage)) {
          await this.bot.sendMessage(chatId, 
            '🔍 Detected contract address! Use /analyze command for detailed analysis, or reply directly to this message to start AI chat.'
          );
        } else {
          // Check if it's a Chinese keyword
          const keywordResponse = this.getKeywordResponse(userMessage);
          
          if (keywordResponse) {
            await this.bot.sendMessage(chatId, keywordResponse, { parse_mode: 'Markdown' });
          } else {
            // General AI chat
            try {
              await this.bot.sendMessage(chatId, '🤖 AI is thinking, please wait...');
              
              const response = await this.openaiService.chat(userMessage, '');
              
              // Ensure response is in string format
              const responseText = this.ensureStringResponse(response);
              
              await this.bot.sendMessage(chatId, `🤖 AI Answer\n\n${responseText}`);
              
            } catch (error) {
              await this.bot.sendMessage(chatId, `❌ AI chat failed: ${error.message}`);
            }
          }
        }
      }
    });

    // Handle callback queries
    this.bot.on('callback_query', async (callbackQuery) => {
      const chatId = callbackQuery.message.chat.id;
      
      if (callbackQuery.data === 'cancel_operation') {
        await this.handleCancelOperation(callbackQuery);
      }
      
      // Answer callback query
      await this.bot.answerCallbackQuery(callbackQuery.id);
    });







    // Error handling
    this.bot.on('polling_error', (error) => {
      console.error('Telegram Bot polling error:', error);
    });

    this.bot.on('error', (error) => {
      console.error('Telegram Bot error:', error);
    });
  }

  // Split long messages
  splitMessage(message, maxLength) {
    const parts = [];
    let currentPart = '';
    
    const lines = message.split('\n');
    
    for (const line of lines) {
      if ((currentPart + line).length > maxLength) {
        if (currentPart) {
          parts.push(currentPart.trim());
          currentPart = line + '\n';
        } else {
          // Single line too long, force split
          parts.push(line.substring(0, maxLength));
          currentPart = line.substring(maxLength) + '\n';
        }
      } else {
        currentPart += line + '\n';
      }
    }
    
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }
    
    return parts;
  }

  // Delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }





  // Chinese keyword intelligent recognition
  getKeywordResponse(message) {
    const keywords = {
      'query': `🔍 **Query Function**\n\nWhat do you want to query?\n\n💰 **Wallet Query** - Send /wallet 0x...\n💱 **Price Query** - Send /price 0x...\n🔗 **Chain Status** - Send /chain\n\n💡 Hint: You can also quickly query by sending wallet address or token CA directly`,
      
      'analyze': `🔍 **Analysis Function**\n\nWhat do you want to analyze?\n\n🎯 **Token Analysis** - Send /analyze 0x...\n💻 **Smart Contract Analysis** - Send /contract requirement description\n🎨 **NFT Analysis** - Send /nft description\n\n💡 Hint: You can also quickly analyze by sending contract address directly`,
      
      'monitor': `🔔 **Monitoring Function**\n\nWhat do you want to monitor?\n\n📊 **Wallet Monitoring** - Send /monitor 0x...\n📋 **View Monitoring** - Send /monitorlist\n🔕 **Turn Off Monitoring** - Send /monitoroff 0x...\n\n💡 Hint: After setting up monitoring, it will automatically push buy notifications and CA information`,
      
      'contract': `💻 **Smart Contract Function**\n\nWhat do you want to do?\n\n📝 **Generate Contract** - Send /contract requirement description\n🔍 **Analyze Contract** - Send /analyze 0x...\n📚 **Contract Tutorial** - Send /chat How to write smart contracts\n\n💡 Hint: The more detailed the description, the more accurate the generated contract`,
      
      'nft': `🎨 **NFT Function**\n\nWhat do you want to do?\n\n🎭 **Generate NFT** - Send /nft description\n🔍 **Analyze NFT** - Send /analyze 0x...\n📚 **NFT Tutorial** - Send /chat How to create NFT\n\n💡 Hint: You can describe details like color, style, rarity, etc.`,
      
      'wallet': `💰 **Wallet Function**\n\nWhat do you want to do?\n\n🔍 **Query Wallet** - Send /wallet 0x...\n🔔 **Monitor Wallet** - Send /monitor 0x...\n💱 **Query Balance** - Send /wallet 0x...\n\n💡 Hint: You can also quickly query by sending wallet address directly`,
      
      'price': `💱 **Price Query Function**\n\nWhat price do you want to query?\n\n🪙 **Token Price** - Send /price 0x...\n💰 **Wallet Balance** - Send /wallet 0x...\n📊 **Chain Status** - Send /chain\n\n💡 Hint: Supports USD, BTC, ETH, etc. price queries`,
      
      'help': `📚 **Help Center**\n\nSend /help to view the full command list\n\n🔍 **Quick Start:**\n• /start - Start using\n• /help - View help\n• /monitor 0x... - Set up wallet monitoring\n\n💡 Hint: If you have any questions, feel free to ask me!`,
      
      'start': `🚀 **Welcome to OKX Chain AI Assistant!**\n\nSend /start to start using\n\n🔍 **Main Functions:**\n• Token analysis and narrative generation\n• Smart contract code generation\n• NFT metadata creation\n• Wallet monitoring and CA push\n• AI smart chat\n\n💡 Hint: Send /help to see all commands`
    };

    // Fuzzy match keywords
    for (const [keyword, response] of Object.entries(keywords)) {
      if (message.toLowerCase().includes(keyword.toLowerCase())) {
        return response;
      }
    }

    return null;
  }

  // Set user state
  setUserState(chatId, state) {
    this.userStates.set(chatId, state);
  }

  // Get user state
  getUserState(chatId) {
    return this.userStates.get(chatId);
  }

  // Clear user state
  clearUserState(chatId) {
    this.userStates.delete(chatId);
  }

  // Handle user message input
  async handleUserInput(msg) {
    const chatId = msg.chat.id;
    const userState = this.getUserState(chatId);
    
    // Check if timeout (5 minutes)
    if (Date.now() - userState.timestamp > 5 * 60 * 1000) {
      this.clearUserState(chatId);
      await this.bot.sendMessage(chatId, '⏰ Operation timed out, automatically cancelled. Please resend the command.');
      return;
    }

    const userInput = msg.text.trim();

    // Process input based on user state
    switch (userState.action) {
      case 'analyze_token':
        await this.handleAnalyzeInput(chatId, userInput);
        break;
      case 'setup_monitor':
        await this.handleMonitorInput(chatId, userInput);
        break;
      case 'query_wallet':
        await this.handleWalletInput(chatId, userInput);
        break;
      case 'ai_chat':
        await this.handleChatInput(chatId, userInput);
        break;
      default:
        this.clearUserState(chatId);
        await this.bot.sendMessage(chatId, '❌ Unknown operation state, reset. Please resend the command.');
    }
  }

  // Handle token analysis input
  async handleAnalyzeInput(chatId, contractAddress) {
    try {
      // Validate address format
      if (!this.okxRPC.isValidAddress(contractAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid contract address format!\n\nPlease resend the correct CA address:\n\`0x1234567890abcdef...\`', { parse_mode: 'Markdown' });
        return;
      }

      // Clear user state
      this.clearUserState(chatId);

      // Send processing message
      const processingMsg = await this.bot.sendMessage(chatId, '🔍 **Analyzing token...**\n\n⏳ Please wait, AI is generating professional analysis report...');

      try {
        // Get token information
        const tokenData = await this.okxRPC.getTokenInfo(contractAddress);
        const chainData = await this.okxRPC.getChainStats();
        
        // AI generate narrative
        const narrative = await this.openaiService.generateTokenNarrative(
          contractAddress, 
          tokenData, 
          chainData
        );
        
        // Ensure narrative is in string format
        const narrativeText = this.ensureStringResponse(narrative);

        const resultMessage = `
🎯 **Token Analysis Result**

📋 **Basic Information**
• Name: ${tokenData.name}
• Symbol: ${tokenData.symbol}
• Total Supply: ${tokenData.totalSupply}
• Decimals: ${tokenData.decimals}

🔗 **On-chain Data**
• Block Height: ${chainData.blockNumber}
• Gas Price: ${chainData.gasPrice} Gwei
• Chain ID: ${chainData.chainId}

🧠 **AI Narrative Analysis**
${narrativeText}

🔍 **Block Explorer**
${tokenData.explorer}
        `;
        
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);

        // Clean Markdown format and send analysis result
        const cleanedResult = this.cleanMarkdown(resultMessage);
        try {
          await this.bot.sendMessage(chatId, cleanedResult, { parse_mode: 'Markdown' });
        } catch (markdownError) {
          console.warn('Markdown format sending failed, using plain text:', markdownError.message);
          await this.bot.sendMessage(chatId, cleanedResult);
        }

      } catch (error) {
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);
        throw error;
      }

    } catch (error) {
      this.clearUserState(chatId);
      await this.bot.sendMessage(chatId, `❌ Token analysis failed: ${error.message}\n\nPlease try again or contact the administrator.`);
    }
  }

  // Handle wallet monitoring input
  async handleMonitorInput(chatId, walletAddress) {
    try {
      // Validate address format
      if (!this.okxRPC.isValidAddress(walletAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid wallet address format!\n\nPlease resend the correct wallet address:\n\`0x1234567890abcdef...\`', { parse_mode: 'Markdown' });
        return;
      }

      // Clear user state
      this.clearUserState(chatId);

      // Send processing message
      const processingMsg = await this.bot.sendMessage(chatId, '🔔 **Setting up wallet monitoring...**\n\n⏳ Please wait, configuring monitoring system...');

      try {
        // Use the real wallet monitoring service
        const result = await this.walletMonitor.addWalletMonitor(walletAddress, chatId, 'buy');
        
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);

        // Send success message
        await this.bot.sendMessage(chatId, 
          `✅ **Wallet monitoring setup successful!**\n\n📍 Monitoring Address: \`${walletAddress}\`\n🔔 Notification Type: Buy Transaction\n⏰ Setup Time: ${new Date().toLocaleString('zh-CN')}\n\nNow monitoring buy transactions for this wallet!\n\n💡 **Monitoring Content:**\n• OKC balance changes\n• Token quantity changes\n• Automatically push notifications`
        );

      } catch (error) {
        // Try to delete processing message (safely)
        try {
          await this.bot.deleteMessage(chatId, processingMsg.message_id);
        } catch (deleteError) {
          console.warn('Failed to delete processing message:', deleteError.message);
          // Continue execution, does not affect main functionality
        }
        throw error;
      }

    } catch (error) {
      this.clearUserState(chatId);
      await this.bot.sendMessage(chatId, `❌ Wallet monitoring setup failed: ${error.message}\n\nPlease try again or contact the administrator.`);
    }
  }

  // Handle wallet query input
  async handleWalletInput(chatId, walletAddress) {
    try {
      // Validate address format
      if (!this.okxRPC.isValidAddress(walletAddress)) {
        await this.bot.sendMessage(chatId, '❌ Invalid wallet address format!\n\nPlease resend the correct wallet address:\n\`0x1234567890abcdef...\`', { parse_mode: 'Markdown' });
        return;
      }

      // Clear user state
      this.clearUserState(chatId);

      // Send processing message
      const processingMsg = await this.bot.sendMessage(chatId, '🔍 **Querying wallet...**\n\n⏳ Please wait, getting on-chain data...');

      try {
        // Query wallet information
        const balance = await this.okxRPC.getWalletBalance(walletAddress);
        const contractInfo = await this.okxRPC.getContractCode(walletAddress);
        
        const walletMessage = `
💰 **Wallet Information**

📍 **Address**: \`${walletAddress}\`
💎 **OKC Balance**: ${balance.ethBalance} OKC
🔗 **Chain ID**: ${balance.chainId}

📋 **Contract Information**
• Is Contract: ${contractInfo.hasCode ? 'Yes' : 'No'}
• Code Length: ${contractInfo.codeLength} characters
        `;
        
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);

        // Clean Markdown format and send query result
        const cleanedWalletMessage = this.cleanMarkdown(walletMessage);
        try {
          await this.bot.sendMessage(chatId, cleanedWalletMessage, { parse_mode: 'Markdown' });
        } catch (markdownError) {
          console.warn('Wallet information Markdown sending failed, using plain text:', markdownError.message);
          await this.bot.sendMessage(chatId, cleanedWalletMessage);
        }

      } catch (error) {
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);
        throw error;
      }

    } catch (error) {
      this.clearUserState(chatId);
      await this.bot.sendMessage(chatId, `❌ Wallet query failed: ${error.message}\n\nPlease try again or contact the administrator.`);
    }
  }

  // Handle AI chat input
  async handleChatInput(chatId, message) {
    try {
      // Clear user state
      this.clearUserState(chatId);

      // Send processing message
      const processingMsg = await this.bot.sendMessage(chatId, '🤖 **AI is thinking...**\n\n⏳ Please wait, generating reply...');

      try {
        // Call AI chat
        const response = await this.openaiService.chat(message, '');
        
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);

        // Ensure response is in string format
        const responseText = this.ensureStringResponse(response);
        
        // Clean Markdown format to prevent parsing errors
        const cleanedResponse = this.cleanMarkdown(responseText);
        
        // Send simplified AI reply format
        await this.bot.sendMessage(chatId, `🤖 AI Answer\n\n${cleanedResponse}`);

      } catch (error) {
        // Safely delete processing message
        await this.safeDeleteMessage(chatId, processingMsg.message_id);
        throw error;
      }

    } catch (error) {
      this.clearUserState(chatId);
      await this.bot.sendMessage(chatId, `❌ AI chat failed: ${error.message}\n\nPlease try again or contact the administrator.`);
    }
  }

  // Handle cancel operation callback
  async handleCancelOperation(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    
    // Clear user state
    this.clearUserState(chatId);
    
    // Try to delete original message (safely)
    try {
      await this.bot.deleteMessage(chatId, callbackQuery.message.message_id);
    } catch (deleteError) {
      console.warn('Failed to delete original message:', deleteError.message);
      // Continue execution, does not affect main functionality
    }
    
    // Send cancellation confirmation
    await this.bot.sendMessage(chatId, '❌ Operation cancelled.\n\n�� If you need to use the function, please resend the command.');
  }

  // Start bot
  start() {
    console.log('🤖 Telegram Bot started successfully!');
    console.log('📱 Use /start to start using');
    
    // Test ensureStringResponse function
    console.log('🧪 Testing ensureStringResponse function:');
    console.log('String:', this.ensureStringResponse('Hello World'));
    console.log('Object:', this.ensureStringResponse({ message: 'Test', code: 200 }));
    console.log('Number:', this.ensureStringResponse(123));
    console.log('Null:', this.ensureStringResponse(null));
  }

  // Stop bot
  stop() {
    this.bot.stopPolling();
    console.log('🤖 Telegram Bot stopped');
  }
}

module.exports = TelegramBotService;

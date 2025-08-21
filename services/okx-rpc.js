const { ethers } = require('ethers');
const axios = require('axios');

class OKXRPCService {
  constructor() {
    // Only use XLayer network
    this.network = {
      name: 'XLayer',
      rpcUrl: 'https://rpc.xlayer.tech',
      chainId: 196,
      explorer: 'https://www.xlayer.tech'
    };
    
    // Initialize XLayer provider
    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
  }

  // Resolve IPFS/HTTP metadata URL
  resolveMetadataUrl(uri) {
    if (!uri) return uri;
    const u = String(uri).trim();
    if (u.startsWith('ipfs://')) {
      const cid = u.replace('ipfs://', '').replace(/^ipfs\//, '');
      // Use reliable public gateway
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return u;
  }

  // Read DEX factory contract information (prioritize UniswapV2 factory pattern detection)
  async getDexFactoryInfo(factoryAddress, maxPairs = 10) {
    const result = {
      address: factoryAddress,
      network: this.network.name,
      chainId: this.network.chainId,
      explorer: `${this.network.explorer}/address/${factoryAddress}`,
      detectedType: 'Unknown',
      codeLength: 0,
      pairsLength: null,
      recentPairs: [],
    };

    // Validate contract code
    const code = await this.provider.getCode(factoryAddress);
    result.codeLength = code.length;
    if (code === '0x' || code.length <= 2) {
      throw new Error('Contract address does not exist or has been destroyed');
    }

    // UniswapV2 factory minimal ABI
    const uniV2FactoryAbi = [
      'function allPairsLength() view returns (uint256)',
      'function allPairs(uint256) view returns (address)',
      'function getPair(address,address) view returns (address)',
      'function feeTo() view returns (address)',
      'function feeToSetter() view returns (address)',
      'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)'
    ];

    // Other possible minimal ABIs (avoid errors due to implementation differences)
    const altFactoryAbis = [
      [
        'function pairs(address,address) view returns (address)'
      ],
      [
        'function createPair(address,address) external returns (address)'
      ]
    ];

    // First try UniswapV2 factory interface
    try {
      const factory = new ethers.Contract(factoryAddress, uniV2FactoryAbi, this.provider);
      const length = await factory.allPairsLength();
      result.detectedType = 'UniswapV2FactoryLike';
      result.pairsLength = Number(length);

      // Read recent pairs (maximum maxPairs)
      const toFetch = Math.min(result.pairsLength, maxPairs);
      for (let i = result.pairsLength - 1; i >= 0 && result.recentPairs.length < toFetch; i--) {
        try {
          const pairAddr = await factory.allPairs(i);
          result.recentPairs.push(pairAddr);
        } catch (_) {
          break;
        }
      }

      // If couldn't get enough pairs, try event scanning to complete
      if (result.recentPairs.length < toFetch) {
        try {
          const latest = await this.provider.getBlockNumber();
          const fromBlock = Math.max(0, latest - 200000);
          const pairCreatedTopic = ethers.id('PairCreated(address,address,address,uint256)');
          const logs = await this.provider.getLogs({
            address: factoryAddress,
            topics: [pairCreatedTopic],
            fromBlock,
            toBlock: 'latest'
          });
          const iface = new ethers.Interface([ 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)' ]);
          for (let i = logs.length - 1; i >= 0 && result.recentPairs.length < toFetch; i--) {
            try {
              const parsed = iface.parseLog(logs[i]);
              const pair = parsed.args.pair;
              if (pair && !result.recentPairs.includes(pair)) {
                result.recentPairs.push(pair);
              }
            } catch (_) {}
          }
        } catch (_) {}
      }

      return result;
    } catch (err) {
      // Ignore, continue with backup ABI detection
    }

    // Backup ABI detection (try to identify as much as possible)
    for (const abi of altFactoryAbis) {
      try {
        const factory = new ethers.Contract(factoryAddress, abi, this.provider);
        // If can instantiate normally without errors, give type hint
        result.detectedType = 'FactoryLike';
        return result;
      } catch (_) {
        // Continue trying next one
      }
    }

    // Event scanning fallback (unknown factory type)
    try {
      const latest = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 200000);
      // Prioritize UniswapV2 PairCreated event
      const pairCreatedTopic = ethers.id('PairCreated(address,address,address,uint256)');
      const logs = await this.provider.getLogs({
        address: factoryAddress,
        topics: [pairCreatedTopic],
        fromBlock,
        toBlock: 'latest'
      });
      const iface = new ethers.Interface([ 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)' ]);
      for (let i = logs.length - 1; i >= 0 && result.recentPairs.length < maxPairs; i--) {
        try {
          const parsed = iface.parseLog(logs[i]);
          const pair = parsed.args.pair;
          if (pair && !result.recentPairs.includes(pair)) {
            result.recentPairs.push(pair);
          }
        } catch (_) {}
      }
      if (result.recentPairs.length > 0) {
        result.detectedType = result.detectedType === 'Unknown' ? 'FactoryLike' : result.detectedType;
      }
    } catch (_) {}

    return result;
  }

  // Get token information - specifically optimized for XLayer PumpToken
  async getTokenInfo(contractAddress) {
    try {
      console.log('🚀 Detecting PumpToken on XLayer network...');
      
      // Get contract code
      const code = await this.provider.getCode(contractAddress);
      console.log(`Detected contract code length: ${code.length}`);

      if (code === '0x' || code.length <= 2) {
        throw new Error('Contract address does not exist or has been destroyed');
      }

      // Use PumpuFactory API to get token information
      return await this.getPumpTokenInfo(contractAddress);
      
    } catch (error) {
      console.error('Failed to get token information:', error);
      throw new Error(`Unable to get token information: ${error.message}`);
    }
  }

  // Get PumpToken information (XLayer network)
  async getPumpTokenInfo(contractAddress) {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        [
          'function description() external view returns (string memory)',
          'function image() external view returns (string memory)',
          'function website() external view returns (string memory)',
          'function telegram() external view returns (string memory)',
          'function twitter() external view returns (string memory)',
          'function decimals() external view returns (uint8)',
          'function totalSupply() external view returns (uint256)',
          // v1 Token interface extension: directly return metadata URI
          'function uri() external view returns (string)'
        ],
        this.provider
      );

      console.log('📡 Calling PumpuFactory API...');

      // Get PumpToken specific information
      const [
        description, image, website, telegram, twitter,
        decimals, totalSupply, metadataUri
      ] = await Promise.allSettled([
        contract.description(),
        contract.image(),
        contract.website(),
        contract.telegram(),
        contract.twitter(),
        contract.decimals(),
        contract.totalSupply(),
        contract.uri()
      ]);

      // Try different ABIs to get name and symbol
      let name, symbol;
      try {
        // First try string type
        const nameContract = new ethers.Contract(contractAddress, ['function name() external view returns (string memory)'], this.provider);
        name = await nameContract.name();
      } catch (e) {
        try {
          // Then try bytes32 type
          const nameContract = new ethers.Contract(contractAddress, ['function name() external view returns (bytes32)'], this.provider);
          const nameBytes = await nameContract.name();
          name = ethers.decodeBytes32String(nameBytes);
        } catch (e2) {
          name = 'Unknown';
        }
      }

      try {
        // First try string type
        const symbolContract = new ethers.Contract(contractAddress, ['function symbol() external view returns (string memory)'], this.provider);
        symbol = await symbolContract.symbol();
      } catch (e) {
        try {
          // Then try bytes32 type
          const symbolContract = new ethers.Contract(contractAddress, ['function symbol() external view returns (bytes32)'], this.provider);
          const symbolBytes = await symbolContract.symbol();
          symbol = ethers.decodeBytes32String(symbolBytes);
        } catch (e2) {
          symbol = 'UNKNOWN';
        }
      }

      // Process results
      const result = {
        address: contractAddress,
        network: this.network.name,
        chainId: this.network.chainId,
        explorer: `${this.network.explorer}/token/${contractAddress}`,
        isPumpToken: true,
        contractCodeLength: (await this.provider.getCode(contractAddress)).length,
        detectionMethod: 'PumpuFactory API'
      };

      // Add basic information (prioritize display during AI analysis)
      result.name = name || 'Unknown';
      result.symbol = symbol || 'UNKNOWN';
      if (decimals.status === 'fulfilled') result.decimals = decimals.value?.toString() || '18';
      if (totalSupply.status === 'fulfilled') result.totalSupply = totalSupply.value?.toString() || '0';

      // Add PumpToken specific "narrative" information (prioritize display during AI analysis)
      if (description.status === 'fulfilled') result.description = description.value || '';
      if (image.status === 'fulfilled') result.image = image.value || '';
      if (website.status === 'fulfilled') result.website = website.value || '';
      if (telegram.status === 'fulfilled') result.telegram = telegram.value || '';
      if (twitter.status === 'fulfilled') result.twitter = twitter.value || '';

      // Create AI analysis friendly basic information summary (highlight official media information, hide technical details)
      result.basicInfo = {
        name: result.name || 'Unknown',
        symbol: result.symbol || 'UNKNOWN',
        description: result.description || '',
        image: result.image || '',
        website: result.website || '',
        telegram: result.telegram || '',
        twitter: result.twitter || ''
      };

      // Create official media information summary (for AI analysis)
      result.mediaInfo = {
        name: result.name || 'Unknown',
        symbol: result.symbol || 'UNKNOWN',
        description: result.description || '',
        image: result.image || '',
        website: result.website || '',
        telegram: result.telegram || '',
        twitter: result.twitter || '',
        metadataUri: result.metadataUri || ''
      };

      // Process Token.uri() returned metadata
      if (metadataUri.status === 'fulfilled' && metadataUri.value) {
        const rawUri = String(metadataUri.value).trim();
        result.metadataUri = rawUri;
        try {
          const resolvedUrl = this.resolveMetadataUrl(rawUri);
          const resp = await axios.get(resolvedUrl, { timeout: 8000, validateStatus: () => true });
          if (resp && resp.status >= 200 && resp.status < 300 && resp.data) {
            const metadata = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
            result.metadata = metadata;
            result.metadataResolved = true;
            result.detectionMethod += ' + Token.uri()';
                         // If basic information is missing, supplement with metadata
             if (!result.name && metadata.name) result.name = metadata.name;
             if (!result.symbol && metadata.symbol) result.symbol = metadata.symbol;
             if (!result.image && metadata.image) result.image = metadata.image;
             if (!result.website && metadata.website) result.website = metadata.website;
             if (!result.telegram && metadata.telegram) result.telegram = metadata.telegram;
             // Process Twitter field (support both twitter and x field names)
             if (!result.twitter) {
               if (metadata.twitter) result.twitter = metadata.twitter;
               else if (metadata.x) result.twitter = metadata.x;
             }

            // Update AI analysis friendly basic information summary (ensure all fields have valid values)
            result.basicInfo = {
              name: result.name || 'Unknown',
              symbol: result.symbol || 'UNKNOWN',
              description: result.description || '',
              image: result.image || '',
              website: result.website || '',
              telegram: result.telegram || '',
              twitter: result.twitter || ''
            };

            // Update official media information summary
            result.mediaInfo = {
              name: result.name || 'Unknown',
              symbol: result.symbol || 'UNKNOWN',
              description: result.description || '',
              image: result.image || '',
              website: result.website || '',
              telegram: result.telegram || '',
              twitter: result.twitter || '',
              metadataUri: result.metadataUri || ''
            };
          } else {
            result.metadataResolved = false;
          }
        } catch (e) {
          console.log('Failed to parse Token.uri() metadata:', e.message);
          result.metadataResolved = false;
        }
      }

      console.log('✅ PumpToken information retrieved successfully');
      console.log('📊 Token official media information:', {
        name: result.name,
        symbol: result.symbol,
        description: result.description || 'No description',
        image: result.image || 'No image',
        website: result.website || 'No website',
        telegram: result.telegram || 'No Telegram',
        twitter: result.twitter || 'No Twitter'
      });
      console.log('🔗 Official media links:', {
        website: result.website || '❌ No website',
        telegram: result.telegram || '❌ No Telegram', 
        twitter: result.twitter || '❌ No Twitter'
      });

      return result;

    } catch (error) {
      console.error('PumpToken API call failed:', error);
      throw new Error(`PumpToken API call failed: ${error.message}`);
    }
  }

  // Get wallet balance
  async getWalletBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      const ethBalance = ethers.formatEther(balance);
      
      return {
        address,
        ethBalance,
        weiBalance: balance.toString(),
        chainId: this.network.chainId
      };
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      throw new Error(`Unable to get wallet balance: ${error.message}`);
    }
  }

  // Get token balance
  async getTokenBalance(contractAddress, walletAddress) {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        this.provider
      );

      const [balance, decimals] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals()
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        contractAddress,
        walletAddress,
        balance: formattedBalance,
        rawBalance: balance.toString(),
        decimals: decimals.toString()
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw new Error(`Unable to get token balance: ${error.message}`);
    }
  }

  // Get transaction history
  async getTransactionHistory(address, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${this.network.explorer}/api/v5/account/transaction-records`, {
        params: {
          address,
          page,
          limit,
          chainId: this.network.chainId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw new Error(`Unable to get transaction history: ${error.message}`);
    }
  }

  // Get token price data
  async getTokenPriceData(contractAddress) {
    try {
      // Here can integrate CoinGecko or other price APIs
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/xlayer`, {
        params: {
          contract_addresses: contractAddress,
          vs_currencies: 'usd,btc,eth'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get token price:', error);
      throw new Error(`Unable to get token price: ${error.message}`);
    }
  }

  // Get on-chain data statistics
  async getChainStats() {
    try {
      const [blockNumber, gasPrice] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData()
      ]);

      return {
        chainId: this.network.chainId,
        blockNumber,
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
      };
    } catch (error) {
      console.error('Failed to get on-chain statistics:', error);
      throw new Error(`Unable to get on-chain statistics: ${error.message}`);
    }
  }

  // Validate address format
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  // Get contract code
  async getContractCode(address) {
    try {
      const code = await this.provider.getCode(address);
      return {
        address,
        hasCode: code !== '0x',
        codeLength: code.length
      };
    } catch (error) {
      console.error('Failed to get contract code:', error);
      throw new Error(`Unable to get contract code: ${error.message}`);
    }
  }
}

module.exports = OKXRPCService;

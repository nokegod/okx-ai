const { ethers } = require('ethers');

async function testPumpu() {
  console.log('🚀 Testing PumpuFactory and PumpToken detection...');
  
  const rpcUrl = 'https://exchainrpc.okex.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  try {
    // Test PumpuFactory contract
    console.log('1. Testing PumpuFactory contract...');
    const pumpuFactoryAddress = '0xC4cEBDf3D4bBF14812DcCB1ccB20AB26EA547f44';
    
    const factoryCode = await provider.getCode(pumpuFactoryAddress);
    console.log('✅ PumpuFactory contract code length:', factoryCode.length);
    console.log('✅ Contract code:', factoryCode);
    
    // Code length 2 usually means contract exists but may not be standard
    if (factoryCode.length > 2) {
      console.log('✅ PumpuFactory contract exists');
      
      // Try to get contract information - use multiple possible ABIs
      const possibleABIs = [
        // PumpuFactory possible ABI
        [
          'function description() external view returns (string memory)',
          'function image() external view returns (string memory)',
          'function website() external view returns (string memory)',
          'function telegram() external view returns (string memory)',
          'function twitter() external view returns (string memory)',
          'function Deployed(address indexed addr, uint256 amount)',
          'event Deployed(address indexed addr, uint256 amount)'
        ],
        // Standard factory contract ABI
        [
          'function createPair(address tokenA, address tokenB) external returns (address pair)',
          'function getPair(address tokenA, address tokenB) external view returns (address pair)',
          'function allPairs(uint) external view returns (address pair)',
          'function allPairsLength() external view returns (uint)'
        ],
        // Minimal ABI
        [
          'function description() external view returns (string)',
          'function image() external view returns (string)',
          'function website() external view returns (string)'
        ]
      ];
      
      console.log('2. Testing PumpuFactory contract methods...');
      
      for (let i = 0; i < possibleABIs.length; i++) {
        try {
          const contract = new ethers.Contract(pumpuFactoryAddress, possibleABIs[i], provider);
          console.log(`\nTrying ABI ${i}:`);
          
          // Try to call methods
          try {
            const description = await contract.description();
            console.log(`✅ ABI ${i} description():`, description);
          } catch (error) {
            console.log(`❌ ABI ${i} description() failed:`, error.message);
          }
          
          try {
            const image = await contract.image();
            console.log(`✅ ABI ${i} image():`, image);
          } catch (error) {
            console.log(`❌ ABI ${i} image() failed:`, error.message);
          }
          
          try {
            const website = await contract.website();
            console.log(`✅ ABI ${i} website():`, website);
          } catch (error) {
            console.log(`❌ ABI ${i} website() failed:`, error.message);
          }
          
        } catch (error) {
          console.log(`❌ ABI ${i} initialization failed:`, error.message);
        }
      }
      
      // Try to get event logs
      console.log('\n3. Trying to get Deployed events...');
      try {
        const filter = {
          address: pumpuFactoryAddress,
          topics: [
            ethers.id('Deployed(address,uint256)')
          ]
        };
        
        const logs = await provider.getLogs(filter);
        console.log('✅ Deployed event count:', logs.length);
        
        if (logs.length > 0) {
          console.log('Latest Deployed event:');
          const latestLog = logs[logs.length - 1];
          console.log('Block number:', latestLog.blockNumber);
          console.log('Transaction hash:', latestLog.transactionHash);
          console.log('Data:', latestLog.data);
        }
      } catch (error) {
        console.log('❌ Failed to get events:', error.message);
      }
      
    } else if (factoryCode.length === 2) {
      console.log('⚠️  Contract code length abnormal (2), may be proxy contract or special structure');
      console.log('Trying to analyze contract type...');
      
      // Try to get contract storage
      try {
        const slot0 = await provider.getStorage(pumpuFactoryAddress, 0);
        console.log('Storage slot 0:', slot0);
      } catch (error) {
        console.log('Failed to get storage:', error.message);
      }
      
      // Try to get transaction history
      try {
        const txCount = await provider.getTransactionCount(pumpuFactoryAddress);
        console.log('Transaction count:', txCount);
      } catch (error) {
        console.log('Failed to get transaction count:', error.message);
      }
      
    } else {
      console.log('❌ PumpuFactory contract does not exist');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPumpu();

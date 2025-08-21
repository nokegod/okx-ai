const { ethers } = require('ethers');

async function testNetwork() {
  console.log('🌐 Testing PumpuFactory contracts on different networks...');
  
  const networks = [
    {
      name: 'OKX Chain (OKC)',
      rpcUrl: 'https://exchainrpc.okex.org',
      chainId: 66,
      factoryAddress: '0xC4cEBDf3D4bBF14812DcCB1ccB20AB26EA547f44'
    },
    {
      name: 'XLayer',
      rpcUrl: 'https://rpc.xlayer.tech',
      chainId: 196,
      factoryAddress: '0xC4cEBDf3D4bBF14812DcCB1ccB20AB26EA547f44'
    }
  ];
  
  for (const network of networks) {
    try {
      console.log(`\n🔍 Testing ${network.name}...`);
      
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      
      // Test connection
      try {
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Block number: ${blockNumber}`);
      } catch (error) {
        console.log(`❌ Connection failed: ${error.message}`);
        continue;
      }
      
      // Test contract address
      try {
        const code = await provider.getCode(network.factoryAddress);
        console.log(`✅ Contract code length: ${code.length}`);
        console.log(`✅ Contract code: ${code}`);
        
        if (code === '0x' || code.length <= 2) {
          console.log(`❌ Contract does not exist or has been destroyed`);
        } else {
          console.log(`✅ Contract exists!`);
          
          // Try to get basic information
          const contract = new ethers.Contract(
            network.factoryAddress,
            [
              'function description() external view returns (string memory)',
              'function image() external view returns (string memory)',
              'function website() external view returns (string memory)'
            ],
            provider
          );
          
          try {
            const description = await contract.description();
            console.log(`✅ Description: ${description}`);
          } catch (error) {
            console.log(`❌ Failed to call description(): ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Contract code abnormal: ${code}`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to get contract code: ${error.message}`);
    }
  }
}

testNetwork();

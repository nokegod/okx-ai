const { ethers } = require('ethers');

async function testRPC() {
  console.log('🧪 Testing OKX RPC connection and PumpuFactory contract...');
  
  const rpcUrl = 'https://exchainrpc.okex.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  try {
    // Test basic connection
    console.log('1. Testing RPC connection...');
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Current block number:', blockNumber);
    
    // Test PumpuFactory contract
    console.log('2. Testing PumpuFactory contract...');
    const pumpuFactoryAddress = '0xC4cEBDf3D4bBF14812DcCB1ccB20AB26EA547f44';
    
    try {
      const factoryCode = await provider.getCode(pumpuFactoryAddress);
      console.log('✅ PumpuFactory contract code length:', factoryCode.length);
      
      if (factoryCode !== '0x') {
        console.log('✅ PumpuFactory contract exists');
        
        // Try to get contract information
        const contract = new ethers.Contract(
          pumpuFactoryAddress,
          [
            'function description() external view returns (string memory)',
            'function image() external view returns (string memory)',
            'function website() external view returns (string memory)',
            'function telegram() external view returns (string memory)',
            'function twitter() external view returns (string memory)'
          ],
          provider
        );
        
        console.log('3. Testing PumpuFactory contract methods...');
        
        try {
          const description = await contract.description();
          console.log('✅ description():', description);
        } catch (error) {
          console.log('❌ description() call failed:', error.message);
        }
        
        try {
          const image = await contract.image();
          console.log('✅ image():', image);
        } catch (error) {
          console.log('❌ image() call failed:', error.message);
        }
        
        try {
          const website = await contract.website();
          console.log('✅ website():', website);
        } catch (error) {
          console.log('❌ website() call failed:', error.message);
        }
        
        try {
          const telegram = await contract.telegram();
          console.log('✅ telegram():', telegram);
        } catch (error) {
          console.log('❌ telegram() call failed:', error.message);
        }
        
        try {
          const twitter = await contract.twitter();
          console.log('✅ twitter():', twitter);
        } catch (error) {
          console.log('❌ twitter() call failed:', error.message);
        }
        
      } else {
        console.log('❌ PumpuFactory contract does not exist or has been destroyed');
      }
    } catch (error) {
      console.log('❌ Failed to get PumpuFactory contract code:', error.message);
    }
    
  } catch (error) {
    console.error('❌ RPC test failed:', error.message);
  }
}

testRPC();

require('dotenv').config();
const { ethers } = require('ethers');

async function checkDeployment() {
    try {
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        const contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        
        console.log(`🔍 Checking deployment at address: ${contractAddress}`);
        
        // Get the bytecode at the address
        const bytecode = await provider.getCode(contractAddress);
        console.log(`📄 Bytecode length: ${bytecode.length}`);
        console.log(`📄 Bytecode (first 100 chars): ${bytecode.substring(0, 100)}...`);
        
        if (bytecode === '0x') {
            console.log('❌ No contract deployed at this address');
        } else {
            console.log('✅ Contract is deployed');
            
            // Check network
            const network = await provider.getNetwork();
            console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
            
            // Check latest block
            const blockNumber = await provider.getBlockNumber();
            console.log(`🧱 Latest block: ${blockNumber}`);
        }
        
    } catch (error) {
        console.error('❌ Error checking deployment:', error.message);
    }
}

checkDeployment();
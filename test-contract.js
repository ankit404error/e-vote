require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function testContract() {
    try {
        console.log('🔗 Testing SecureVoting contract...');
        
        // Initialize provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || 'http://localhost:8545');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Load contract ABI
        const contractArtifactPath = path.join(__dirname, 'artifacts/contracts/SecureVoting.sol/SecureVoting.json');
        const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
        const contractABI = contractArtifact.abi;
        
        // Initialize contract
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
        
        console.log(`📄 Contract address: ${process.env.CONTRACT_ADDRESS}`);
        console.log(`👤 Wallet address: ${wallet.address}`);
        
        // Test totalVotes
        console.log('\n📊 Testing totalVotes()...');
        const totalVotes = await contract.totalVotes();
        console.log(`Total votes: ${totalVotes}`);
        
        // Test getResults
        console.log('\n📊 Testing getResults()...');
        const results = await contract.getResults();
        console.log(`Results: Candidate A: ${results[0]}, Candidate B: ${results[1]}, Candidate C: ${results[2]}, Total: ${results[3]}`);
        
        // Test hasAddressVoted
        console.log('\n🔍 Testing hasAddressVoted()...');
        const hasVoted = await contract.hasAddressVoted(wallet.address);
        console.log(`Has wallet voted: ${hasVoted}`);
        
        console.log('\n✅ All contract tests passed!');
        
    } catch (error) {
        console.error('❌ Contract test failed:', error);
    }
}

testContract();
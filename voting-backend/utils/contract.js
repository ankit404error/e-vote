const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
const {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS
} = process.env;

// Validate required environment variables
if (!SEPOLIA_RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  throw new Error('Missing required environment variables. Check your .env file.');
}

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load contract ABI
const contractArtifactPath = path.join(__dirname, '../artifacts/contracts/SecureVoting.sol/SecureVoting.json');

if (!fs.existsSync(contractArtifactPath)) {
  throw new Error(`Contract artifact not found at: ${contractArtifactPath}. Run 'npm run compile' first.`);
}

const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
const contractABI = contractArtifact.abi;

// Initialize contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Helper function to map candidate names to indices
function getCandidateIndex(candidateName) {
  const mapping = {
    'Candidate A': 0,
    'Candidate B': 1,
    'Candidate C': 2
  };
  return mapping[candidateName];
}

// Cast a vote
async function castVote(token, candidateName) {
  try {
    console.log(`🔗 Casting vote for ${candidateName}...`);
    
    const candidateIndex = getCandidateIndex(candidateName);
    if (candidateIndex === undefined) {
      throw new Error(`Invalid candidate: ${candidateName}`);
    }
    
    // Estimate gas
    const gasEstimate = await contract.vote.estimateGas(candidateIndex, token);
    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    // Send transaction
    const tx = await contract.vote(candidateIndex, token, {
      gasLimit: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
    });
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    // Wait for transaction receipt
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      status: receipt.status
    };
    
  } catch (error) {
    console.error('❌ Error in castVote:', error);
    throw error;
  }
}

// Get voting results
async function getResults() {
  try {
    console.log('📊 Fetching voting results...');
    
    const results = await contract.getResults();
    
    return {
      candidateA: Number(results[0]),
      candidateB: Number(results[1]),
      candidateC: Number(results[2]),
      totalVotes: Number(results[3])
    };
    
  } catch (error) {
    console.error('❌ Error in getResults:', error);
    throw error;
  }
}

// Check if address has voted
async function checkVoterStatus(address) {
  try {
    console.log(`🔍 Checking voter status for ${address}...`);
    
    const hasVoted = await contract.hasAddressVoted(address);
    return hasVoted;
    
  } catch (error) {
    console.error('❌ Error in checkVoterStatus:', error);
    throw error;
  }
}

module.exports = {
  castVote,
  getResults,
  checkVoterStatus,
  contract,
  provider,
  wallet
};

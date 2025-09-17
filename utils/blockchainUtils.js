const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables with fallbacks
const {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS
} = process.env;

let provider = null;
let wallet = null;
let contract = null;
let contractABI = null;
let isInitialized = false;

// Initialize blockchain connection
async function initialize() {
  try {
    console.log('🔗 Initializing master branch blockchain utilities...');
    
    // Initialize provider with fallbacks
    const rpcUrl = SEPOLIA_RPC_URL || 'http://localhost:8545';
    provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log(`✅ Connected to blockchain: ${rpcUrl}`);
    
    // Initialize wallet if private key is available
    if (PRIVATE_KEY) {
      wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      console.log('🔑 Wallet initialized');
    }
    
    // Load contract ABI
    const contractArtifactPath = path.join(__dirname, '../artifacts/contracts/SecureVoting.sol/SecureVoting.json');
    if (fs.existsSync(contractArtifactPath)) {
      const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
      contractABI = contractArtifact.abi;
      console.log('📋 Contract ABI loaded');
    }
    
    // Initialize contract if address and ABI are available
    if (CONTRACT_ADDRESS && contractABI && wallet) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
      console.log(`📄 Contract initialized at: ${CONTRACT_ADDRESS}`);
      
      // Test contract connection
      try {
        const totalVotes = await contract.totalVotes();
        console.log(`📊 Current total votes: ${totalVotes}`);
      } catch (testError) {
        console.warn('⚠️ Contract test call failed:', testError.message);
      }
    }
    
    isInitialized = true;
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize blockchain:', error.message);
    isInitialized = false;
    return false;
  }
}

// Helper function to map candidate names to indices
function getCandidateIndex(candidateName) {
  const mapping = {
    'Candidate A': 0,
    'Candidate B': 1,
    'Candidate C': 2
  };
  return mapping[candidateName];
}

// Cast a vote using master branch pattern
async function castVote(token, candidateName) {
  try {
    if (!isInitialized) {
      await initialize();
    }
    
    if (!contract) {
      throw new Error('Contract not initialized. Check environment variables.');
    }
    
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
    if (!isInitialized) {
      await initialize();
    }
    
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
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
    if (!isInitialized) {
      await initialize();
    }
    
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    console.log(`🔍 Checking voter status for ${address}...`);
    
    const hasVoted = await contract.hasAddressVoted(address);
    return hasVoted;
    
  } catch (error) {
    console.error('❌ Error in checkVoterStatus:', error);
    throw error;
  }
}

// Master branch compatible blockchain utilities
const blockchainUtils = {
  initialize,
  // Master branch pattern: castVote(token, candidateName)
  castVote: async (token, candidateName) => {
    return await castVote(token, candidateName);
  },
  getResults,
  checkVoterStatus,
  hasAddressVoted: checkVoterStatus,
  getAllCandidates: async () => {
    // Return static candidates for compatibility
    const results = await getResults();
    return [
      { id: 1, name: 'Candidate A', party: 'Party A', voteCount: results.candidateA },
      { id: 2, name: 'Candidate B', party: 'Party B', voteCount: results.candidateB },
      { id: 3, name: 'Candidate C', party: 'Party C', voteCount: results.candidateC }
    ];
  }
};

module.exports = blockchainUtils;

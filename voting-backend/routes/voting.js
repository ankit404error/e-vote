const express = require('express');
const { castVote, getResults, checkVoterStatus } = require('../utils/contract');
const router = express.Router();

// Cast a vote
router.post('/cast-vote', async (req, res) => {
  try {
    const { token, candidate } = req.body;
    
    // Validation
    if (!token || !candidate) {
      return res.status(400).json({ 
        error: 'Missing required fields: token and candidate' 
      });
    }
    
    const validCandidates = ['Candidate A', 'Candidate B', 'Candidate C'];
    if (!validCandidates.includes(candidate)) {
      return res.status(400).json({ 
        error: 'Invalid candidate. Must be one of: ' + validCandidates.join(', ') 
      });
    }
    
    console.log(`📝 Processing vote for ${candidate} with token: ${token.substring(0, 20)}...`);
    
    // Cast vote on blockchain
    const result = await castVote(token, candidate);
    
    console.log(`✅ Vote cast successfully! TX: ${result.transactionHash}`);
    
    res.status(200).json({
      success: true,
      message: 'Vote cast successfully!',
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      candidate: candidate,
      gasUsed: result.gasUsed?.toString(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error casting vote:', error);
    
    // Handle specific blockchain errors
    if (error.message.includes('already voted')) {
      return res.status(400).json({ 
        error: 'This address has already voted' 
      });
    }
    
    if (error.message.includes('insufficient funds')) {
      return res.status(500).json({ 
        error: 'Insufficient ETH for gas fees' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to cast vote', 
      message: error.message 
    });
  }
});

// Get voting results
router.get('/results', async (req, res) => {
  try {
    const results = await getResults();
    
    res.status(200).json({
      success: true,
      results: {
        candidateA: results.candidateA,
        candidateB: results.candidateB,
        candidateC: results.candidateC,
        totalVotes: results.totalVotes
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching results:', error);
    res.status(500).json({ 
      error: 'Failed to fetch voting results', 
      message: error.message 
    });
  }
});

// Check if an address has voted
router.get('/voter-status/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address' 
      });
    }
    
    const hasVoted = await checkVoterStatus(address);
    
    res.status(200).json({
      success: true,
      address: address,
      hasVoted: hasVoted,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error checking voter status:', error);
    res.status(500).json({ 
      error: 'Failed to check voter status', 
      message: error.message 
    });
  }
});

module.exports = router;

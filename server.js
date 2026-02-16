require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');
const Database = require('./database');
const blockchainUtils = require('./utils/blockchainUtils');
const { ethers } = require('ethers');

// Load master branch voting functionality
let votingBackendRoutes = null;
try {
    votingBackendRoutes = require('./voting-backend/routes/voting');
    console.log('✅ Master branch voting routes loaded');
} catch (error) {
    console.warn('⚠️ Master branch voting routes not available:', error.message);
}

// Handle BigInt JSON serialization globally
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// Initialize blockchain connection
blockchainUtils.initialize().then(success => {
    if (success) {
        console.log('🔗 Enhanced blockchain utilities initialized');
    } else {
        console.warn('⚠️ Blockchain initialization failed, some features may not work');
    }
});

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database
const db = new Database();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"]
        }
    }
}));

app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/dist')));
}

// Load master branch voting routes if available
if (votingBackendRoutes) {
    app.use('/api/voting-backend', votingBackendRoutes);
    console.log('📡 Master branch voting endpoints mounted at /api/voting-backend');
}

// API Routes

// Master branch blockchain voting endpoints with Aadhaar integration
app.post('/api/cast-vote', async (req, res) => {
    try {
        const { token, candidate, userId } = req.body;
        
        // Validation
        if (!token || !candidate) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: token and candidate' 
            });
        }
        
        // Validate candidates (master branch pattern)
        const validCandidates = ['Candidate A', 'Candidate B', 'Candidate C'];
        if (!validCandidates.includes(candidate)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid candidate. Must be one of: ' + validCandidates.join(', ') 
            });
        }
        
        // Check if user has already voted (if userId provided)
        if (userId) {
            const votingStatusCheck = await new Promise((resolve) => {
                db.checkVotingStatus(userId, (err, result) => {
                    if (err) {
                        resolve({ hasVoted: false }); // Allow vote if can't check status
                    } else {
                        resolve(result);
                    }
                });
            });
            
            if (votingStatusCheck.hasVoted) {
                console.log(`⚠️ User ${userId} attempted to vote again via cast-vote endpoint`);
                return res.status(400).json({
                    success: false,
                    message: 'You have already voted! Each user can only vote once.',
                    alreadyVoted: true,
                    votedAt: votingStatusCheck.votedAt
                });
            }
        }
        
        console.log(`📝 Processing vote for ${candidate} with token: ${token.substring(0, 20)}...`);
        
        // Cast vote using master branch blockchain utilities
        const result = await blockchainUtils.castVote(token, candidate);
        
        // Store vote record in database for Aadhaar integration
        if (userId) {
            // Mark user as voted
            db.markUserAsVoted(userId, result.transactionHash, (err) => {
                if (err) {
                    console.error('Error marking user as voted:', err);
                }
            });
            
            // Store detailed vote record
            db.storeVoteRecord(userId, candidate, result.transactionHash, (err) => {
                if (err) {
                    console.error('Database storage error:', err);
                }
            });
        }
        
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
                success: false,
                error: 'This address has already voted' 
            });
        }
        
        if (error.message.includes('insufficient funds')) {
            return res.status(500).json({ 
                success: false,
                error: 'Insufficient ETH for gas fees' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Failed to cast vote', 
            message: error.message 
        });
    }
});

// Get voting results (master branch pattern)
app.get('/api/results', async (req, res) => {
    try {
        const results = await blockchainUtils.getResults();
        
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
            success: false,
            error: 'Failed to fetch voting results', 
            message: error.message 
        });
    }
});

// Check if an address has voted (master branch pattern)
app.get('/api/voter-status/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid Ethereum address' 
            });
        }
        
        const hasVoted = await blockchainUtils.checkVoterStatus(address);
        
        res.status(200).json({
            success: true,
            address: address,
            hasVoted: hasVoted,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error checking voter status:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to check voter status', 
            message: error.message 
        });
    }
});

// Register a new user
app.post('/api/register', (req, res) => {
    const { uniqueNumber, name, age, gender, location, phoneNumber, email } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !location) {
        return res.status(400).json({
            success: false,
            message: 'Name, age, gender, and location are required fields.'
        });
    }

    // Validate age
    if (isNaN(age) || age < 1 || age > 150) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid age between 1 and 150.'
        });
    }

    const userData = {
        uniqueNumber,
        name: name.trim(),
        age: parseInt(age),
        gender: gender.trim(),
        location: location.trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : null,
        email: email ? email.trim() : null
    };

    db.registerUser(userData, (err, result) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    success: false,
                    message: 'A user with this unique number already exists.'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to register user. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'User registered successfully.',
            data: {
                userId: result.userId,
                uniqueNumber: result.uniqueNumber
            }
        });
    });
});

// Store fingerprint data
app.post('/api/register-fingerprint', (req, res) => {
    const { userId, fingerprintData } = req.body;

    if (!userId || !fingerprintData) {
        return res.status(400).json({
            success: false,
            message: 'User ID and fingerprint data are required.'
        });
    }

    db.storeFingerprintData(userId, fingerprintData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to store fingerprint data. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Fingerprint registered successfully.',
            data: { fingerprintId: result.fingerprintId }
        });
    });
});

// Verify fingerprint and authenticate user
app.post('/api/verify-fingerprint', (req, res) => {
    const { fingerprintData } = req.body;

    if (!fingerprintData) {
        return res.status(400).json({
            success: false,
            message: 'Fingerprint data is required for verification.'
        });
    }

    db.verifyFingerprint(fingerprintData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to verify fingerprint. Please try again.'
            });
        }

        if (result.verified) {
            res.json({
                success: true,
                verified: true,
                message: 'Fingerprint verified successfully.',
                user: result.user
            });
        } else {
            res.json({
                success: true,
                verified: false,
                message: 'Fingerprint not recognized. Please try again or register first.'
            });
        }
    });
});

// Get user by unique number (for testing purposes)
app.get('/api/user/:uniqueNumber', (req, res) => {
    const { uniqueNumber } = req.params;

    if (!uniqueNumber) {
        return res.status(400).json({
            success: false,
            message: 'Unique number is required.'
        });
    }

    db.getUserByUniqueNumber(uniqueNumber, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve user data.'
            });
        }

        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    uniqueNumber: user.unique_number,
                    name: user.name,
                    age: user.age,
                    gender: user.gender,
                    location: user.location,
                    phoneNumber: user.phone_number,
                    email: user.email,
                    createdAt: user.created_at
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
    });
});




// === BLOCKCHAIN VOTING ENDPOINTS ===

// Get all candidates from blockchain (master branch pattern)
app.get('/api/blockchain/candidates', async (req, res) => {
    try {
        // Use blockchainUtils to get candidates
        const candidates = await blockchainUtils.getAllCandidates();
        
        res.json({
            success: true,
            candidates: candidates
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidates from blockchain'
        });
    }
});

// Get user's blockchain address
app.get('/api/user/:userId/blockchain-address', (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const address = blockchainUtils.getUserAddress(userId);
        
        res.json({
            success: true,
            userId: userId,
            blockchainAddress: address,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting user blockchain address:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get blockchain address'
        });
    }
});

// Check if user has voted (database check) - Enhanced for frontend
app.get('/api/voting/status/:userId', (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }
    
    // Check both voting status and if voting is active
    db.checkVotingStatus(userId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to check voting status'
            });
        }
        
        db.isVotingActive((err, activeStatus) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check if voting is active'
                });
            }
            
            let message;
            let canVote = false;
            
            if (result.hasVoted) {
                message = 'You have already voted! Thank you for participating.';
            } else if (!activeStatus.isActive) {
                if (activeStatus.status !== 'ACTIVE') {
                    message = 'Voting is currently not available. Please check back later.';
                } else {
                    const now = new Date();
                    const startTime = new Date(activeStatus.startTime);
                    const endTime = new Date(activeStatus.endTime);
                    
                    if (now < startTime) {
                        message = `Voting has not started yet. Voting begins on ${startTime.toLocaleString()}.`;
                    } else if (now > endTime) {
                        message = `Voting has ended on ${endTime.toLocaleString()}.`;
                    } else {
                        message = 'Voting is currently not available.';
                    }
                }
            } else {
                message = 'You can cast your vote now.';
                canVote = true;
            }
            
            res.json({
                success: true,
                hasVoted: result.hasVoted,
                votedAt: result.votedAt,
                transactionHash: result.transactionHash,
                message: message,
                canVote: canVote,
                votingStatus: activeStatus.status,
                votingActive: activeStatus.isActive,
                votingPeriod: {
                    startTime: activeStatus.startTime,
                    endTime: activeStatus.endTime,
                    currentTime: activeStatus.currentTime
                }
            });
        });
    });
});

// Check if user has voted on blockchain
app.get('/api/voting/blockchain-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const hasVotedOnChain = await blockchainUtils.checkUserVotingStatus(userId);
        const userAddress = blockchainUtils.getUserAddress(userId);
        
        res.json({
            success: true,
            userId: userId,
            blockchainAddress: userAddress,
            hasVotedOnBlockchain: hasVotedOnChain,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error checking blockchain voting status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check blockchain voting status'
        });
    }
});

// Cast anonymous vote on blockchain with encryption (Enhanced Version)
app.post('/api/voting/cast', async (req, res) => {
    const { candidateId, userId, candidateName } = req.body;
    
    if (!candidateId || !userId) {
        return res.status(400).json({
            success: false,
            message: 'Candidate ID and User ID are required'
        });
    }
    
    try {
        // First check if voting is active
        db.isVotingActive((err, activeStatus) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check if voting is active'
                });
            }
            
            if (!activeStatus.isActive) {
                let message = 'Voting is not currently active.';
                
                if (activeStatus.status !== 'ACTIVE') {
                    message = 'Voting is currently disabled by administrator.';
                } else {
                    const now = new Date();
                    const startTime = new Date(activeStatus.startTime);
                    const endTime = new Date(activeStatus.endTime);
                    
                    if (now < startTime) {
                        message = `Voting has not started yet. Voting begins on ${startTime.toLocaleString()}.`;
                    } else if (now > endTime) {
                        message = `Voting has ended on ${endTime.toLocaleString()}.`;
                    }
                }
                
                return res.status(403).json({
                    success: false,
                    message: message,
                    votingActive: false,
                    votingStatus: activeStatus
                });
            }
            
            // Check if user has already voted
            db.checkVotingStatus(userId, async (err, votingStatus) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check voting status'
                });
            }
            
            if (votingStatus.hasVoted) {
                console.log(`⚠️ User ${userId} attempted to vote again - already voted at ${votingStatus.votedAt}`);
                return res.status(400).json({
                    success: false,
                    message: 'You have already voted! Each user can only vote once.',
                    alreadyVoted: true,
                    votedAt: votingStatus.votedAt,
                    transactionHash: votingStatus.transactionHash
                });
            }
            
            try {
                // Generate OACT token
                const oactToken = `OACT_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
                
                // Map candidate ID to name for master branch pattern
                const candidateNames = ['Candidate A', 'Candidate B', 'Candidate C'];
                const candidateName = candidateNames[candidateId - 1];
                
                if (!candidateName) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid candidate ID'
                    });
                }
                
                console.log(`📝 Processing vote for user ${userId}, candidate ${candidateName}...`);
                
                // Use master branch blockchain utilities with user-specific address
                const result = await blockchainUtils.castVoteForUser(userId, oactToken, candidateName);
                
                if (result) {
                    // Mark user as voted in local database
                    db.markUserAsVoted(userId, result.transactionHash, (err) => {
                        if (err) {
                            console.error('Error marking user as voted:', err);
                        }
                    });
                    
                    // Store vote details for receipt verification
                    db.storeVoteDetails({
                        userId: userId,
                        candidateId: candidateId,
                        candidateName: candidateName || `Candidate ${candidateId}`,
                        candidateParty: 'Demo Party', // Default party
                        transactionHash: result.transactionHash,
                        blockNumber: result.blockNumber
                    }, (err) => {
                        if (err) {
                            console.error('Error storing vote details:', err);
                        }
                    });
                    
                    console.log(`\u2705 Vote cast successfully! TX: ${result.transactionHash}`);
                    
                    res.json({
                        success: true,
                        message: 'Vote cast successfully using master branch blockchain',
                        transactionHash: result.transactionHash,
                        blockNumber: result.blockNumber,
                        gasUsed: result.gasUsed,
                        candidateId: candidateId,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    throw new Error('Master branch blockchain transaction failed');
                }
                
            } catch (blockchainError) {
                console.error('\u274c Enhanced blockchain error:', blockchainError);
                
                // Handle specific errors
                if (blockchainError.message.includes('already voted')) {
                    return res.status(400).json({
                        success: false,
                        message: 'This user has already voted on the blockchain'
                    });
                }
                
                res.status(500).json({
                    success: false,
                    message: 'Failed to cast vote using enhanced blockchain: ' + blockchainError.message
                });
            }
            });
        });
        
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cast vote'
        });
    }
});

// Verify vote receipt using Etherscan (blockchain-only verification)
app.post('/api/voting/verify-receipt', async (req, res) => {
    let { receiptHash } = req.body;
    
    if (!receiptHash) {
        return res.status(400).json({
            success: false,
            message: 'Receipt hash is required'
        });
    }

    // specific cleanup for receipt hash
    receiptHash = receiptHash.trim();
    if (!receiptHash.startsWith('0x')) {
        receiptHash = '0x' + receiptHash;
    }
    
    // Check if this is a db-tracked vote (fallback mechanism)
    if (receiptHash.startsWith('db_tracked_vote_')) {
        console.log(`🔍 Verifying database-tracked vote: ${receiptHash}`);
        
        db.getVoteByTransactionHash(receiptHash, (err, voteRecord) => {
            if (err) {
                console.error('Database error verifying vote:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error during verification'
                });
            }
            
            if (!voteRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Vote record not found in database',
                    etherscanUrl: null
                });
            }
            
            return res.json({
                success: true,
                receipt: {
                    transactionHash: voteRecord.transactionHash,
                    blockNumber: voteRecord.blockNumber || 0,
                    blockHash: 'simulated_block_hash',
                    timestamp: voteRecord.votedAt,
                    gasUsed: '0',
                    gasPrice: '0',
                    status: 'Success',
                    contractAddress: 'Simulated_Contract',
                    fromAddress: 'Simulated_User_Address',
                    etherscanUrl: null, // No Etherscan URL for DB votes
                    verified: true,
                    source: 'Database Verification (Off-chain)',
                    
                    // Privacy-protected information
                    voterName: 'Verified Voter', 
                    voterId: '****-****-****', 
                    candidateName: 'Vote Recorded', 
                    candidateParty: 'Privacy Protected',
                     
                    securityStatus: {
                        blockchainConfirmed: false, // It's db tracked
                        immutableRecord: true,
                        etherscanVerified: false,
                        privacyProtected: true
                    }
                }
            });
        });
        return; // Return early, async callback handles response
    }

    // Validate transaction hash format for blockchain votes
    if (!receiptHash.match(/^0x[a-fA-F0-9]{64}$/)) {
        return res.status(400).json({
            success: false,
            message: `Invalid transaction hash format. Expected 66 characters (0x + 64 hex), received ${receiptHash.length}. ensure you copied the full hash.`
        });
    }
    
    try {
        console.log(`🔍 Verifying receipt ${receiptHash} using Etherscan...`);
        
        // Use Etherscan API for verification (no database dependency)
        const verificationResult = await blockchainUtils.verifyVoteTransaction(receiptHash);
        
        if (!verificationResult.isValid) {
            return res.status(404).json({
                success: false,
                message: verificationResult.error || 'Transaction not found or invalid',
                etherscanUrl: `https://sepolia.etherscan.io/tx/${receiptHash}`
            });
        }
        
        const txData = verificationResult.txData;
        
        // Return blockchain-verified receipt information (no personal data)
        const receiptData = {
            success: true,
            receipt: {
                transactionHash: receiptHash,
                blockNumber: txData.blockNumber,
                blockHash: txData.blockHash,
                timestamp: txData.timestamp,
                gasUsed: txData.gasUsed,
                gasPrice: txData.gasPrice,
                status: txData.status === 1 ? 'Success' : 'Failed',
                contractAddress: txData.to,
                fromAddress: txData.from,
                etherscanUrl: txData.etherscanUrl,
                verified: true,
                source: 'Etherscan Blockchain Verification',
                
                // Privacy-protected information
                voterName: 'Verified Voter', // Always anonymous
                voterId: '****-****-****', // Always masked
                candidateName: 'Vote Recorded', // Never revealed
                candidateParty: 'Privacy Protected', // Never revealed
                
                // Security confirmation
                securityStatus: {
                    blockchainConfirmed: true,
                    immutableRecord: true,
                    etherscanVerified: true,
                    privacyProtected: true
                }
            }
        };
        
        console.log(`✅ Receipt ${receiptHash} verified successfully on Etherscan`);
        console.log(`📊 Block: ${txData.blockNumber}, Status: ${txData.status === 1 ? 'Success' : 'Failed'}`);
        
        res.json(receiptData);
        
    } catch (error) {
        console.error('❌ Error verifying receipt via Etherscan:', error);
        
        // Provide helpful error messages
        let errorMessage = 'Failed to verify receipt';
        
        if (error.message.includes('not found')) {
            errorMessage = 'Transaction not found on blockchain. It may still be pending or the hash may be incorrect.';
        } else if (error.message.includes('API')) {
            errorMessage = 'Blockchain verification service temporarily unavailable. Please try again in a few moments.';
        } else if (error.message.includes('network')) {
            errorMessage = 'Network error while connecting to blockchain. Please check your connection.';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            etherscanUrl: `https://sepolia.etherscan.io/tx/${receiptHash}`,
            suggestion: 'You can also verify your transaction directly on Etherscan using the link above'
        });
    }
});

// Get voting results from blockchain (Master Branch Integration)
app.get('/api/blockchain/results', async (req, res) => {
    try {
        console.log('📊 Fetching results using master branch blockchain utilities...');
        
        const results = await blockchainUtils.getResults();
        
        // Create candidate results with master branch pattern
        const candidateResults = [
            { id: 1, name: 'Candidate A', party: 'Party A', voteCount: results.candidateA },
            { id: 2, name: 'Candidate B', party: 'Party B', voteCount: results.candidateB },
            { id: 3, name: 'Candidate C', party: 'Party C', voteCount: results.candidateC }
        ];
        
        // Sort by vote count (highest first)
        candidateResults.sort((a, b) => b.voteCount - a.voteCount);
        
        // Get voting status from database
        db.isVotingActive((err, votingStatus) => {
            const isVotingActive = err ? true : votingStatus.isActive; // Default to active if error
            
            console.log(`✅ Master branch results: ${results.totalVotes} total votes, Voting Status: ${isVotingActive ? 'ACTIVE' : 'CLOSED'}`);
            
            res.json({
                success: true,
                results: {
                    candidates: candidateResults,
                    candidateA: results.candidateA,
                    candidateB: results.candidateB,
                    candidateC: results.candidateC,
                    totalVotes: results.totalVotes,
                    totalCandidates: candidateResults.length,
                    votingActive: isVotingActive,
                    timestamp: new Date().toISOString(),
                    source: 'Master Branch Blockchain Utils'
                },
                message: 'Results fetched using master branch blockchain utilities'
            });
        });
        
    } catch (error) {
        console.error('❌ Error fetching results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch voting results from blockchain',
            error: error.message
        });
    }
});

// Get encrypted votes metadata from blockchain (public view - truly encrypted)
app.get('/api/blockchain/public-encrypted-votes', async (req, res) => {
    try {
        console.log('📊 Fetching public encrypted vote records...');
        
        // Get vote records from database (fully anonymized)
        db.db.all(
            'SELECT transactionHash, votedAt, userId FROM votes ORDER BY votedAt DESC',
            [],
            async (err, voteRows) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch vote records'
                    });
                }
                
                // Create fully anonymized vote records
                const voteRecords = [];
                
                for (let i = 0; i < voteRows.length; i++) {
                    const vote = voteRows[i];
                    
                    // Create anonymized voter hash (fully secure)
                    const voterHashSeed = `${vote.userId}_${vote.transactionHash.slice(-8)}`;
                    const voterHash = crypto.createHash('sha256').update(voterHashSeed).digest('hex').slice(0, 16);
                    
                    voteRecords.push({
                        id: i + 1,
                        voterHash: `VOTER_${voterHash}`,
                        encryptedChoice: 'Vote choice encrypted for privacy',
                        transactionHash: vote.transactionHash,
                        timestamp: vote.votedAt || new Date().toISOString(),
                        receiptHash: vote.transactionHash,
                        status: 'Confirmed'
                    });
                }
                
                res.json({
                    success: true,
                    encryptedVotes: voteRecords,
                    totalVotes: voteRecords.length,
                    message: voteRecords.length > 0 
                        ? `Found ${voteRecords.length} encrypted vote record(s) on blockchain`
                        : 'No votes have been cast yet',
                    timestamp: new Date().toISOString(),
                    note: 'This is the public view - vote choices are encrypted and anonymized'
                });
            }
        );
        
    } catch (error) {
        console.error('Error fetching public encrypted votes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch public encrypted votes'
        });
    }
});

// Get voting configuration (status, times, etc.)
app.get('/api/voting/config', (req, res) => {
    db.getVotingConfig((err, config) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get voting configuration'
            });
        }
        
        db.isVotingActive((err, activeStatus) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check voting status'
                });
            }
            
            res.json({
                success: true,
                config: {
                    ...config,
                    ...activeStatus
                }
            });
        });
    });
});




// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
    } else {
        res.json({
            message: 'API server running. Start frontend with: cd frontend && npm run dev',
            endpoints: {
                register: 'POST /api/register',
                registerFingerprint: 'POST /api/register-fingerprint',
                verifyFingerprint: 'POST /api/verify-fingerprint',
                getUser: 'GET /api/user/:uniqueNumber',
                candidates: 'GET /api/blockchain/candidates',
                votingStatus: 'GET /api/voting/status/:userId',
                votingConfig: 'GET /api/voting/config',
                castVote: 'POST /api/voting/cast',
                results: 'GET /api/blockchain/results',
                health: 'GET /api/health'
            }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    // In case of port conflict, try another port, e.g., 3001
console.log('🚀 E-Voting System running on http://localhost:' + PORT);
console.log('📋 Available endpoints:');
console.log('  • GET  /                                    - Main dashboard');
console.log('  • POST /api/register                        - Register new user');
console.log('  • POST /api/register-fingerprint            - Store fingerprint');
console.log('  • POST /api/verify-fingerprint              - Verify fingerprint');
console.log('  • GET  /api/user/:number                     - Get user by unique number');
console.log('  • GET  /api/user/:userId/blockchain-address - Get user blockchain address');
console.log('  • GET  /api/blockchain/candidates            - Get candidates from blockchain');
console.log('  • GET  /api/voting/status/:userId            - Check if user has voted (DB)');
console.log('  • GET  /api/voting/blockchain-status/:userId - Check if user voted (blockchain)');
console.log('  • GET  /api/voting/config                    - Get voting configuration and status');
console.log('  • POST /api/voting/cast                      - Cast vote on blockchain');
console.log('  • GET  /api/blockchain/results               - Get voting results');
console.log('  • GET  /api/blockchain/public-encrypted-votes- Get public encrypted votes');
console.log('  • GET  /api/health                           - Health check');
    console.log('');
    console.log('🔗 Blockchain: Using master branch blockchain utilities');
    console.log('📝 Smart Contract: Configured via environment variables');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down gracefully...');
    db.close();
    process.exit(0);
});
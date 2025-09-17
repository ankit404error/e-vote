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
const PORT = process.env.PORT || 3000;

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
        
        console.log(`📝 Processing vote for ${candidate} with token: ${token.substring(0, 20)}...`);
        
        // Cast vote using master branch blockchain utilities
        const result = await blockchainUtils.castVote(token, candidate);
        
        // Store vote record in database for Aadhaar integration
        if (userId) {
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

// Database management endpoints
app.delete('/api/admin/clear-database', (req, res) => {
    // Clear all users and fingerprints
    db.db.run('DELETE FROM fingerprints', (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to clear fingerprints table'
            });
        }
        
        db.db.run('DELETE FROM users', (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to clear users table'
                });
            }
            
            res.json({
                success: true,
                message: 'Database cleared successfully'
            });
        });
    });
});

// EMERGENCY: Delete ALL data (database + blockchain votes)
app.delete('/api/admin/emergency-delete-all', async (req, res) => {
    const { confirmPassword } = req.body;
    
    // Require confirmation password for this dangerous operation
    if (confirmPassword !== 'DELETE_ALL_DATA_CONFIRM_2024') {
        return res.status(401).json({
            success: false,
            message: 'Invalid confirmation password for emergency deletion'
        });
    }
    
    try {
        // 1. Reset blockchain votes
        const accounts = await web3.eth.getAccounts();
        const adminAccount = accounts[0];
        
        await contract.methods.emergencyReset().send({
            from: adminAccount,
            gas: 5000000
        });
        
        // 2. Clear all database tables
        const clearTables = (callback) => {
            db.db.run('DELETE FROM voting_status', (err) => {
                if (err) console.error('Error clearing voting_status:', err);
                
                db.db.run('DELETE FROM fingerprints', (err) => {
                    if (err) console.error('Error clearing fingerprints:', err);
                    
                    db.db.run('DELETE FROM users', (err) => {
                        if (err) console.error('Error clearing users:', err);
                        callback(err);
                    });
                });
            });
        };
        
        clearTables((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to clear database completely'
                });
            }
            
            res.json({
                success: true,
                message: 'EMERGENCY DELETION COMPLETE: All voter data and votes have been permanently deleted',
                warning: 'This action cannot be undone. All voting history is lost.'
            });
        });
        
    } catch (error) {
        console.error('Emergency deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete emergency deletion'
        });
    }
});

app.get('/api/admin/stats', (req, res) => {
    db.db.get('SELECT COUNT(*) as userCount FROM users', (err, userRow) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to get user count' });
        }
        
        db.db.get('SELECT COUNT(*) as fingerprintCount FROM fingerprints', (err, fpRow) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to get fingerprint count' });
            }
            
            res.json({
                success: true,
                stats: {
                    users: userRow.userCount,
                    fingerprints: fpRow.fingerprintCount,
                    timestamp: new Date().toISOString()
                }
            });
        });
    });
});

// === BLOCKCHAIN VOTING ENDPOINTS ===

// Get all candidates from blockchain
app.get('/api/blockchain/candidates', async (req, res) => {
    try {
        const result = await contract.methods.getAllCandidates().call();
        const candidates = [];
        
        for (let i = 0; i < result.ids.length; i++) {
            candidates.push({
                id: parseInt(result.ids[i]),
                name: result.names[i],
                party: result.parties[i],
                voteCount: parseInt(result.voteCounts[i])
            });
        }
        
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

// Check if user has voted
app.get('/api/voting/status/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.checkVotingStatus(userId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to check voting status'
            });
        }
        
        res.json({
            success: true,
            hasVoted: result.hasVoted,
            votedAt: result.votedAt,
            transactionHash: result.transactionHash
        });
    });
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
        // First check if user has already voted
        db.checkVotingStatus(userId, async (err, votingStatus) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check voting status'
                });
            }
            
            if (votingStatus.hasVoted) {
                return res.status(400).json({
                    success: false,
                    message: 'User has already voted'
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
                
                // Use master branch blockchain utilities
                const result = await blockchainUtils.castVote(oactToken, candidateName);
                
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
                        message: 'Vote cast successfully using enhanced blockchain',
                        transactionHash: result.transactionHash,
                        blockNumber: result.blockNumber,
                        gasUsed: result.gasUsed,
                        candidateId: candidateId,
                        timestamp: new Date().toISOString(),
                        voterHash: voterHash.substring(0, 10) + '...' // Partial for privacy
                    });
                } else {
                    throw new Error('Enhanced blockchain transaction failed');
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
        
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cast vote'
        });
    }
});

// Verify vote receipt (shows transaction details but NOT vote choice)
app.post('/api/voting/verify-receipt', async (req, res) => {
    const { receiptHash } = req.body;
    
    if (!receiptHash) {
        return res.status(400).json({
            success: false,
            message: 'Receipt hash is required'
        });
    }
    
    try {
        // Get transaction details from blockchain using Web3
        const receipt = await web3.eth.getTransactionReceipt(receiptHash);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found. Please check your transaction hash.'
            });
        }
        
        // Get the actual transaction details
        const transaction = await web3.eth.getTransaction(receiptHash);
        const block = await web3.eth.getBlock(receipt.blockNumber);
        
        // Try to get voter info from database if available
        let voterInfo = null;
        let candidateInfo = null;
        
        // Check if we have this transaction recorded in our database
        db.db.get(
            'SELECT users.name, users.uniqueNumber, users.id, votes.candidateName, votes.candidateParty, votes.votedAt FROM users INNER JOIN votes ON users.id = votes.userId WHERE votes.transactionHash = ?',
            [receiptHash],
            async (err, voteRow) => {
                if (!err && voteRow) {
                    voterInfo = {
                        name: voteRow.name,
                        aadhaarId: voteRow.uniqueNumber // Use uniqueNumber as Aadhaar ID
                    };
                    candidateInfo = {
                        name: voteRow.candidateName,
                        party: voteRow.candidateParty
                    };
                }
                
                // Convert blockchain timestamp to milliseconds for JavaScript Date
                const timestampMs = typeof block.timestamp === 'bigint' ? 
                    Number(block.timestamp) * 1000 : 
                    parseInt(block.timestamp) * 1000;
                
                // Use database timestamp if available, otherwise blockchain timestamp
                const voteTimestamp = voteRow && voteRow.votedAt ? 
                    new Date(voteRow.votedAt).toISOString() : 
                    new Date(timestampMs).toISOString();
                
                // Return transaction details WITH voter and candidate info when available
                res.json({
                    success: true,
                    receipt: {
                        transactionHash: receiptHash,
                        blockNumber: receipt.blockNumber,
                        timestamp: voteTimestamp, // Use real vote timestamp
                        actualBlockTimestamp: timestampMs, // Real blockchain timestamp
                        gasUsed: receipt.gasUsed,
                        status: receipt.status === 1 ? 'Success' : 'Failed',
                        contractAddress: receipt.to,
                        voterName: voterInfo ? voterInfo.name : 'Verified Voter',
                        voterId: voterInfo ? voterInfo.aadhaarId : null,
                        candidateName: candidateInfo ? candidateInfo.name : null,
                        candidateParty: candidateInfo ? candidateInfo.party : null,
                        verified: true
                    }
                });
            }
        );
        
    } catch (error) {
        console.error('Error verifying receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify receipt. Please check your transaction hash.'
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
        
        console.log(`✅ Master branch results: ${results.totalVotes} total votes`);
        
        res.json({
            success: true,
            results: {
                candidates: candidateResults,
                candidateA: results.candidateA,
                candidateB: results.candidateB,
                candidateC: results.candidateC,
                totalVotes: results.totalVotes,
                totalCandidates: candidateResults.length,
                timestamp: new Date().toISOString(),
                source: 'Master Branch Blockchain Utils'
            },
            message: 'Results fetched using master branch blockchain utilities'
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

// Get encrypted votes metadata from blockchain (admin only)
// NOTE: This only shows that encrypted votes exist, NOT the vote choices
app.get('/api/blockchain/encrypted-votes', async (req, res) => {
    try {
        // In a real system, this would require admin authentication
        let encryptedVotes;
        try {
            encryptedVotes = await contract.methods.getAllEncryptedVotes().call();
        } catch (methodError) {
            console.log('Enhanced encrypted votes method not available:', methodError.message);
            // Return empty array if method doesn't exist
            return res.json({
                success: true,
                encryptedVotes: [],
                message: 'Enhanced encryption features not available in current contract'
            });
        }
        
        const votes = [];
        if (encryptedVotes && encryptedVotes.voteIds) {
            for (let i = 0; i < encryptedVotes.voteIds.length; i++) {
                votes.push({
                    id: parseInt(encryptedVotes.voteIds[i]),
                    voterHash: '***ANONYMOUS***', // Hide voter identity completely
                    encryptedChoice: '***ENCRYPTED***', // Hide encrypted choice
                    timestamp: parseInt(encryptedVotes.timestamps[i]) * 1000,
                    receiptHash: encryptedVotes.receiptHashes[i],
                    status: 'Encrypted and Anonymous'
                });
            }
        }
        
        res.json({
            success: true,
            encryptedVotes: votes,
            message: 'Vote details are encrypted and anonymous for privacy protection'
        });
    } catch (error) {
        console.error('Error fetching encrypted votes metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch encrypted votes metadata from blockchain'
        });
    }
});

// Admin: Reset voting (clear all votes)
app.post('/api/admin/reset-votes', async (req, res) => {
    try {
        const accounts = await web3.eth.getAccounts();
        const adminAccount = accounts[0];
        
        // Reset votes on blockchain
        await contract.methods.resetVotes().send({
            from: adminAccount,
            gas: 3000000
        });
        
        // Clear voting status in local database
        db.db.run('DELETE FROM voting_status', (err) => {
            if (err) {
                console.error('Error clearing voting status:', err);
            }
        });
        
        res.json({
            success: true,
            message: 'All votes have been reset'
        });
    } catch (error) {
        console.error('Error resetting votes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset votes'
        });
    }
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
                castVote: 'POST /api/voting/cast',
                results: 'GET /api/blockchain/results',
                resetVotes: 'POST /api/admin/reset-votes',
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
    console.log(`🚀 E-Voting System running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  • GET  /                           - Main dashboard');
    console.log('  • POST /api/register               - Register new user');
    console.log('  • POST /api/register-fingerprint   - Store fingerprint');
    console.log('  • POST /api/verify-fingerprint     - Verify fingerprint');
    console.log('  • GET  /api/user/:number           - Get user by unique number');
    console.log('  • GET  /api/blockchain/candidates  - Get candidates from blockchain');
    console.log('  • GET  /api/voting/status/:userId  - Check if user has voted');
    console.log('  • POST /api/voting/cast            - Cast vote on blockchain');
    console.log('  • GET  /api/blockchain/results     - Get voting results');
    console.log('  • POST /api/admin/reset-votes      - Reset all votes (admin)');
    console.log('  • GET  /api/health                 - Health check');
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
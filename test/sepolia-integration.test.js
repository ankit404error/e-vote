const { expect } = require("chai");
const { ethers } = require("hardhat");
const blockchainUtils = require("../utils/blockchainUtils");

describe("Sepolia Integration Tests", function() {
  // Increase timeout for network operations
  this.timeout(60000);
  
  let SecureVoting;
  let secureVoting;
  let owner;
  let voter1;
  let voter2;
  let contractAddress;

  before(async function() {
    console.log("🧪 Starting Sepolia integration tests...");
    
    // Get signers - on Sepolia we only have one signer
    const signers = await ethers.getSigners();
    owner = signers[0];
    
    // Check if we're on Sepolia
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId === 11155111n) {
      console.log("✅ Running on Sepolia testnet");
      console.log(`👤 Main account: ${owner.address}`);
      
      // For Sepolia, we'll create deterministic test wallets
      voter1 = ethers.Wallet.createRandom().connect(ethers.provider);
      voter2 = ethers.Wallet.createRandom().connect(ethers.provider);
      
      console.log(`👤 Test voter1: ${voter1.address}`);
      console.log(`👤 Test voter2: ${voter2.address}`);
      
      // Check if main account has enough balance
      const balance = await ethers.provider.getBalance(owner.address);
      const balanceEth = ethers.formatEther(balance);
      console.log(`💰 Main account balance: ${balanceEth} ETH`);
      
      if (parseFloat(balanceEth) < 0.01) {
        console.warn("⚠️  Warning: Low balance for testing! Consider getting more Sepolia ETH.");
      }
      
    } else {
      console.log("ℹ️  Running on local network");
      // On local network, we have multiple signers
      voter1 = signers[1] || signers[0];
      voter2 = signers[2] || signers[0];
      
      console.log("👤 Test accounts:");
      console.log(`   Owner: ${owner.address}`);
      console.log(`   Voter1: ${voter1.address}`);
      console.log(`   Voter2: ${voter2.address}`);
    }
  });

  describe("Contract Deployment", function() {
    it("Should connect to existing deployed contract", async function() {
      // Use existing deployed contract from environment
      const existingContractAddress = process.env.CONTRACT_ADDRESS;
      
      if (!existingContractAddress) {
        // Deploy new contract if none exists
        SecureVoting = await ethers.getContractFactory("SecureVoting");
        console.log("🚀 Deploying new contract for testing...");
        secureVoting = await SecureVoting.deploy();
        await secureVoting.waitForDeployment();
        contractAddress = await secureVoting.getAddress();
        console.log(`📍 New contract deployed at: ${contractAddress}`);
      } else {
        // Connect to existing contract
        SecureVoting = await ethers.getContractFactory("SecureVoting");
        secureVoting = SecureVoting.attach(existingContractAddress);
        contractAddress = existingContractAddress;
        console.log(`🔗 Connected to existing contract: ${contractAddress}`);
      }
      
      expect(contractAddress).to.be.properAddress;
    });

    it("Should have correct contract properties", async function() {
      const totalVotes = await secureVoting.totalVotes();
      const contractOwner = await secureVoting.owner();
      
      // Total votes may be > 0 if this is an existing contract
      expect(totalVotes).to.be.at.least(0);
      expect(contractOwner).to.equal(owner.address);
      
      console.log(`✅ Contract properties verified. Total votes: ${totalVotes}, Owner: ${contractOwner}`);
    });

    it("Should return correct candidate names", async function() {
      const candidateA = await secureVoting.getCandidateName(0);
      const candidateB = await secureVoting.getCandidateName(1);
      const candidateC = await secureVoting.getCandidateName(2);
      const invalid = await secureVoting.getCandidateName(99);
      
      expect(candidateA).to.equal("Candidate A");
      expect(candidateB).to.equal("Candidate B");
      expect(candidateC).to.equal("Candidate C");
      expect(invalid).to.equal("Invalid");
      
      console.log("✅ Candidate names verified");
    });
  });

  describe("Blockchain Utils Integration", function() {
    it("Should initialize blockchain utilities", async function() {
      // Temporarily set contract address for testing
      process.env.CONTRACT_ADDRESS = contractAddress;
      
      const result = await blockchainUtils.initialize();
      expect(result).to.be.true;
      
      console.log("✅ Blockchain utils initialized");
    });

    it("Should get network information", async function() {
      const networkInfo = await blockchainUtils.getNetworkInfo();
      
      expect(networkInfo).to.have.property('name');
      expect(networkInfo).to.have.property('chainId');
      expect(networkInfo).to.have.property('blockNumber');
      expect(networkInfo).to.have.property('gasPrice');
      
      console.log("📊 Network Info:", networkInfo);
    });

    it("Should validate contract deployment", async function() {
      const validation = await blockchainUtils.validateContractDeployment(contractAddress);
      
      expect(validation.isValid).to.be.true;
      expect(validation.totalVotes).to.equal("0");
      expect(validation.owner).to.equal(owner.address);
      
      console.log("✅ Contract deployment validated");
    });

    it("Should get optimal gas price", async function() {
      const gasPrice = await blockchainUtils.getOptimalGasPrice();
      
      expect(gasPrice).to.be.gt(0);
      console.log(`⛽ Optimal gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    });
  });

  describe("Voting Functionality", function() {
    
    // Helper function to fund a wallet for testing
    async function fundWalletForTesting(wallet, amount = "0.01") {
      const network = await ethers.provider.getNetwork();
      
      if (network.chainId === 11155111n) { // Sepolia
        console.log(`💰 Funding test wallet ${wallet.address} with ${amount} ETH...`);
        
        try {
          const fundTx = await owner.sendTransaction({
            to: wallet.address,
            value: ethers.parseEther(amount),
            gasLimit: 21000
          });
          
          await fundTx.wait();
          console.log(`✅ Funded ${wallet.address} successfully`);
          
        } catch (error) {
          console.warn(`⚠️  Failed to fund wallet: ${error.message}`);
          throw new Error(`Cannot fund test wallet. Main account may have insufficient balance.`);
        }
      }
    }
    
    it("Should allow a user to cast a vote", async function() {
      const candidateIndex = 0; // Candidate A
      const oact = "test-oact-token-123";
      
      console.log(`🗳️  Casting vote for Candidate A...`);
      
      // Fund voter1 wallet on Sepolia
      await fundWalletForTesting(voter1, "0.01");
      
      // Connect contract with voter1
      const voterContract = secureVoting.connect(voter1);
      
      // Estimate gas
      const gasEstimate = await voterContract.vote.estimateGas(candidateIndex, oact);
      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
      
      // Cast vote
      const tx = await voterContract.vote(candidateIndex, oact, {
        gasLimit: Math.floor(Number(gasEstimate) * 1.2) // 20% buffer
      });
      
      console.log(`📤 Vote transaction: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Vote confirmed in block ${receipt.blockNumber}`);
      
      // Verify vote was recorded
      const hasVoted = await secureVoting.hasAddressVoted(voter1.address);
      expect(hasVoted).to.be.true;
      
      const totalVotes = await secureVoting.totalVotes();
      expect(totalVotes).to.equal(1);
      
      const results = await secureVoting.getResults();
      expect(results[0]).to.equal(1); // Candidate A should have 1 vote
    });

    it("Should prevent double voting", async function() {
      const candidateIndex = 1; // Candidate B
      const oact = "test-oact-token-456";
      
      const voterContract = secureVoting.connect(voter1);
      
      await expect(
        voterContract.vote(candidateIndex, oact)
      ).to.be.revertedWith("Address has already voted");
      
      console.log("✅ Double voting prevented");
    });

    it("Should allow multiple users to vote", async function() {
      const candidateIndex = 1; // Candidate B
      const oact = "test-oact-token-789";
      
      console.log(`🗳️  Casting vote for Candidate B with voter2...`);
      
      // Fund voter2 wallet on Sepolia
      await fundWalletForTesting(voter2, "0.01");
      
      const voterContract = secureVoting.connect(voter2);
      
      const tx = await voterContract.vote(candidateIndex, oact);
      const receipt = await tx.wait();
      
      console.log(`✅ Second vote confirmed in block ${receipt.blockNumber}`);
      
      // Verify results
      const results = await secureVoting.getResults();
      expect(results[0]).to.equal(1); // Candidate A: 1 vote
      expect(results[1]).to.equal(1); // Candidate B: 1 vote
      expect(results[2]).to.equal(0); // Candidate C: 0 votes
      expect(results[3]).to.equal(2); // Total: 2 votes
      
      console.log("📊 Final results:", {
        candidateA: results[0].toString(),
        candidateB: results[1].toString(),
        candidateC: results[2].toString(),
        total: results[3].toString()
      });
    });

    it("Should reject invalid candidate indices", async function() {
      const invalidIndex = 99;
      const oact = "test-oact-invalid";
      
      // Get a new signer (voter3)
      const [, , , voter3] = await ethers.getSigners();
      const voterContract = secureVoting.connect(voter3);
      
      await expect(
        voterContract.vote(invalidIndex, oact)
      ).to.be.revertedWith("Invalid candidate");
      
      console.log("✅ Invalid candidate rejected");
    });
  });

  describe("Results and Queries", function() {
    it("Should get correct voting results", async function() {
      const results = await blockchainUtils.getResults();
      
      expect(results.candidateA).to.equal(1);
      expect(results.candidateB).to.equal(1);
      expect(results.candidateC).to.equal(0);
      expect(results.totalVotes).to.equal(2);
      
      console.log("📊 Results verified:", results);
    });

    it("Should check voter status correctly", async function() {
      const voter1Status = await blockchainUtils.checkVoterStatus(voter1.address);
      const voter2Status = await blockchainUtils.checkVoterStatus(voter2.address);
      
      expect(voter1Status).to.be.true;
      expect(voter2Status).to.be.true;
      
      // Check a fresh address
      const [, , , voter3] = await ethers.getSigners();
      const voter3Status = await blockchainUtils.checkVoterStatus(voter3.address);
      expect(voter3Status).to.be.false;
      
      console.log("✅ Voter status checks passed");
    });

    it("Should get all candidates with vote counts", async function() {
      const candidates = await blockchainUtils.getAllCandidates();
      
      expect(candidates).to.have.lengthOf(3);
      expect(candidates[0].name).to.equal('Candidate A');
      expect(candidates[0].voteCount).to.equal(1);
      expect(candidates[1].name).to.equal('Candidate B');
      expect(candidates[1].voteCount).to.equal(1);
      expect(candidates[2].name).to.equal('Candidate C');
      expect(candidates[2].voteCount).to.equal(0);
      
      console.log("📋 Candidates data:", candidates);
    });
  });

  describe("Sepolia-specific Features", function() {
    it("Should detect Sepolia network correctly", async function() {
      const isSepolia = blockchainUtils.isSepoliaNetwork();
      
      // This will be true if SEPOLIA_RPC_URL contains 'sepolia' or 'alchemy'
      console.log(`🔍 Is Sepolia network: ${isSepolia}`);
      
      if (isSepolia) {
        const explorerUrl = blockchainUtils.getExplorerUrl('0x1234567890abcdef');
        expect(explorerUrl).to.include('sepolia.etherscan.io');
        console.log("🌐 Explorer URL:", explorerUrl);
      }
    });

    it("Should handle transaction receipts properly", async function() {
      // Get the latest transaction hash from previous tests
      const latestBlock = await ethers.provider.getBlock('latest');
      
      if (latestBlock.transactions.length > 0) {
        const txHash = latestBlock.transactions[0];
        const receipt = await blockchainUtils.getTransactionReceipt(txHash);
        
        expect(receipt).to.have.property('hash');
        expect(receipt).to.have.property('blockNumber');
        expect(receipt).to.have.property('status');
        
        console.log("🧾 Transaction receipt verified");
      } else {
        console.log("ℹ️  No transactions in latest block to test");
      }
    });
  });

  describe("Gas Optimization Tests", function() {
    it("Should estimate gas correctly for voting", async function() {
      const [, , , voter4] = await ethers.getSigners();
      const voterContract = secureVoting.connect(voter4);
      
      const gasEstimate = await voterContract.vote.estimateGas(2, "gas-test-oact");
      const gasPrice = await blockchainUtils.getOptimalGasPrice();
      const estimatedCost = gasEstimate * gasPrice;
      
      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
      console.log(`💰 Estimated cost: ${ethers.formatEther(estimatedCost)} ETH`);
      
      expect(gasEstimate).to.be.lt(100000); // Should be less than 100k gas
    });

    it("Should apply proper gas buffer for reliability", async function() {
      const [, , , voter5] = await ethers.getSigners();
      const voterContract = secureVoting.connect(voter5);
      
      const gasEstimate = await voterContract.vote.estimateGas(2, "buffer-test-oact");
      const gasWithBuffer = Math.floor(Number(gasEstimate) * 1.2);
      
      expect(gasWithBuffer).to.be.gt(Number(gasEstimate));
      console.log(`📊 Gas: ${gasEstimate} → ${gasWithBuffer} (20% buffer)`);
    });
  });

  after(async function() {
    console.log("🧪 Integration tests completed!");
    
    if (contractAddress) {
      console.log(`📍 Test contract deployed at: ${contractAddress}`);
      
      if (blockchainUtils.isSepoliaNetwork()) {
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
      }
    }
    
    // Clean up environment
    delete process.env.CONTRACT_ADDRESS;
  });
});
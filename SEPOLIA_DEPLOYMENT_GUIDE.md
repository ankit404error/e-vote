# 🌊 Sepolia Deployment Guide

Complete guide for deploying your E-Vote blockchain system to Sepolia testnet using Alchemy.

## 📋 Prerequisites

### 1. Environment Setup
- ✅ **Alchemy Account**: You have an Alchemy account with Sepolia RPC URL
- ✅ **Private Key**: Test wallet with Sepolia ETH (never use mainnet keys!)
- ✅ **Etherscan API**: For contract verification
- ✅ **Node.js & npm**: For running deployment scripts

### 2. Required Information
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/bDbxKCofkt3tnnzOji2yF
PRIVATE_KEY=27ddd7e29918facfc23179a84d5fc1569b1cab7c15b48df7b49ace32c155faef
ETHERSCAN_API_KEY=Y62NV73Q7P4FKZ4MBRI2N3T6A8PQA3769V
```

## 🚀 Quick Start Deployment

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Switch to Sepolia Network
```bash
# Interactive network switcher
npm run network:switch

# Or directly switch to Sepolia
npm run network:sepolia
```

### Step 3: Get Sepolia ETH
Visit **https://sepoliafaucet.com/** and get test ETH for your wallet address.

**Your wallet address**: Extract from private key or check deployment logs.

### Step 4: Compile Contracts
```bash
npm run compile
```

### Step 5: Deploy to Sepolia
```bash
npm run deploy-sepolia
```

### Step 6: Verify Deployment
```bash
npm run blockchain:check
```

## 📊 Detailed Deployment Process

### 1. Network Configuration ✅

The system is now configured for Sepolia testnet:
- **Network**: Sepolia (Chain ID: 11155111)
- **RPC Provider**: Alchemy Sepolia endpoint
- **Gas Settings**: Optimized for Sepolia with 10% buffer
- **Verification**: Automatic Etherscan verification

### 2. Contract Deployment 🚀

When you run `npm run deploy-sepolia`, the script will:

1. **Validate Environment**
   ```
   🌊 Deploying SecureVoting contract to Sepolia testnet...
   🔗 Network: sepolia
   ⏰ Timestamp: 2024-01-XX...
   ```

2. **Check Wallet Balance**
   ```
   👤 Deploying with account: 0x1234...
   💰 Account balance: 0.1 ETH
   ```

3. **Estimate Gas & Deploy**
   ```
   ⛽ Estimating deployment gas...
   📊 Gas estimate: 500000
   💸 Estimated cost: 0.001 ETH
   🚀 Deploying contract...
   ```

4. **Contract Testing**
   ```
   🧪 Testing deployed contract...
   ✅ Contract owner: 0x1234...
   📊 Initial total votes: 0
   ```

5. **Auto-Update Configuration**
   ```
   📝 Updating .env file...
   ✅ .env file updated with new contract address
   ```

6. **Etherscan Verification**
   ```
   🔍 Verifying contract on Etherscan...
   ✅ Contract verified on Etherscan!
   🔗 View on Etherscan: https://sepolia.etherscan.io/address/0x...
   ```

### 3. Expected Output ✅

**Successful deployment will show:**
```
🎊 Sepolia deployment completed successfully!
🔗 Contract address: 0xABC123...
🌐 Etherscan URL: https://sepolia.etherscan.io/address/0xABC123...
💡 Don't forget to update your frontend with the new contract address!
```

## 🧪 Testing Your Deployment

### 1. Run Integration Tests
```bash
# Test on Sepolia network
npm run test-sepolia
```

### 2. Manual Testing
```bash
# Check current network
npm run network:status

# Validate contract deployment
node scripts/check-deployment.js
```

### 3. Test Voting Functionality
```bash
# Run the test vote script
node test-vote.js
```

## 📱 Frontend Integration

After successful deployment, update your frontend configuration:

1. **Contract Address**: Found in `.env` as `CONTRACT_ADDRESS`
2. **Network Details**: 
   - Chain ID: `11155111`
   - RPC URL: Your Alchemy Sepolia endpoint
   - Explorer: `https://sepolia.etherscan.io`

### Frontend Environment Variables
```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_NETWORK_NAME=sepolia
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/bDbxKCofkt3tnnzOji2yF
```

## 🔧 Network Management

### Switch Between Networks
```bash
# Interactive switcher
npm run network:switch

# Quick switches
npm run network:sepolia    # Switch to Sepolia
npm run network:local      # Switch to local development
npm run network:status     # Show current network
```

### Network-Specific Commands
```bash
# Sepolia deployment
npm run deploy-sepolia

# Local development
npm run deploy-local
npm run node  # Start local Hardhat node
```

## 🛡️ Security Best Practices

### 1. Private Key Safety ⚠️
- **NEVER** use mainnet private keys
- **NEVER** commit private keys to version control
- **ALWAYS** use test wallets for testnet deployment
- **ROTATE** keys regularly

### 2. Environment Security
- Use `.env` files for sensitive data
- Verify `.env` is in `.gitignore`
- Use different keys for different environments

### 3. Contract Verification
- Always verify contracts on Etherscan
- Review deployed bytecode matches source
- Check contract interactions on explorer

## 📊 Gas Optimization

### Current Optimizations Applied:
- **Compiler Settings**: Optimized for 200 runs
- **Gas Estimation**: Automatic with 20% buffer
- **Transaction Settings**: Optimal gas price for Sepolia

### Expected Costs (Sepolia):
- **Contract Deployment**: ~0.001-0.002 ETH
- **Vote Transaction**: ~0.0001-0.0003 ETH
- **Result Query**: ~0.00001 ETH (read-only)

## 🔄 Development Workflow

### 1. Development Phase
```bash
npm run network:local    # Switch to local
npm run node            # Start Hardhat node
npm run deploy-local    # Deploy locally
npm run test           # Run tests
```

### 2. Testing Phase
```bash
npm run network:sepolia  # Switch to Sepolia
npm run deploy-sepolia   # Deploy to testnet
npm run test-sepolia     # Run integration tests
```

### 3. Production Preparation
- Contract verified ✅
- Tests passing ✅
- Frontend integrated ✅
- Documentation updated ✅

## 📈 Monitoring & Maintenance

### 1. Transaction Monitoring
- **Etherscan**: Monitor all transactions
- **Alchemy Dashboard**: Track API usage
- **Contract Events**: Monitor voting events

### 2. Performance Tracking
```bash
# Check network status
npm run network:status

# Validate contract health
npm run blockchain:check
```

### 3. Log Analysis
Review deployment logs saved in `deployments/sepolia-*.json`

## 🚨 Troubleshooting

### Common Issues & Solutions:

#### 1. "Insufficient Balance" Error
```
❌ Error: insufficient funds for intrinsic transaction cost
```
**Solution**: Get more Sepolia ETH from https://sepoliafaucet.com/

#### 2. "Network Mismatch" Error
```
❌ Expected Sepolia (11155111), got chain ID 1337
```
**Solution**: Run `npm run network:sepolia` to switch networks

#### 3. "Contract Verification Failed"
```
⚠️ Contract verification failed: Already verified
```
**Solution**: This is normal if contract was already verified

#### 4. "RPC Connection Failed"
```
❌ Failed to connect to network
```
**Solution**: Check Alchemy RPC URL and API key

#### 5. "Private Key Invalid"
```
❌ Invalid private key format
```
**Solution**: Ensure private key is 64 characters (without 0x prefix)

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=true npm run deploy-sepolia
```

## 📞 Support Resources

### 1. Documentation Links
- **Hardhat**: https://hardhat.org/docs
- **Ethers.js**: https://docs.ethers.org/
- **Alchemy**: https://docs.alchemy.com/
- **Sepolia Faucet**: https://sepoliafaucet.com/

### 2. Network Information
- **Chain ID**: 11155111
- **Currency**: SepoliaETH (TEST ETH)
- **Explorer**: https://sepolia.etherscan.io
- **RPC**: https://ethereum-sepolia.blockpi.network/v1/rpc/public

### 3. Quick Commands Reference
```bash
# Essential commands
npm run network:sepolia    # Switch to Sepolia
npm run compile           # Compile contracts  
npm run deploy-sepolia    # Deploy to Sepolia
npm run test-sepolia      # Test on Sepolia
npm run network:status    # Check current network

# Troubleshooting
node scripts/network-switch.js help
npx hardhat compile --force
npx hardhat clean
```

---

## 🎉 Success Checklist

After deployment, verify:

- ✅ Contract deployed to Sepolia
- ✅ Contract verified on Etherscan  
- ✅ Integration tests passing
- ✅ Frontend updated with contract address
- ✅ Network configuration correct
- ✅ Documentation updated
- ✅ Backup of deployment details saved

**Congratulations! Your E-Vote system is now running on Sepolia testnet! 🎊**

---

*Last updated: 2024-01-XX*  
*Network: Sepolia Testnet*  
*Status: Production Ready ✅*
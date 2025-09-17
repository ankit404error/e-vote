const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🌊 Deploying SecureVoting contract to Sepolia testnet...");
  console.log("🔗 Network:", hre.network.name);
  console.log("⏰ Timestamp:", new Date().toISOString());
  
  // Validate network
  if (hre.network.name !== 'sepolia') {
    throw new Error(`❌ Wrong network! Expected 'sepolia', got '${hre.network.name}'`);
  }

  // Get the ContractFactory and deployer
  const SecureVoting = await hre.ethers.getContractFactory("SecureVoting");
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("👤 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log("💰 Account balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.warn("⚠️  Warning: Low balance! Make sure you have enough Sepolia ETH for deployment and gas fees.");
  }

  // Estimate deployment cost
  console.log("⛽ Estimating deployment gas...");
  let gasEstimate, gasPrice, deploymentCost;
  
  try {
    // Get gas price using the correct ethers v6 API
    const feeData = await hre.ethers.provider.getFeeData();
    gasPrice = feeData.gasPrice || hre.ethers.parseUnits('20', 'gwei'); // Fallback to 20 gwei
    
    // Estimate gas for deployment
    const deploymentTx = await SecureVoting.getDeployTransaction();
    gasEstimate = await hre.ethers.provider.estimateGas(deploymentTx);
    deploymentCost = gasEstimate * gasPrice;
    
    console.log(`📊 Gas estimate: ${gasEstimate.toString()}`);
    console.log(`💰 Gas price: ${hre.ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log(`💸 Estimated cost: ${hre.ethers.formatEther(deploymentCost)} ETH`);
  } catch (gasError) {
    console.warn('⚠️ Gas estimation failed, using defaults:', gasError.message);
    gasEstimate = 500000n; // Default gas limit
    gasPrice = hre.ethers.parseUnits('20', 'gwei'); // 20 gwei default
    console.log(`📊 Using default gas: ${gasEstimate.toString()}`);
    console.log(`💰 Using default gas price: 20 gwei`);
  }

  // Deploy the contract
  console.log("🚀 Deploying contract...");
  
  let secureVoting;
  try {
    const deployOptions = {
      gasLimit: gasEstimate ? Math.floor(Number(gasEstimate) * 1.2) : 600000, // 20% buffer or default
    };
    
    // Add gas price only if we successfully got it
    if (gasPrice) {
      deployOptions.gasPrice = gasPrice;
    }
    
    console.log('🛠️ Deploy options:', {
      gasLimit: deployOptions.gasLimit,
      gasPrice: deployOptions.gasPrice ? hre.ethers.formatUnits(deployOptions.gasPrice, 'gwei') + ' gwei' : 'auto'
    });
    
    secureVoting = await SecureVoting.deploy(deployOptions);
  } catch (deployError) {
    console.error('❌ Deploy with gas options failed:', deployError.message);
    console.log('🔄 Retrying with default options...');
    
    // Retry with minimal options
    secureVoting = await SecureVoting.deploy();
  }
  
  console.log("⏳ Waiting for deployment transaction...");
  await secureVoting.waitForDeployment();
  
  const contractAddress = await secureVoting.getAddress();
  const deployTxHash = secureVoting.deploymentTransaction().hash;
  
  let deployTxReceipt;
  try {
    deployTxReceipt = await hre.ethers.provider.getTransactionReceipt(deployTxHash);
  } catch (receiptError) {
    console.warn('⚠️ Could not get transaction receipt:', receiptError.message);
    // Continue without receipt details
  }
  
  console.log("\n🎉 Deployment successful!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Transaction hash:", deployTxHash);
  
  if (deployTxReceipt) {
    console.log("🏗️  Block number:", deployTxReceipt.blockNumber);
    console.log("⛽ Gas used:", deployTxReceipt.gasUsed.toString());
    
    if (deployTxReceipt.gasPrice) {
      const actualCost = deployTxReceipt.gasUsed * deployTxReceipt.gasPrice;
      console.log("💰 Actual cost:", hre.ethers.formatEther(actualCost), "ETH");
    }
  } else {
    console.log("⚠️ Transaction receipt not available");
  }

  // Test the deployment
  console.log("\n🧪 Testing deployed contract...");
  try {
    const owner = await secureVoting.owner();
    const totalVotes = await secureVoting.totalVotes();
    const results = await secureVoting.getResults();
    
    console.log("✅ Contract owner:", owner);
    console.log("📊 Initial total votes:", totalVotes.toString());
    console.log("📊 Initial results:", {
      candidateA: results[0].toString(),
      candidateB: results[1].toString(), 
      candidateC: results[2].toString(),
      total: results[3].toString()
    });
    
    // Test candidate name mapping
    const candidateAName = await secureVoting.getCandidateName(0);
    const candidateBName = await secureVoting.getCandidateName(1);
    const candidateCName = await secureVoting.getCandidateName(2);
    
    console.log("🏷️  Candidate names:", {
      0: candidateAName,
      1: candidateBName,
      2: candidateCName
    });
    
    console.log("✅ Contract functionality test passed!");
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
    throw error;
  }

  // Update .env file with new contract address
  console.log("\n📝 Updating .env file...");
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update CONTRACT_ADDRESS
    envContent = envContent.replace(
      /^CONTRACT_ADDRESS=.*$/m,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated with new contract address");
  } catch (error) {
    console.warn("⚠️  Warning: Could not update .env file:", error.message);
    console.log("📝 Please manually update your .env file:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  }

  // Contract verification
  console.log("\n🔍 Verifying contract on Etherscan...");
  if (process.env.ETHERSCAN_API_KEY) {
    try {
      // Wait for a few block confirmations before verification
      console.log("⏳ Waiting for block confirmations...");
      await secureVoting.deploymentTransaction().wait(2);
      
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
        contract: "contracts/SecureVoting.sol:SecureVoting"
      });
      
      console.log("✅ Contract verified on Etherscan!");
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    } catch (error) {
      console.warn("⚠️  Contract verification failed:", error.message);
      console.log("📝 You can verify manually at: https://sepolia.etherscan.io/verifyContract");
      console.log(`📍 Contract address: ${contractAddress}`);
    }
  } else {
    console.log("⚠️  No Etherscan API key found. Skipping verification.");
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 11155111,
    contractName: "SecureVoting",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: deployTxHash,
    timestamp: new Date().toISOString(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
  };
  
  // Add receipt details if available
  if (deployTxReceipt) {
    deploymentInfo.blockNumber = deployTxReceipt.blockNumber;
    deploymentInfo.gasUsed = deployTxReceipt.gasUsed.toString();
    
    if (deployTxReceipt.gasPrice) {
      deploymentInfo.gasPrice = deployTxReceipt.gasPrice.toString();
      deploymentInfo.deploymentCost = hre.ethers.formatEther(deployTxReceipt.gasUsed * deployTxReceipt.gasPrice);
    }
  }

  const deploymentPath = path.join(__dirname, '..', 'deployments', `sepolia-${Date.now()}.json`);
  try {
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${deploymentPath}`);
  } catch (error) {
    console.warn("⚠️  Could not save deployment info:", error.message);
  }

  console.log("\n🎊 Sepolia deployment completed successfully!");
  console.log("🔗 Contract address:", contractAddress);
  console.log("🌐 Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("💡 Don't forget to update your frontend with the new contract address!");

  return {
    contractAddress,
    transactionHash: deployTxHash,
    deploymentInfo
  };
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = { main };
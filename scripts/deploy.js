const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying SecureVoting contract to Sepolia...");
  
  // Get the ContractFactory
  const SecureVoting = await hre.ethers.getContractFactory("SecureVoting");
  
  // Deploy the contract
  const secureVoting = await SecureVoting.deploy();
  
  // Wait for deployment
  await secureVoting.waitForDeployment();
  
  const contractAddress = await secureVoting.getAddress();
  
  console.log("✅ SecureVoting deployed to:", contractAddress);
  console.log("🔗 Network:", hre.network.name);
  console.log("⛽ Gas used:", (await secureVoting.deploymentTransaction()).gasLimit.toString());
  
  // Save contract address to backend .env
  const envPath = path.join(__dirname, '../voting-backend/.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add CONTRACT_ADDRESS
  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("💾 Contract address saved to voting-backend/.env");
  
  // Verify on Etherscan (optional)
  if (hre.network.name === "sepolia") {
    console.log("⏳ Waiting 60 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

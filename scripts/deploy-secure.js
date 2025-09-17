const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SecureVoting contract...");

  // Get the ContractFactory
  const SecureVoting = await hre.ethers.getContractFactory("SecureVoting");
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  
  // Deploy the contract
  console.log("📤 Deploying contract...");
  const secureVoting = await SecureVoting.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await secureVoting.waitForDeployment();
  
  const contractAddress = await secureVoting.getAddress();
  
  console.log("✅ SecureVoting deployed to:", contractAddress);
  console.log("🏗️ Transaction hash:", secureVoting.deploymentTransaction().hash);
  console.log("🔗 Network:", hre.network.name);
  
  // Test the deployment
  console.log("🧪 Testing deployment...");
  try {
    const totalVotes = await secureVoting.totalVotes();
    console.log("📊 Initial total votes:", totalVotes.toString());
    
    const results = await secureVoting.getResults();
    console.log("📊 Initial results:", {
      candidateA: results[0].toString(),
      candidateB: results[1].toString(),
      candidateC: results[2].toString(),
      total: results[3].toString()
    });
    
    console.log("✅ Deployment test successful!");
  } catch (error) {
    console.error("❌ Deployment test failed:", error.message);
  }
  
  return contractAddress;
}

main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
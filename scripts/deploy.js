const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying EVoting contract...");

  // Get the ContractFactory and Signers here
  const EVoting = await hre.ethers.getContractFactory("EVoting");
  const [deployer] = await hre.ethers.getSigners();

  console.log("📋 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Demo public key for encryption (in production, use proper RSA key)
  const demoPublicKey = "demo_public_key_for_encryption_2024";
  console.log("🔐 Using demo public key for vote encryption");

  // Deploy the contract with public key
  const eVoting = await EVoting.deploy(demoPublicKey);

  await eVoting.deployed();

  const contractAddress = eVoting.address;

  console.log("✅ EVoting contract deployed to:", contractAddress);
  console.log("🏗️ Transaction hash:", eVoting.deployTransaction.hash);

  // Verify the deployment by calling a function
  const candidatesCount = await eVoting.candidatesCount();
  console.log("👥 Total candidates:", candidatesCount.toString());

  // Get all candidates
  const candidates = await eVoting.getAllCandidates();
  console.log("📊 Default candidates loaded:");
  for (let i = 0; i < candidates[0].length; i++) {
    console.log(`   ${candidates[0][i]}: ${candidates[1][i]} (${candidates[2][i]}) - Votes: ${candidates[3][i]}`);
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: eVoting.deployTransaction.hash,
    blockNumber: eVoting.deployTransaction.blockNumber,
    deployedAt: new Date().toISOString(),
    network: hre.network.name
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment-info.json");

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((contractAddress) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("🔗 Contract Address:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Select which contract to deploy based on command line argument
const contractName = process.argv[2] || 'EVoting';

async function main() {
  console.log(`🚀 Deploying ${contractName} contract...`);

  if (contractName === 'EVoting') {
    await deployEVoting();
  } else if (contractName === 'SecureVoting') {
    await deploySecureVoting();
  } else {
    console.error('❌ Unknown contract name. Use "EVoting" or "SecureVoting"');
    process.exit(1);
  }
}

async function deployEVoting() {
  // Get the ContractFactory and Signers here
  const EVoting = await hre.ethers.getContractFactory("EVoting");
  const [deployer] = await hre.ethers.getSigners();

  console.log("📋 Deploying EVoting contract with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Demo public key for encryption (in production, use proper RSA key)
  const demoPublicKey = "demo_public_key_for_encryption_2024";
  console.log("🔐 Using demo public key for vote encryption");

  // Deploy the contract with public key
  const eVoting = await EVoting.deploy(demoPublicKey);
  await eVoting.waitForDeployment();

  const contractAddress = await eVoting.getAddress();

  console.log("✅ EVoting contract deployed to:", contractAddress);
  console.log("🏗️ Transaction hash:", eVoting.deploymentTransaction().hash);

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
    transactionHash: eVoting.deploymentTransaction().hash,
    deployedAt: new Date().toISOString(),
    network: hre.network.name,
    contractType: 'EVoting'
  };

  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment-info.json");

  return contractAddress;
}

async function deploySecureVoting() {
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
  
  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

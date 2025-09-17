#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_PATH = path.join(__dirname, '..', '.env');

// Network configurations
const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    config: {
      SEPOLIA_RPC_URL: 'https://eth-sepolia.g.alchemy.com/v2/bDbxKCofkt3tnnzOji2yF',
      RPC_URL: 'https://eth-sepolia.g.alchemy.com/v2/bDbxKCofkt3tnnzOji2yF',
      PRIVATE_KEY: '27ddd7e29918facfc23179a84d5fc1569b1cab7c15b48df7b49ace32c155faef',
      ETHERSCAN_API_KEY: 'Y62NV73Q7P4FKZ4MBRI2N3T6A8PQA3769V',
      NETWORK: 'sepolia',
      CHAIN_ID: '11155111',
      CONTRACT_ADDRESS: ''
    }
  },
  localhost: {
    name: 'Local Hardhat Network',
    config: {
      SEPOLIA_RPC_URL: 'http://localhost:8545',
      RPC_URL: 'http://localhost:8545',
      PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      ETHERSCAN_API_KEY: '',
      NETWORK: 'localhost',
      CHAIN_ID: '31337',
      CONTRACT_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  }
};

function readEnvFile() {
  try {
    if (fs.existsSync(ENV_PATH)) {
      return fs.readFileSync(ENV_PATH, 'utf8');
    }
    return '';
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    return '';
  }
}

function writeEnvFile(content) {
  try {
    fs.writeFileSync(ENV_PATH, content);
    return true;
  } catch (error) {
    console.error('❌ Error writing .env file:', error.message);
    return false;
  }
}

function updateEnvForNetwork(networkKey) {
  const network = NETWORKS[networkKey];
  if (!network) {
    console.error(`❌ Unknown network: ${networkKey}`);
    return false;
  }

  let envContent = readEnvFile();
  
  // Update or add each configuration value
  Object.entries(network.config).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (envContent.match(regex)) {
      // Update existing value
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new value
      envContent += `\n${key}=${value}`;
    }
  });

  // Add network-specific comments
  const timestamp = new Date().toISOString();
  const comment = `\n\n# Network switched to ${network.name} at ${timestamp}\n`;
  envContent = comment + envContent;

  return writeEnvFile(envContent);
}

function getCurrentNetwork() {
  const envContent = readEnvFile();
  const rpcMatch = envContent.match(/^SEPOLIA_RPC_URL=(.*)$/m);
  
  if (!rpcMatch) {
    return 'unknown';
  }

  const rpcUrl = rpcMatch[1].trim();
  
  if (rpcUrl.includes('sepolia') || rpcUrl.includes('alchemy.com')) {
    return 'sepolia';
  } else if (rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1')) {
    return 'localhost';
  }
  
  return 'custom';
}

function displayNetworkStatus() {
  const current = getCurrentNetwork();
  const currentName = NETWORKS[current] ? NETWORKS[current].name : current;
  
  console.log('\n🌐 Network Status');
  console.log('================');
  console.log(`Current Network: ${currentName}`);
  
  if (current === 'sepolia') {
    console.log('🌊 Connected to Sepolia Testnet');
    console.log('💡 Perfect for testing with real testnet conditions');
    console.log('🔗 Transactions visible on https://sepolia.etherscan.io');
  } else if (current === 'localhost') {
    console.log('🏠 Connected to Local Development Network');
    console.log('💡 Great for fast iteration and development');
    console.log('⚡ Instant transactions and unlimited ETH');
  } else {
    console.log('❓ Custom network configuration detected');
  }
  
  console.log('\nAvailable Networks:');
  Object.entries(NETWORKS).forEach(([key, network]) => {
    const indicator = current === key ? '👉' : '  ';
    console.log(`${indicator} ${key}: ${network.name}`);
  });
}

async function interactiveSwitch() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n🔄 Network Switching Wizard');
    console.log('===========================');
    
    displayNetworkStatus();
    
    console.log('\nSelect network:');
    console.log('1. Sepolia Testnet (Production-ready testing)');
    console.log('2. Local Hardhat Network (Development)');
    console.log('3. Show current status');
    console.log('4. Exit');

    rl.question('\nEnter your choice (1-4): ', (answer) => {
      rl.close();
      
      switch (answer.trim()) {
        case '1':
          resolve('sepolia');
          break;
        case '2':
          resolve('localhost');
          break;
        case '3':
          resolve('status');
          break;
        case '4':
        default:
          resolve('exit');
          break;
      }
    });
  });
}

async function switchNetwork(targetNetwork) {
  if (targetNetwork === 'status') {
    displayNetworkStatus();
    return;
  }
  
  if (targetNetwork === 'exit') {
    console.log('👋 Goodbye!');
    return;
  }

  const current = getCurrentNetwork();
  
  if (current === targetNetwork) {
    console.log(`✅ Already on ${NETWORKS[targetNetwork].name}`);
    return;
  }

  console.log(`🔄 Switching from ${NETWORKS[current] ? NETWORKS[current].name : current} to ${NETWORKS[targetNetwork].name}...`);
  
  if (updateEnvForNetwork(targetNetwork)) {
    console.log('✅ Network configuration updated successfully!');
    
    if (targetNetwork === 'sepolia') {
      console.log('\n🌊 Switched to Sepolia Testnet');
      console.log('📋 Next steps:');
      console.log('   1. Ensure you have Sepolia ETH in your wallet');
      console.log('   2. Deploy contract: npm run deploy');
      console.log('   3. Run tests: npm run test');
      console.log('   💡 Get Sepolia ETH: https://sepoliafaucet.com/');
      
    } else if (targetNetwork === 'localhost') {
      console.log('\n🏠 Switched to Local Development');
      console.log('📋 Next steps:');
      console.log('   1. Start Hardhat node: npm run node');
      console.log('   2. Deploy contract: npm run deploy-local');
      console.log('   3. Run tests: npm run test');
    }
    
    console.log('\n🔧 Configuration updated in .env file');
    displayNetworkStatus();
    
  } else {
    console.log('❌ Failed to update network configuration');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    const choice = await interactiveSwitch();
    await switchNetwork(choice);
  } else {
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'sepolia':
      case 'testnet':
        await switchNetwork('sepolia');
        break;
        
      case 'localhost':
      case 'local':
      case 'hardhat':
        await switchNetwork('localhost');
        break;
        
      case 'status':
      case 'current':
        displayNetworkStatus();
        break;
        
      case 'help':
      case '--help':
      case '-h':
        console.log('\n🔧 Network Switch Utility');
        console.log('=========================');
        console.log('Usage:');
        console.log('  node network-switch.js              # Interactive mode');
        console.log('  node network-switch.js sepolia      # Switch to Sepolia');
        console.log('  node network-switch.js localhost    # Switch to Local');
        console.log('  node network-switch.js status       # Show current network');
        console.log('  node network-switch.js help         # Show this help');
        console.log('\nAliases:');
        console.log('  sepolia = testnet');
        console.log('  localhost = local = hardhat');
        console.log('  status = current');
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "node network-switch.js help" for usage information');
        break;
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  switchNetwork,
  getCurrentNetwork,
  displayNetworkStatus,
  NETWORKS
};
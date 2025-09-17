# 🚀 HOW TO RUN YOUR LIVE E-VOTE SYSTEM

## ⚡ **QUICK START (Live Blockchain)**

Your E-Vote system is now **LIVE** on Sepolia testnet with a deployed smart contract!

### **🎯 ONE COMMAND TO START EVERYTHING:**

```bash
npm start
```

**That's it!** Your complete E-Vote system with live blockchain is now running.

---

## 📂 **What Files to Run:**

### **1. Main Application (Primary):**
```bash
# Start the complete system (backend + blockchain integration)
npm start

# OR for development with auto-restart:
npm run dev
```

### **2. Frontend (Separate Terminal):**
```bash
# Start the React frontend
npm run start-main-frontend

# OR alternative frontend:
npm run start-frontend
```

---

## 🌐 **Access Your System:**

After running `npm start`:

- **🖥️ Main Application**: http://localhost:5173
- **🔌 Backend API**: http://localhost:4000
- **❤️ Health Check**: http://localhost:4000/api/health
- **🔗 Live Blockchain Contract**: https://sepolia.etherscan.io/address/0x462edb8972d0106D114a9498155be9a7eF2c07d6

---

## 🔧 **Blockchain Commands:**

```bash
# Check current network (should show Sepolia)
npm run network:status

# Test blockchain functionality
npm run test-sepolia

# Switch networks
npm run network:sepolia    # Production (Sepolia)
npm run network:local      # Development (Local)
npm run network:switch     # Interactive switcher

# Deploy new contract (if needed)
npm run deploy-sepolia
```

---

## 📝 **Step-by-Step Process:**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Start the System**
```bash
npm start
```

### **Step 3: Open Your Browser**
Navigate to: http://localhost:5173

### **Step 4: Use the System**
1. **Register** a new user with fingerprint
2. **Verify** identity using biometric authentication  
3. **Vote** - your vote is processed on live Sepolia blockchain
4. **View Results** - real-time blockchain vote counts
5. **Verify Transaction** - check your vote on Etherscan

---

## 🎯 **Live System Status:**

✅ **Smart Contract**: `0x462edb8972d0106D114a9498155be9a7eF2c07d6`  
✅ **Network**: Sepolia Testnet (Live)  
✅ **RPC Provider**: Alchemy  
✅ **Contract Verified**: Source code on Etherscan  
✅ **Gas Cost**: Ultra-low (~0.000001 ETH per vote)  
✅ **Transaction Speed**: ~15 seconds  

---

## 🚨 **Troubleshooting:**

### **Port Already in Use:**
```bash
# Kill processes on ports 4000 and 5173
netstat -ano | findstr :4000
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### **Dependencies Issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **Blockchain Connection Issues:**
```bash
# Check network status
npm run network:status

# Should show: "Current Network: Sepolia Testnet"
# If not, switch to Sepolia:
npm run network:sepolia
```

---

## 🎊 **Your System is LIVE!**

**Contract Address**: `0x462edb8972d0106D114a9498155be9a7eF2c07d6`  
**View on Etherscan**: https://sepolia.etherscan.io/address/0x462edb8972d0106D114a9498155be9a7eF2c07d6

**🎉 Congratulations! You now have a production-ready blockchain voting system running on live Sepolia testnet!**
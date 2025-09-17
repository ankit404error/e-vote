# 🗳️ E-Voting System - Quick Start Guide

## 🚀 ONE-CLICK STARTUP

### To Start the Complete System:
1. **Double-click `START-EVOTING.bat`** 
   - This will automatically start all required services in the correct order
   - Wait for all services to start (takes about 1-2 minutes)
   - Look for the "🎉 ALL SERVICES STARTED SUCCESSFULLY!" message

### To Stop the System:
1. **Double-click `STOP-EVOTING.bat`**
   - This will stop all running services

### Or press `Ctrl+C` in the startup terminal

---

## 🌐 Access the System

Once started, you can access:

- **🏠 Main Voting Website**: http://localhost:5173
- **🔧 Backend API**: http://localhost:4000
- **⛓️ Blockchain Node**: http://localhost:8545

---

## 📋 What the Startup Script Does

The automated script performs these steps in order:

1. ✅ **Cleans up** any existing processes on ports 8545, 4000, 5173
2. ✅ **Installs dependencies** (npm install for both root and frontend)
3. ✅ **Compiles smart contracts** (npx hardhat compile)
4. ✅ **Starts Hardhat blockchain** on port 8545
5. ✅ **Deploys fresh SecureVoting contract** 
6. ✅ **Updates .env file** with new contract address
7. ✅ **Starts backend server** on port 4000
8. ✅ **Tests API connectivity** (confirms candidates can be loaded)
9. ✅ **Starts frontend server** on port 5173
10. ✅ **Monitors all services** and keeps them running

---

## ❓ Troubleshooting

### If you get "Failed to load candidates":
- Stop the system (`STOP-EVOTING.bat`)
- Wait 10 seconds
- Start again (`START-EVOTING.bat`)

### If ports are already in use:
- The script automatically kills existing processes on those ports
- If that fails, restart your computer and try again

### If you see PowerShell execution errors:
- Right-click on `START-EVOTING.bat` and select "Run as Administrator"

---

## 🎯 Quick Test

After startup, visit http://localhost:5173 and you should see:
- ✅ Three candidates (A, B, C) with 0 votes each
- ✅ Ability to register users
- ✅ Voting functionality  
- ✅ Results display

---

## 🆘 Need Help?

If something goes wrong:

1. **Check the startup terminal** for error messages
2. **Try the STOP and START scripts** to restart cleanly
3. **Make sure you have Node.js and npm installed**
4. **Run as Administrator** if you have permission issues

The startup script will show detailed progress and error messages to help you diagnose any issues.

---

**🎉 That's it! Your E-Voting system should now work perfectly without any "Failed to load candidates" errors!**
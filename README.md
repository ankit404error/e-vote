# E-Vote System - Secure Blockchain Voting with Aadhaar Authentication

🗳️ A comprehensive electronic voting system that combines secure Aadhaar-based identity verification with blockchain voting technology. Built using master branch's proven blockchain implementation integrated with enhanced user authentication features.

## ✨ Features

### 🔐 Identity Management (Aadhaar Integration)
- **🆔 User Registration**: Complete identity registration with personal details
- **👆 Fingerprint Authentication**: WebAuthn-compatible biometric authentication
- **🔒 Secure Storage**: Encrypted local SQLite database storage
- **✅ Identity Verification**: Real-time fingerprint verification and user lookup
- **🛡️ Privacy-First**: All data stored locally on your device, no cloud dependencies

### ⛓️ Blockchain Voting (Master Branch Integration)
- **🗳️ Secure Voting**: Ethereum smart contract-based voting system
- **🔍 Vote Verification**: Transaction-based vote receipts and verification
- **📊 Real-time Results**: Live blockchain-based vote counting
- **🚫 Double-Vote Prevention**: Smart contract prevents multiple votes per address
- **🏗️ Professional Architecture**: Master branch's proven blockchain utilities
- **⛽ Gas Optimization**: Efficient smart contract with proper gas estimation

## 🏗️ System Architecture

### Backend (Node.js + Express + Blockchain)
- **Database**: SQLite with encrypted fingerprint and vote storage
- **Blockchain**: Ethereum smart contracts with Hardhat framework
- **API**: RESTful endpoints for registration, verification, and voting
- **Security**: Helmet.js, rate limiting, input validation, blockchain security
- **Encryption**: AES-256 for sensitive data protection
- **Smart Contracts**: Master branch's proven `SecureVoting.sol` implementation
- **Web3 Integration**: Ethers.js for blockchain interaction with professional error handling

### Frontend (React + Vite)
- **Framework**: Modern React with functional components and hooks
- **Routing**: React Router for navigation between auth and voting
- **Styling**: Custom CSS with gradient themes and animations
- **Icons**: Lucide React for consistent iconography
- **WebAuthn**: Browser-based fingerprint capture with fallback simulation
- **Blockchain UI**: Vote casting interface with transaction confirmation

### Blockchain Layer (Ethereum)
- **Smart Contract**: `SecureVoting.sol` with enum-based candidates
- **Deployment**: Hardhat-based deployment and testing framework
- **Network Support**: Local development and Sepolia testnet ready
- **Gas Management**: Automatic gas estimation with 20% buffer
- **Event Logging**: Comprehensive vote events for transparency

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Modern Browser** with WebAuthn support (Chrome, Firefox, Edge)
- **Git** for cloning and branch management
- **Windows Hello** (optional, for real fingerprint capture)
- **Hardhat** (installed automatically with dependencies)

### ⚙️ Complete System Setup

#### Method 1: Automated Setup (Recommended)

1. **Run the complete setup**:
   ```powershell
   # Install all dependencies (main + frontend + voting components)
   npm run install-all
   
   # Compile smart contracts
   npm run compile
   ```

2. **Start all services** (3 separate terminals):
   
   **Terminal 1 - Blockchain Node**:
   ```bash
   # Start local Hardhat blockchain node
   npm run node
   ```
   
   **Terminal 2 - Backend Server**:
   ```bash
   # Start main backend server with Aadhaar + Blockchain integration
   npm start
   ```
   
   **Terminal 3 - Frontend**:
   ```bash
   # Start React frontend
   npm run start-main-frontend
   ```

3. **Deploy smart contract** (in new terminal):
   ```bash
   # Deploy to local network
   npm run deploy-local
   ```

4. **Access the system**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **API Health**: http://localhost:3000/api/health

#### Method 2: Manual Step-by-Step Setup

1. **Install all dependencies**:
   ```bash
   # Main project dependencies
   npm install
   
   # Frontend dependencies
   cd frontend && npm install && cd ..
   
   # Voting backend dependencies
   cd voting-backend && npm install && cd ..
   
   # Voting frontend dependencies (optional)
   cd voting-frontend && npm install && cd ..
   ```

2. **Compile smart contracts**:
   ```bash
   npx hardhat compile
   ```

3. **Start blockchain node**:
   ```bash
   npx hardhat node
   ```
   
4. **Deploy contracts** (new terminal):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Start backend server** (new terminal):
   ```bash
   node server.js
   ```

6. **Start frontend** (new terminal):
   ```bash
   cd frontend && npm run dev
   ```

## 📱 How to Use

### Phase 1: User Registration & Verification

#### 1. User Registration
1. Navigate to **http://localhost:5173**
2. Click "Register New User" on the dashboard
3. Fill in personal information (name, age, gender, location)
4. Proceed to fingerprint registration
5. Capture fingerprint using WebAuthn or simulation
6. Receive unique 12-digit Aadhaar-style ID number

#### 2. Identity Verification
1. Click "Verify Identity" on the dashboard
2. Scan your registered fingerprint
3. View verified user details with ✅ confirmation
4. Access voting interface after successful verification

### Phase 2: Blockchain Voting

#### 3. Cast Your Vote
1. After identity verification, access the voting interface
2. Review available candidates:
   - **Candidate A** - Party A
   - **Candidate B** - Party B 
   - **Candidate C** - Party C
3. Select your preferred candidate
4. Confirm your vote selection
5. Transaction is processed on the blockchain
6. Receive transaction hash as vote receipt

#### 4. View Results
1. Navigate to "Results" section
2. View real-time vote counts from blockchain
3. See total votes cast and individual candidate results
4. All data is transparently stored on blockchain

#### 5. Verify Your Vote
1. Use your transaction hash to verify vote on blockchain
2. Access vote verification through transaction receipt
3. Confirm your vote was counted correctly

## 🔧 API Endpoints

### Identity Management Endpoints

#### User Registration
```http
POST /api/register
Content-Type: application/json

{
  "uniqueNumber": "123456789012",  // optional
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "location": "New York, NY",
  "phoneNumber": "+1234567890",    // optional
  "email": "john@example.com"      // optional
}
```

#### Fingerprint Registration
```http
POST /api/register-fingerprint
Content-Type: application/json

{
  "userId": 1,
  "fingerprintData": "base64_encoded_fingerprint_data"
}
```

#### Identity Verification
```http
POST /api/verify-fingerprint
Content-Type: application/json

{
  "fingerprintData": "base64_encoded_fingerprint_data"
}
```

### Blockchain Voting Endpoints

#### Cast Vote (Master Branch Integration)
```http
POST /api/cast-vote
Content-Type: application/json

{
  "token": "OACT_1234567890_randomhex",
  "candidate": "Candidate A",  // "Candidate A", "Candidate B", or "Candidate C"
  "userId": 1                  // optional, for Aadhaar integration
}
```

#### Get Voting Results
```http
GET /api/results
```

#### Check Voter Status
```http
GET /api/voter-status/{address}
```

#### Legacy Voting Endpoint (Ankit Branch Compatibility)
```http
POST /api/voting/cast
Content-Type: application/json

{
  "candidateId": 1,           // 1, 2, or 3
  "userId": 1,
  "candidateName": "Candidate A"
}
```

#### Get Blockchain Results (Enhanced)
```http
GET /api/blockchain/results
```

### System Endpoints

#### Health Check
```http
GET /api/health
```

#### Admin: Reset Votes
```http
POST /api/admin/reset-votes
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Fingerprints Table
```sql
CREATE TABLE fingerprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fingerprint_hash TEXT NOT NULL,
    fingerprint_template TEXT NOT NULL,  -- encrypted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Voting Status Table
```sql
CREATE TABLE voting_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    has_voted BOOLEAN DEFAULT 0,
    voted_at DATETIME,
    transaction_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Votes Table (Receipt Storage)
```sql
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    candidate_id INTEGER,
    candidate_name TEXT,
    candidate_party TEXT,
    transaction_hash TEXT NOT NULL,
    block_number INTEGER,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔐 Security Features

- **Data Encryption**: AES-256 encryption for fingerprint templates
- **Secure Hashing**: SHA-256 hashing for fingerprint matching
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Comprehensive server-side validation
- **HTTPS Ready**: Production-ready SSL/TLS configuration
- **Local Storage**: No external dependencies or cloud storage

## 📁 Project Structure

```
E-Vote/
├── 📁 frontend/                    # React application (Vite)
│   ├── 📁 src/
│   │   ├── 📁 components/          # React components
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Register.jsx        # User registration
│   │   │   ├── Verify.jsx          # Identity verification
│   │   │   ├── Voting.jsx          # Blockchain voting interface
│   │   │   ├── Results.jsx         # Vote results display
│   │   │   └── FingerprintCapture.jsx  # Biometric capture
│   │   └── 📁 styles/              # CSS stylesheets
│   └── package.json
├── 📁 contracts/                  # Smart contracts
│   ├── SecureVoting.sol         # Master branch voting contract
│   └── EVoting.sol              # Legacy contract
├── 📁 scripts/                   # Deployment scripts
│   └── deploy.js                # Contract deployment
├── 📁 utils/                     # Blockchain utilities
│   └── blockchainUtils.js       # Master branch blockchain integration
├── 📁 voting-backend/            # Master branch voting backend
│   ├── 📁 routes/              # API routes
│   │   └── voting.js           # Voting endpoints
│   ├── 📁 utils/               # Contract utilities
│   │   └── contract.js         # Professional contract interaction
│   └── server.js                # Backend server
├── 📁 voting-frontend/           # Master branch voting frontend
│   └── package.json
├── 📁 artifacts/                 # Compiled contracts
│   └── 📁 contracts/
│       └── SecureVoting.sol/
│           └── SecureVoting.json   # Contract ABI
├── 📄 server.js                    # Main Express server (integrated)
├── 📄 database.js                  # SQLite database manager
├── 📄 hardhat.config.js            # Hardhat configuration
├── 📄 package.json                 # Main project dependencies
├── 📄 deployment-info.json         # Contract deployment info
├── 📄 start-system.ps1             # System startup script
└── 📄 aadhaar_demo.db              # SQLite database (auto-created)
```

## 🖥️ Browser Compatibility

| Browser | WebAuthn Support | Fingerprint Capture | Status |
|---------|------------------|---------------------|--------|
| Chrome 67+ | ✅ | ✅ | Full Support |
| Firefox 60+ | ✅ | ✅ | Full Support |
| Edge 79+ | ✅ | ✅ | Full Support |
| Safari 14+ | ✅ | ⚠️ | Limited |
| Mobile Browsers | ✅ | ⚠️ | Simulation Mode |

## 🚨 Demo Limitations

- **Local Development**: Not production-ready, requires additional security hardening
- **Fingerprint Simulation**: Falls back to simulated fingerprints when WebAuthn unavailable
- **Single Device**: Database stored locally, not synchronized across devices
- **Demo Purpose**: Educational demonstration, not for real identity management

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use**
```powershell
# Windows - Kill processes using ports 3000, 5173, or 8545
netstat -ano | findstr :3000
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F

netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

**Dependencies Not Installing**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Smart Contract Compilation Issues**
```bash
# Clear Hardhat cache and recompile
Remove-Item -Recurse -Force cache
Remove-Item -Recurse -Force artifacts
npx hardhat compile
```

**Blockchain Connection Issues**
- Ensure Hardhat node is running: `npm run node`
- Check if contract is deployed: `npm run deploy-local`
- Verify environment variables in `.env` file
- Check console for Web3 connection errors

**WebAuthn Not Working**
- Ensure you're using HTTPS or localhost
- Check browser console for errors
- Use fingerprint simulation as fallback
- Enable Windows Hello if using real biometrics

**Vote Transaction Failures**
- Check if you have sufficient ETH for gas fees
- Verify you haven't already voted
- Ensure blockchain node is running
- Check transaction hash in blockchain explorer

**Environment Setup Issues**
```bash
# Create .env file with required variables
SEPOLIA_RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=deployed_contract_address
```

## ⚖️ Integration Details

This E-Vote system combines:

- **Master Branch**: Professional blockchain voting implementation with proven smart contracts
- **Ankit Branch**: Comprehensive Aadhaar authentication and user management system

### What's Integrated:
✅ **Master's Blockchain Layer**: Clean `SecureVoting.sol` contract with enum-based candidates
✅ **Master's Utilities**: Professional error handling and gas estimation
✅ **Ankit's Authentication**: Complete fingerprint-based user verification
✅ **Ankit's Database**: SQLite storage for user data and vote records
✅ **Combined API**: Unified endpoints supporting both systems
✅ **Preserved Features**: All existing functionality maintained

## 🤝 Contributing

This is a demonstration project showcasing blockchain voting with identity verification. For production use, consider:

### Security Enhancements
- Additional security auditing and penetration testing
- Database encryption at rest and in transit
- Advanced user session management
- Multi-factor authentication beyond biometrics
- Smart contract formal verification
- Gas optimization and DoS protection

### Compliance Considerations
- GDPR and data protection regulation compliance
- Election security standards adherence
- Accessibility requirements (WCAG compliance)
- Audit trail and transparency features

### Scalability Improvements
- Layer 2 blockchain solutions for reduced gas costs
- Database clustering and replication
- Load balancing for high-traffic scenarios
- CDN integration for static assets

## 📄 License

MIT License - See LICENSE file for details.

---

**⚠️ Disclaimer**: This system is for educational and demonstration purposes only. It combines blockchain voting technology with biometric authentication for learning purposes. Not intended for production use with real personal data or actual elections without proper security auditing and compliance verification.

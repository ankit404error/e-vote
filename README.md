# Secure E-Voting System with Blockchain & Aadhaar Integration

This project is a comprehensive electronic voting system that leverages
blockchain technology for immutable vote recording and Aadhaar-based biometric
authentication for voter verification.

## 📂 Project Structure

- **`server.js`**: The main entry point for the backend server (Express.js).
  Handles API requests, database interactions, and blockchain communication.
- **`frontend/`**: The main React-based frontend application. User interface for
  voting and administration.
- **`contracts/`**: Solidity smart contracts for the voting logic on the
  Ethereum blockchain.
- **`scripts/`**: Scripts for deploying contracts and managing the blockchain
  network.
- **`aadhaar_demo.db`**: SQLite database file storing user registration and
  voting status (do not delete).
- **`trash/`**: Contains unused or legacy files (e.g., old versions, temporary
  scripts).

## 🚀 Getting Started

Follow these steps to set up and run the system locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- Git

### 2. Installation

Install dependencies for both the root (backend) and the frontend.

**Backend (Root):**

```bash
npm install
```

**Frontend:**

```bash
cd frontend
npm install
cd ..
```

---

## 🏃‍♂️ How to Run

You typically need two terminal windows running simultaneously: one for the
backend and one for the frontend.

### Terminal 1: Backend & Blockchain Integration

This starts the Express server on port `4000` and initializes the blockchain
connection.

```bash
# From the root directory
npm start
```

_Alternatively, for development with auto-restart:_ `npm run dev`

### Terminal 2: Frontend

This starts the React development server, usually on port `5173`.

```bash
# Navigate to the frontend directory
cd frontend

# Start the development server
npm run dev
```

Open your browser and navigate to the URL shown (usually
`http://localhost:5173`).

---

## 🛠️ Important Commands

The root `package.json` includes several helper scripts:

### Blockchain & Deployment

- **`npm run deploy`**: Deploy smart contracts to the Sepolia testnet.
- **`npm run deploy-local`**: Deploy smart contracts to a local Hardhat network.
- **`npm run network:status`**: Check the current configured blockchain network.
- **`npm run network:sepolia`**: Switch configuration to use Sepolia testnet.
- **`npm run network:local`**: Switch configuration to use local network.

### Testing

- **`npm test`**: Run Hardhat tests for smart contracts.
- **`npm run test:voting-prevention`**: Run specific voting prevention tests.

### Management

- **`npm run voting-status`**: Check the current status of the voting process.
- **`npm run voting-enable`**: Enable the voting process.
- **`npm run voting-disable`**: Disable the voting process.

## 🧹 Cleanup

A `trash` folder has been created to store legacy files and old documentation to
keep the root directory clean. These files are ignored by git.

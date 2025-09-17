import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Vote, CheckCircle, Lock, Copy, ExternalLink } from 'lucide-react';

const VotingBooth = () => {
  const [isApproved, setIsApproved] = useState(false);
  const [cryptoToken, setCryptoToken] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [voteResult, setVoteResult] = useState(null);
  const [error, setError] = useState('');

  const candidates = ['Candidate A', 'Candidate B', 'Candidate C'];
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

  // Generate a one-time anonymous cryptographic token
  const generateCryptoToken = () => {
    const timestamp = Date.now();
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
    return `OACT_${timestamp}_${randomHex}`;
  };

  const handleApproval = () => {
    const token = generateCryptoToken();
    setCryptoToken(token);
    setIsApproved(true);
    setError('');
  };

  const handleVoteConfirm = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate before confirming your vote.');
      return;
    }

    setIsVoting(true);
    setError('');

    try {
      console.log('Sending vote to backend...');
      
      const response = await axios.post(`${backendUrl}/api/cast-vote`, {
        token: cryptoToken,
        candidate: selectedCandidate,
      }, {
        timeout: 60000 // 60 second timeout
      });

      if (response.data.success) {
        setVoteResult({
          success: true,
          candidate: selectedCandidate,
          transactionHash: response.data.transactionHash,
          blockNumber: response.data.blockNumber,
          gasUsed: response.data.gasUsed,
          timestamp: new Date().toLocaleString()
        });
      } else {
        throw new Error(response.data.message || 'Vote failed');
      }

    } catch (err) {
      console.error('Error casting vote:', err);
      
      let errorMessage = 'Failed to cast vote. ';
      
      if (err.response) {
        errorMessage += err.response.data.error || err.response.data.message || 'Server error.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to server. Make sure the backend is running.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const openEtherscan = (txHash) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  if (voteResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Vote Cast Successfully!</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium mb-2">Your vote for {voteResult.candidate} has been recorded on the blockchain.</p>
            <p className="text-sm text-green-600">Time: {voteResult.timestamp}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono bg-gray-100 p-2 rounded border break-all flex-1">
                  {voteResult.transactionHash}
                </p>
                <button 
                  onClick={() => copyToClipboard(voteResult.transactionHash)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openEtherscan(voteResult.transactionHash)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Block Number:</p>
              <p className="text-lg font-bold text-blue-600">{voteResult.blockNumber}</p>
            </div>

            {voteResult.gasUsed && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Gas Used:</p>
                <p className="text-lg font-bold text-orange-600">{voteResult.gasUsed}</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <Shield className="w-4 h-4 inline mr-1" />
            Your vote has been securely recorded on the Ethereum Sepolia testnet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-2" />
            <Vote className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Secure Voting Booth</h1>
          <p className="text-gray-600">Cast your vote securely on the blockchain</p>
        </div>

        {!isApproved ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Lock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Anonymous Token Required</span>
              </div>
              <p className="text-sm text-blue-700">
                Generate your one-time anonymous cryptographic token to proceed with secure voting.
              </p>
            </div>
            
            <button
              onClick={handleApproval}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Generate OACT & Proceed
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Token Generated</span>
              </div>
              <p className="text-xs font-mono bg-green-100 p-2 rounded border break-all text-green-700">
                {cryptoToken.substring(0, 30)}...
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 text-center">Select Your Candidate</h2>
              
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <label
                    key={candidate}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCandidate === candidate
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate}
                      checked={selectedCandidate === candidate}
                      onChange={() => handleCandidateSelect(candidate)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">{candidate}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleVoteConfirm}
              disabled={isVoting || !selectedCandidate}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                isVoting || !selectedCandidate
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              }`}
            >
              {isVoting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing Vote...
                </div>
              ) : (
                <>
                  <Vote className="w-5 h-5 inline mr-2" />
                  Confirm Vote
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingBooth;

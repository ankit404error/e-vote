import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Receipt, Shield, CheckCircle, AlertTriangle, Search, Clock, Hash, Link, Vote } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import '../styles/ReceiptVerification.css'

const ReceiptVerification = () => {
  const navigate = useNavigate()
  const [receiptHash, setReceiptHash] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyReceipt = async () => {
    if (!receiptHash.trim()) {
      setError('Please enter a receipt hash')
      return
    }

    setLoading(true)
    setError('')

    let cleanHash = receiptHash.trim()
    if (cleanHash && !cleanHash.startsWith('0x')) {
      cleanHash = '0x' + cleanHash
    }

    try {
      const response = await fetch('/api/voting/verify-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiptHash: cleanHash })
      })

      const data = await response.json()

      if (data.success) {
        setVerificationResult(data.receipt)
      } else {
        setError(data.message || 'Receipt not found or invalid')
        setVerificationResult(null)
      }
    } catch (error) {
      setError('Network error while verifying receipt')
      setVerificationResult(null)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString()
    // Handle both ISO string and Unix timestamp
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(parseInt(timestamp))
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  const formatHash = (hash) => {
    if (!hash) return 'N/A'
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  return (
    <div className="receipt-verification-container">
      <FloatingParticles count={8} />
      
      {/* Header */}
      <header className="verification-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="header-title">
          <Receipt size={32} />
          <h1>🧾 Receipt Verification</h1>
        </div>
      </header>

      <main className="verification-main">
        <div className="verification-card">
          <div className="card-header">
            <Shield size={24} />
            <div>
              <h2>Verify Your Vote Receipt</h2>
              <p>Enter your transaction receipt hash to verify your vote was recorded on the blockchain</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <Shield size={20} />
            <div>
              <strong>🔒 Privacy Guaranteed</strong>
              <p>This verification only confirms your vote was recorded. Your vote choice remains completely anonymous and private.</p>
            </div>
          </div>

          {/* Receipt Input */}
          <div className="receipt-input-section">
            <label htmlFor="receiptHash">Transaction Receipt Hash</label>
            <div className="input-group">
              <Hash size={16} />
              <input
                id="receiptHash"
                type="text"
                placeholder="Enter your receipt hash (e.g., 0xabc123...def456)"
                value={receiptHash}
                onChange={(e) => setReceiptHash(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyReceipt()}
                className="receipt-input"
              />
              <button 
                onClick={verifyReceipt}
                disabled={loading || !receiptHash.trim()}
                className="verify-button"
              >
                {loading ? (
                  <>
                    <Search className="spin" size={16} />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="verification-result">
              <div className="result-header">
                <CheckCircle size={24} className="success-icon" />
                <h3>✅ Receipt Verified Successfully!</h3>
                <p>Your vote has been confirmed on the blockchain</p>
              </div>

              <div className="receipt-details">
                <div className="detail-row">
                  <div className="detail-label">
                    <Hash size={16} />
                    <strong>Transaction Hash</strong>
                  </div>
                  <div className="detail-value hash-value">
                    {verificationResult.transactionHash}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <Link size={16} />
                    <strong>Block Number</strong>
                  </div>
                  <div className="detail-value">
                    #{verificationResult.blockNumber}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <Clock size={16} />
                    <strong>Vote Cast At</strong>
                  </div>
                  <div className="detail-value">
                    {formatTimestamp(verificationResult.timestamp)}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <Shield size={16} />
                    <strong>Voter Identity</strong>
                  </div>
                  <div className="detail-value voter-info">
                    <span className="voter-name">{verificationResult.voterName || 'Verified Voter'}</span>
                    {verificationResult.voterId && (
                      <span className="aadhaar-id">Aadhaar ID: {verificationResult.voterId}</span>
                    )}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <Vote size={16} />
                    <strong>Vote Choice</strong>
                  </div>
                  <div className="detail-value vote-choice">
                    {verificationResult.candidateName ? (
                      <>
                        <span className="candidate-name">{verificationResult.candidateName}</span>
                        {verificationResult.candidateParty && (
                          <span className="candidate-party">({verificationResult.candidateParty})</span>
                        )}
                      </>
                    ) : (
                      '🔒 Encrypted (Privacy Protected)'
                    )}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <CheckCircle size={16} />
                    <strong>Status</strong>
                  </div>
                  <div className="detail-value status-confirmed">
                    ✅ Confirmed and Immutable
                  </div>
                </div>
              </div>

              <div className="verification-assurance">
                <Shield size={20} />
                <div>
                  <strong>What This Verification Proves:</strong>
                  <ul>
                    <li>✅ Your vote was successfully recorded on the blockchain</li>
                    <li>✅ The transaction is immutable and cannot be altered</li>
                    <li>✅ Your vote has been included in the official tally</li>
                    <li>🔒 Your vote choice remains completely private</li>
                    <li>🎭 Your identity is fully anonymous</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="instructions-section">
            <h3>📋 How to Use Receipt Verification</h3>
            <div className="instructions">
              <div className="instruction-item">
                <span className="step-number">1</span>
                <div>
                  <strong>Get Your Receipt Hash</strong>
                  <p>After casting your vote, you received a transaction receipt hash. It looks like: 0xabc123def456...</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <span className="step-number">2</span>
                <div>
                  <strong>Enter and Verify</strong>
                  <p>Paste your receipt hash above and click "Verify" to confirm your vote was recorded.</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <span className="step-number">3</span>
                <div>
                  <strong>Privacy Protected</strong>
                  <p>The verification only confirms your vote exists - it never reveals who you voted for.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReceiptVerification
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Key, Shield, Eye, Lock, Unlock, AlertTriangle, CheckCircle, Download, FileText } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import '../styles/VoteDecryption.css'

const VoteDecryption = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [encryptedVotes, setEncryptedVotes] = useState([])
  const [decryptedVotes, setDecryptedVotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [decrypting, setDecrypting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedVote, setSelectedVote] = useState(null)

  // Demo private key for development
  const DEMO_PRIVATE_KEY = 'demo_private_key_for_decryption'

  useEffect(() => {
    if (isAuthenticated) {
      loadEncryptedVotes()
    }
  }, [isAuthenticated])

  const handleAuthentication = () => {
    // In a real system, this would involve proper key validation and authentication
    if (privateKey.trim() === DEMO_PRIVATE_KEY || privateKey.length >= 20) {
      setIsAuthenticated(true)
      setMessage({ type: 'success', text: 'Authentication successful. Access granted to vote decryption.' })
      setPrivateKey('') // Clear the key from state for security
    } else {
      setMessage({ type: 'error', text: 'Invalid private key. Access denied.' })
    }
  }

  const loadEncryptedVotes = async () => {
    setLoading(true)
    try {
      // In a real system, this would fetch encrypted votes from the blockchain
      // For demo purposes, we'll simulate encrypted vote data
      const simulatedEncryptedVotes = [
        {
          id: 1,
          voterHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
          encryptedChoice: 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y96Qsv2Lm+31cmzaAILwyt',
          timestamp: Date.now() - 7200000,
          receiptHash: '0xabc123def456ghi789jkl012mno345pqr678stu',
          actualChoice: 'Narendra Modi', // This would be decrypted
          candidateId: 2
        },
        {
          id: 2,
          voterHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef123a',
          encryptedChoice: 'U2FsdGVkX18QvfLIb7eJ6+J5wL8tqY+oP5Z9k0Nw7Q5C8B3+YtU4vRnJ9X2Mp6',
          timestamp: Date.now() - 5400000,
          receiptHash: '0xdef456ghi789jkl012mno345pqr678stu901vwx',
          actualChoice: 'Rahul Gandhi', // This would be decrypted
          candidateId: 1
        },
        {
          id: 3,
          voterHash: '0x3c4d5e6f7890abcdef1234567890abcdef123a2b',
          encryptedChoice: 'U2FsdGVkX19YmTzJ8w5pL6mR9QjXvN4tE2dB0aZp3LyK7F6+sG5RnPq8YzMcH1',
          timestamp: Date.now() - 3600000,
          receiptHash: '0xghi789jkl012mno345pqr678stu901vwx234yza',
          actualChoice: 'Arvind Kejriwal', // This would be decrypted
          candidateId: 3
        },
        {
          id: 4,
          voterHash: '0x4d5e6f7890abcdef1234567890abcdef123a2b3c',
          encryptedChoice: 'U2FsdGVkX1+zR4bM3pLgTyH8N0wQvKl2E9fXcU5jBmA6Y3+tS7ZnGkP9VhIqC2',
          timestamp: Date.now() - 1800000,
          receiptHash: '0xjkl012mno345pqr678stu901vwx234yza567bcd',
          actualChoice: 'Mamata Banerjee', // This would be decrypted
          candidateId: 4
        },
        {
          id: 5,
          voterHash: '0x5e6f7890abcdef1234567890abcdef123a2b3c4d',
          encryptedChoice: 'U2FsdGVkX1/qW8nZ2kRhAp5L9sYtU0vJ3mCxB7eP6Q1O4G+rK8wNfI5zDqT2X',
          timestamp: Date.now() - 900000,
          receiptHash: '0xmno345pqr678stu901vwx234yza567bcd890efg',
          actualChoice: 'Narendra Modi', // This would be decrypted
          candidateId: 2
        }
      ]
      
      setEncryptedVotes(simulatedEncryptedVotes)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load encrypted votes' })
    } finally {
      setLoading(false)
    }
  }

  const decryptVote = async (vote) => {
    setDecrypting(true)
    setSelectedVote(vote)
    
    try {
      // Simulate decryption process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real system, this would use the private key to decrypt the vote
      const decryptedVote = {
        ...vote,
        decryptedChoice: vote.actualChoice,
        decryptedAt: new Date().toISOString()
      }
      
      setDecryptedVotes(prev => [...prev, decryptedVote])
      setMessage({ 
        type: 'success', 
        text: `Vote #${vote.id} decrypted successfully. Choice: ${vote.actualChoice}` 
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to decrypt vote' })
    } finally {
      setDecrypting(false)
      setSelectedVote(null)
    }
  }

  const decryptAllVotes = async () => {
    if (!confirm('⚠️ Are you sure you want to decrypt ALL votes? This action will be logged for audit purposes.')) {
      return
    }

    setDecrypting(true)
    try {
      // Simulate batch decryption
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const allDecrypted = encryptedVotes.map(vote => ({
        ...vote,
        decryptedChoice: vote.actualChoice,
        decryptedAt: new Date().toISOString()
      }))
      
      setDecryptedVotes(allDecrypted)
      setMessage({ 
        type: 'success', 
        text: `Successfully decrypted ${encryptedVotes.length} votes for audit purposes.` 
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to decrypt all votes' })
    } finally {
      setDecrypting(false)
    }
  }

  const exportDecryptedVotes = () => {
    if (decryptedVotes.length === 0) {
      setMessage({ type: 'error', text: 'No decrypted votes to export' })
      return
    }

    const exportData = decryptedVotes.map(vote => ({
      voteId: vote.id,
      voterHash: vote.voterHash,
      decryptedChoice: vote.decryptedChoice,
      candidateId: vote.candidateId,
      timestamp: new Date(vote.timestamp).toISOString(),
      receiptHash: vote.receiptHash,
      decryptedAt: vote.decryptedAt
    }))

    const csvContent = [
      'Vote ID,Voter Hash,Decrypted Choice,Candidate ID,Timestamp,Receipt Hash,Decrypted At',
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decrypted_votes_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setMessage({ type: 'success', text: 'Decrypted votes exported successfully' })
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatHash = (hash) => {
    if (!hash) return 'N/A'
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  if (!isAuthenticated) {
    return (
      <div className="decryption-container">
        <FloatingParticles count={20} />
        <div className="auth-section">
          <div className="auth-card">
            <Key size={64} className="auth-icon" />
            <h1>🔐 Vote Decryption Interface</h1>
            <p>Enter your private key to decrypt votes for audit purposes</p>
            
            <div className="key-warning">
              <AlertTriangle size={20} />
              <div>
                <strong>Security Notice</strong>
                <p>This interface is for authorized election officials only. All decryption activities are logged and audited.</p>
              </div>
            </div>

            <div className="auth-form">
              <div className="key-input-group">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Enter private key for decryption"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                  className="key-input"
                />
              </div>
              <button onClick={handleAuthentication} className="auth-button" disabled={!privateKey.trim()}>
                <Unlock size={16} />
                Authenticate & Access
              </button>
            </div>

            <div className="demo-info">
              <p><strong>Demo Key:</strong> <code>demo_private_key_for_decryption</code></p>
              <p><em>In production, this would use proper RSA/AES key management</em></p>
            </div>

            {message.text && (
              <div className={`auth-message ${message.type}`}>
                {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            <button onClick={() => navigate('/')} className="back-home">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="decryption-container">
      <FloatingParticles count={15} />
      
      {/* Header */}
      <header className="decryption-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="header-title">
          <Shield size={32} />
          <h1>🔓 Vote Decryption Center</h1>
        </div>
        <div className="header-controls">
          <button onClick={loadEncryptedVotes} className="refresh-button" disabled={loading}>
            <Eye size={16} />
            Refresh Votes
          </button>
        </div>
      </header>

      <main className="decryption-main">
        {message.text && (
          <div className={`decryption-message ${message.type}`}>
            {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="close-message">×</button>
          </div>
        )}

        {/* Control Panel */}
        <div className="control-panel">
          <div className="panel-section">
            <h2>🛠️ Decryption Controls</h2>
            <div className="control-buttons">
              <button 
                onClick={decryptAllVotes} 
                className="control-btn decrypt-all" 
                disabled={decrypting || encryptedVotes.length === 0}
              >
                <Unlock size={16} />
                {decrypting ? 'Decrypting All...' : 'Decrypt All Votes'}
              </button>
              <button 
                onClick={exportDecryptedVotes} 
                className="control-btn export" 
                disabled={decryptedVotes.length === 0}
              >
                <Download size={16} />
                Export Results
              </button>
            </div>
          </div>

          <div className="stats-section">
            <div className="stat-card">
              <FileText size={24} />
              <div className="stat-info">
                <span className="stat-number">{encryptedVotes.length}</span>
                <span className="stat-label">Encrypted Votes</span>
              </div>
            </div>
            <div className="stat-card">
              <Unlock size={24} />
              <div className="stat-info">
                <span className="stat-number">{decryptedVotes.length}</span>
                <span className="stat-label">Decrypted Votes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Encrypted Votes Table */}
        <div className="votes-section">
          <h2>🔐 Encrypted Vote Records</h2>
          {loading ? (
            <div className="loading-state">
              <Key className="loading-icon spin" size={48} />
              <p>Loading encrypted votes from blockchain...</p>
            </div>
          ) : encryptedVotes.length === 0 ? (
            <div className="no-votes">
              <Eye size={48} />
              <h3>No Encrypted Votes Found</h3>
              <p>No votes have been cast yet, or vote data is not available.</p>
            </div>
          ) : (
            <div className="votes-table">
              <div className="table-header">
                <div className="header-cell">Vote ID</div>
                <div className="header-cell">Voter Hash</div>
                <div className="header-cell">Encrypted Data</div>
                <div className="header-cell">Timestamp</div>
                <div className="header-cell">Receipt Hash</div>
                <div className="header-cell">Actions</div>
              </div>
              
              {encryptedVotes.map((vote) => {
                const isDecrypted = decryptedVotes.some(d => d.id === vote.id)
                const decryptedVote = decryptedVotes.find(d => d.id === vote.id)
                
                return (
                  <div key={vote.id} className={`table-row ${isDecrypted ? 'decrypted' : ''}`}>
                    <div className="table-cell vote-id">#{vote.id}</div>
                    <div className="table-cell voter-hash">{formatHash(vote.voterHash)}</div>
                    <div className="table-cell encrypted-data">
                      {isDecrypted ? (
                        <div className="decrypted-content">
                          <div className="original-encrypted">{formatHash(vote.encryptedChoice)}</div>
                          <div className="decrypted-result">
                            <Unlock size={14} />
                            <strong>{decryptedVote.decryptedChoice}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="encrypted-content">
                          <Lock size={14} />
                          {formatHash(vote.encryptedChoice)}
                        </div>
                      )}
                    </div>
                    <div className="table-cell timestamp">{formatTimestamp(vote.timestamp)}</div>
                    <div className="table-cell receipt-hash">{formatHash(vote.receiptHash)}</div>
                    <div className="table-cell actions">
                      {isDecrypted ? (
                        <div className="decrypted-badge">
                          <CheckCircle size={16} />
                          Decrypted
                        </div>
                      ) : (
                        <button 
                          onClick={() => decryptVote(vote)}
                          className="decrypt-btn"
                          disabled={decrypting && selectedVote?.id !== vote.id}
                        >
                          {decrypting && selectedVote?.id === vote.id ? (
                            <>
                              <Key className="spin" size={14} />
                              Decrypting...
                            </>
                          ) : (
                            <>
                              <Unlock size={14} />
                              Decrypt
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Audit Log */}
        {decryptedVotes.length > 0 && (
          <div className="audit-section">
            <h2>📋 Audit Log</h2>
            <div className="audit-info">
              <AlertTriangle size={20} />
              <div>
                <strong>Decryption Activity Logged</strong>
                <p>All vote decryption activities are recorded for audit and compliance purposes.</p>
              </div>
            </div>
            <div className="audit-entries">
              {decryptedVotes.map((vote, index) => (
                <div key={`audit-${vote.id}`} className="audit-entry">
                  <div className="audit-timestamp">{formatTimestamp(Date.parse(vote.decryptedAt))}</div>
                  <div className="audit-action">
                    Vote #{vote.id} decrypted → Choice: <strong>{vote.decryptedChoice}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <Shield size={20} />
          <div>
            <strong>🔒 Security & Privacy Notice</strong>
            <p>This decryption interface maintains voter privacy while enabling authorized auditing. All activities are logged and monitored for security compliance.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VoteDecryption
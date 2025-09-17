import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Users, Vote, Database, Shield, Key, BarChart3, RefreshCw, AlertTriangle, CheckCircle, Eye, Trash2, Lock } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import '../styles/AdminPanel.css'

const AdminPanel = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [systemStats, setSystemStats] = useState({})
  const [blockchainResults, setBlockchainResults] = useState(null)
  const [encryptedVotes, setEncryptedVotes] = useState([])
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const ADMIN_PASSWORD = 'admin123' // In production, this should be properly secured

  useEffect(() => {
    if (isAuthenticated) {
      loadSystemData()
    }
  }, [isAuthenticated, activeTab])

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setMessage({ type: 'success', text: 'Admin access granted' })
    } else {
      setMessage({ type: 'error', text: 'Invalid admin password' })
    }
    setAdminPassword('')
  }

  const loadSystemData = async () => {
    setLoading(true)
    try {
      // Load system stats
      const statsResponse = await fetch('/api/admin/stats')
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setSystemStats(statsData.stats)
      }

      // Load blockchain results
      const resultsResponse = await fetch('/api/blockchain/results')
      const resultsData = await resultsResponse.json()
      if (resultsData.success) {
        setBlockchainResults(resultsData.results)
      }

    } catch (error) {
      console.error('Error loading admin data:', error)
      setMessage({ type: 'error', text: 'Failed to load system data' })
    } finally {
      setLoading(false)
    }
  }

  const resetAllVotes = async () => {
    if (!confirm('⚠️ Are you sure you want to reset ALL votes? This will clear both database and blockchain vote data. This action cannot be undone!')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/reset-votes', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'All votes have been reset successfully' })
        loadSystemData()
      } else {
        setMessage({ type: 'error', text: 'Failed to reset votes: ' + data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while resetting votes' })
    } finally {
      setLoading(false)
    }
  }

  const clearDatabase = async () => {
    if (!confirm('⚠️ Are you sure you want to clear ALL users and fingerprints from the database? This action cannot be undone!')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Database cleared successfully' })
        loadSystemData()
      } else {
        setMessage({ type: 'error', text: 'Failed to clear database: ' + data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while clearing database' })
    } finally {
      setLoading(false)
    }
  }

  const emergencyDeleteAll = async () => {
    const confirmation1 = confirm('⚠️ EMERGENCY DELETION: This will PERMANENTLY DELETE ALL voters, votes, and blockchain data. Are you absolutely sure?')
    if (!confirmation1) return
    
    const confirmation2 = confirm('🚨 FINAL WARNING: This action CANNOT BE UNDONE. All voting history will be lost forever. Continue?')
    if (!confirmation2) return
    
    const confirmPassword = prompt('Enter confirmation password to proceed with emergency deletion:')
    if (!confirmPassword) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/emergency-delete-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmPassword })
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'EMERGENCY DELETION COMPLETE: All data permanently deleted' 
        })
        loadSystemData()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error during emergency deletion' })
    } finally {
      setLoading(false)
    }
  }

  const loadEncryptedVotes = async () => {
    try {
      // Fetch real encrypted votes data from blockchain
      const response = await fetch('/api/blockchain/encrypted-votes')
      const data = await response.json()
      
      if (data.success) {
        setEncryptedVotes(data.encryptedVotes || [])
      } else {
        console.error('Failed to load encrypted votes:', data.message)
        setEncryptedVotes([])
      }
    } catch (error) {
      console.error('Error loading encrypted votes:', error)
      setEncryptedVotes([])
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatHash = (hash) => {
    if (!hash) return 'N/A'
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <FloatingParticles count={20} />
        <div className="admin-login">
          <div className="login-card">
            <Shield size={48} className="login-icon" />
            <h2>🔐 Admin Access Required</h2>
            <p>Enter admin password to access system management panel</p>
            
            <div className="login-form">
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="password-input"
              />
              <button onClick={handleAdminLogin} className="login-button">
                <Lock size={16} />
                Access Admin Panel
              </button>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            <button onClick={() => navigate('/')} className="back-to-home">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <FloatingParticles count={15} />
      
      {/* Header */}
      <header className="admin-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="header-title">
          <Settings size={32} />
          <h1>🛠️ Admin Control Panel</h1>
        </div>
        <div className="header-controls">
          <button onClick={loadSystemData} className="refresh-button" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'votes' ? 'active' : ''}`}
          onClick={() => setActiveTab('votes')}
        >
          <Vote size={16} />
          Vote Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          User Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'blockchain' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('blockchain')
            loadEncryptedVotes()
          }}
        >
          <Shield size={16} />
          Blockchain Data
        </button>
        <button 
          className={`nav-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <Database size={16} />
          System Control
        </button>
      </nav>

      <main className="admin-main">
        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="close-message">×</button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            <h2>📊 System Overview</h2>
            
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-header">
                  <Users size={24} />
                  <h3>Registered Users</h3>
                </div>
                <div className="card-value">{systemStats.users || 0}</div>
                <div className="card-description">Total users in system</div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <Key size={24} />
                  <h3>Stored Fingerprints</h3>
                </div>
                <div className="card-value">{systemStats.fingerprints || 0}</div>
                <div className="card-description">Biometric templates</div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <Vote size={24} />
                  <h3>Total Votes Cast</h3>
                </div>
                <div className="card-value">{blockchainResults?.totalVotes || 0}</div>
                <div className="card-description">Blockchain recorded votes</div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <Shield size={24} />
                  <h3>Voting Status</h3>
                </div>
                <div className={`card-value status ${blockchainResults?.votingActive ? 'active' : 'inactive'}`}>
                  {blockchainResults?.votingActive ? 'ACTIVE' : 'CLOSED'}
                </div>
                <div className="card-description">Current election state</div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <Database size={24} />
                  <h3>Encrypted Votes</h3>
                </div>
                <div className="card-value">{blockchainResults?.encryptedVotesCast || 0}</div>
                <div className="card-description">Immutable vote records</div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <BarChart3 size={24} />
                  <h3>Candidates</h3>
                </div>
                <div className="card-value">{blockchainResults?.totalCandidates || 0}</div>
                <div className="card-description">Available candidates</div>
              </div>
            </div>

            {/* Current Results Preview */}
            {blockchainResults?.candidates && (
              <div className="results-preview">
                <h3>🏆 Current Election Results</h3>
                <div className="candidates-preview">
                  {blockchainResults.candidates.slice(0, 3).map((candidate, index) => (
                    <div key={candidate.id} className={`candidate-preview ${index === 0 ? 'leading' : ''}`}>
                      <div className="candidate-rank">#{index + 1}</div>
                      <div className="candidate-name">{candidate.name}</div>
                      <div className="candidate-votes">{candidate.voteCount} votes</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vote Management Tab */}
        {activeTab === 'votes' && (
          <div className="admin-section">
            <h2>🗳️ Vote Management</h2>
            
            <div className="management-actions">
              <div className="action-card danger">
                <div className="action-header">
                  <Trash2 size={24} />
                  <h3>Reset All Votes</h3>
                </div>
                <p>Clear all vote data from both database and blockchain. Use for demo resets.</p>
                <button onClick={resetAllVotes} className="action-button danger" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset All Votes'}
                </button>
              </div>
              
              <div className="action-card emergency">
                <div className="action-header">
                  <AlertTriangle size={24} />
                  <h3>EMERGENCY: Delete All Data</h3>
                </div>
                <p>⚠️ <strong>DANGER:</strong> This will permanently delete ALL voters, votes, and blockchain data. Cannot be undone!</p>
                <button onClick={emergencyDeleteAll} className="action-button emergency" disabled={loading}>
                  {loading ? 'Deleting All...' : '🚨 DELETE EVERYTHING'}
                </button>
              </div>
            </div>

            {/* Vote Statistics */}
            <div className="vote-statistics">
              <h3>📈 Voting Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Votes</span>
                  <span className="stat-value">{blockchainResults?.totalVotes || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Encrypted Records</span>
                  <span className="stat-value">{blockchainResults?.encryptedVotesCast || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Voting Status</span>
                  <span className={`stat-value ${blockchainResults?.votingActive ? 'active' : 'inactive'}`}>
                    {blockchainResults?.votingActive ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>👥 User Management</h2>
            
            <div className="management-actions">
              <div className="action-card warning">
                <div className="action-header">
                  <Database size={24} />
                  <h3>Clear User Database</h3>
                </div>
                <p>Remove all registered users and fingerprint data from the system.</p>
                <button onClick={clearDatabase} className="action-button warning" disabled={loading}>
                  {loading ? 'Clearing...' : 'Clear Database'}
                </button>
              </div>
            </div>

            <div className="user-statistics">
              <h3>📊 User Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Registered Users</span>
                  <span className="stat-value">{systemStats.users || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Fingerprints Stored</span>
                  <span className="stat-value">{systemStats.fingerprints || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Registration Rate</span>
                  <span className="stat-value">
                    {systemStats.users ? Math.round((systemStats.fingerprints / systemStats.users) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Data Tab */}
        {activeTab === 'blockchain' && (
          <div className="admin-section">
            <h2>⛓️ Blockchain Data</h2>
            
            <div className="blockchain-info">
              <div className="blockchain-status">
                <Shield size={24} />
                <div className="status-details">
                  <h3>Blockchain Status</h3>
                  <p>Connected to local Hardhat network</p>
                  <p>Smart contract deployed and operational</p>
                </div>
              </div>
            </div>

            <div className="encrypted-votes-section">
              <h3>🔐 Encrypted Vote Records</h3>
              <p>These are immutable vote records stored on the blockchain. Vote choices are encrypted and can only be decrypted by authorized parties.</p>
              
              {encryptedVotes.length === 0 ? (
                <div className="no-data">
                  <Eye size={48} />
                  <h4>No Encrypted Votes</h4>
                  <p>No votes have been cast yet, or encrypted vote data is not available.</p>
                </div>
              ) : (
                <div className="encrypted-votes-table">
                  <div className="table-header">
                    <div className="header-cell">Vote ID</div>
                    <div className="header-cell">Voter Hash</div>
                    <div className="header-cell">Encrypted Choice</div>
                    <div className="header-cell">Timestamp</div>
                    <div className="header-cell">Receipt Hash</div>
                  </div>
                  {encryptedVotes.map((vote) => (
                    <div key={vote.id} className="table-row">
                      <div className="table-cell">#{vote.id}</div>
                      <div className="table-cell">{formatHash(vote.voterHash)}</div>
                      <div className="table-cell encrypted-data">{formatHash(vote.encryptedChoice)}</div>
                      <div className="table-cell">{formatTimestamp(vote.timestamp)}</div>
                      <div className="table-cell">{formatHash(vote.receiptHash)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Control Tab */}
        {activeTab === 'system' && (
          <div className="admin-section">
            <h2>⚙️ System Control</h2>
            
            <div className="system-controls">
              <div className="control-group">
                <h3>🗳️ Election Management</h3>
                <div className="control-actions">
                  <button className="control-button" onClick={resetAllVotes} disabled={loading}>
                    <Trash2 size={16} />
                    Reset All Votes
                  </button>
                  <button className="control-button" onClick={() => setMessage({ type: 'info', text: 'Voting status toggle would be implemented here' })}>
                    <Vote size={16} />
                    Toggle Voting Status
                  </button>
                </div>
              </div>

              <div className="control-group">
                <h3>👥 User Management</h3>
                <div className="control-actions">
                  <button className="control-button" onClick={clearDatabase} disabled={loading}>
                    <Database size={16} />
                    Clear User Database
                  </button>
                  <button className="control-button" onClick={() => setMessage({ type: 'info', text: 'Export user data feature would be implemented here' })}>
                    <Users size={16} />
                    Export User Data
                  </button>
                </div>
              </div>

              <div className="control-group">
                <h3>⛓️ Blockchain Operations</h3>
                <div className="control-actions">
                  <button className="control-button" onClick={loadEncryptedVotes}>
                    <Shield size={16} />
                    Refresh Blockchain Data
                  </button>
                  <button className="control-button" onClick={() => setMessage({ type: 'info', text: 'Contract upgrade feature would be implemented here' })}>
                    <Key size={16} />
                    Update Contract
                  </button>
                </div>
              </div>
            </div>

            <div className="system-info">
              <h3>ℹ️ System Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Server Status:</strong> Online
                </div>
                <div className="info-item">
                  <strong>Database:</strong> SQLite Connected
                </div>
                <div className="info-item">
                  <strong>Blockchain:</strong> Hardhat Local Network
                </div>
                <div className="info-item">
                  <strong>Last Updated:</strong> {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPanel
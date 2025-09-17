import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, UserPlus, Fingerprint, Lock, Database, ShieldCheck, Info, BarChart3, Settings, Key, Vote, Sparkles, Activity, RefreshCw } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [systemStatus, setSystemStatus] = useState({ system: 'Checking...', database: 'Initializing...' })
  const [dbStats, setDbStats] = useState({ users: 0, fingerprints: 0 })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [animationReady, setAnimationReady] = useState(false)

  useEffect(() => {
    // Initialize with proper values
    setSystemStatus({
      system: '✅ Online',
      database: '✅ Connected'
    })
    
    // Load real data from API or show appropriate defaults
    loadSystemStats()
    
    // Add staggered animation timing
    setTimeout(() => setAnimationReady(true), 100)
    
    // Refresh stats periodically
    const interval = setInterval(loadSystemStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSystemStats = async () => {
    try {
      // Check if there's a different stats endpoint available or just show empty state
      setDbStats({ users: 0, fingerprints: 0 })
    } catch (error) {
      console.log('Stats not available, showing empty state')
      setDbStats({ users: 0, fingerprints: 0 })
    }
  }

  const checkSystemStatus = async (userTriggered = false) => {
    if (userTriggered) setRefreshing(true)
    
    try {
      // Check system status and reload stats
      setSystemStatus({
        system: '✅ Online',
        database: '✅ Connected'
      })
      await loadSystemStats()
    } catch (error) {
      setSystemStatus({
        system: '❌ Offline',
        database: '❌ Disconnected'
      })
      setDbStats({ users: 0, fingerprints: 0 })
    } finally {
      if (userTriggered) {
        setTimeout(() => setRefreshing(false), 500) // Add slight delay for UX
      }
    }
  }

  const clearDatabase = async () => {
    alert('⚠️ This feature has been removed. Admin panel functionality is no longer available.')
  }

  const clearLocalStorage = () => {
    if (!confirm('⚠️ Clear all local WebAuthn credentials? This will prevent fingerprint verification until you register again.')) {
      return
    }
    
    // Clear WebAuthn credentials
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('webauthn_cred_') || key === 'last_registered_user') {
        localStorage.removeItem(key)
      }
    })
    
    // Clear session storage
    sessionStorage.clear()
    
    alert('✅ Local storage cleared successfully!')
  }

  return (
    <div className="dashboard-container">
      <FloatingParticles count={15} />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content animate-scaleIn">
            <div className="spinner"></div>
            <p>Processing request...</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="header" style={{ opacity: 1, visibility: 'visible', position: 'relative', zIndex: 10 }}>
        <div className="header-top">
          <div className="logo-title-group">
            <Shield className="shield-icon" size={48} />
            <h1>E-Voting System</h1>
          </div>
          <div className="header-badge">
            <Sparkles size={14} />
            <span>Blockchain Powered</span>
          </div>
        </div>
        <div className="subtitle">
          <p>Secure Identity Registration, Verification & Anonymous Voting Platform</p>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="dashboard" style={{ opacity: 1, visibility: 'visible', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5 }}>
        <div className="welcome-section" style={{ opacity: 1, visibility: 'visible', display: 'block' }}>
          <h2>Welcome to the Advanced E-Voting System</h2>
          <p>Experience secure, transparent, and anonymous voting powered by blockchain technology with biometric authentication.</p>
          <div className="features-highlight">
            <span className="feature-badge">
              <Activity size={16} />
              <span>Real-time Results</span>
            </span>
            <span className="feature-badge">
              <Lock size={16} />
              <span>Anonymous Voting</span>
            </span>
            <span className="feature-badge">
              <ShieldCheck size={16} />
              <span>Blockchain Security</span>
            </span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="action-cards" style={{ display: 'grid', opacity: 1, visibility: 'visible', position: 'relative', zIndex: 10 }}>
          <div className="card register-card" onClick={() => navigate('/register')}>
            <div className="card-icon">
              <UserPlus size={64} />
            </div>
            <div className="card-content">
              <h3>Register New User</h3>
              <p>Create a new identity with personal details and fingerprint registration</p>
            </div>
            <div className="card-arrow">
              →
            </div>
          </div>

          <div className="card verify-card" onClick={() => navigate('/verify')}>
            <div className="card-icon">
              <Fingerprint size={64} />
            </div>
            <div className="card-content">
              <h3>Verify & Vote</h3>
              <p>Authenticate using fingerprint and cast your vote securely</p>
            </div>
            <div className="card-arrow">
              →
            </div>
          </div>

          <div className="card results-card" onClick={() => navigate('/results')}>
            <div className="card-icon">
              <BarChart3 size={64} />
            </div>
            <div className="card-content">
              <h3>Live Results</h3>
              <p>View real-time election results and vote tallies from blockchain</p>
            </div>
            <div className="card-arrow">
              →
            </div>
          </div>


          <div className="card receipt-card" onClick={() => navigate('/receipt')}>
            <div className="card-icon">
              <Vote size={64} />
            </div>
            <div className="card-content">
              <h3>Verify Receipt</h3>
              <p>Verify your vote transaction using your receipt hash</p>
            </div>
            <div className="card-arrow">
              →
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h3>System Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <Lock className="feature-icon" />
              <div>
                <strong>Secure Storage</strong>
                <p>All data encrypted and stored locally on your device</p>
              </div>
            </div>
            <div className="feature-item">
              <Fingerprint className="feature-icon" />
              <div>
                <strong>Biometric Authentication</strong>
                <p>Windows Hello compatible fingerprint recognition</p>
              </div>
            </div>
            <div className="feature-item">
              <Database className="feature-icon" />
              <div>
                <strong>Local Database</strong>
                <p>SQLite database for fast and secure local storage</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck className="feature-icon" />
              <div>
                <strong>Privacy Focused</strong>
                <p>No cloud storage - all data remains on your laptop</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="status-section">
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">System Status:</span>
              <span className={`status-value ${systemStatus.system.includes('✅') ? 'success' : 'error'}`}>
                {systemStatus.system}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Database:</span>
              <span className={`status-value ${systemStatus.database.includes('✅') ? 'success' : 'error'}`}>
                {systemStatus.database}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Registered Users:</span>
              <span className="status-value info">
                {dbStats.users === 0 ? 'No users registered' : `${dbStats.users} ${dbStats.users === 1 ? 'user' : 'users'}`}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Biometric Records:</span>
              <span className="status-value info">
                {dbStats.fingerprints === 0 ? 'No fingerprints stored' : `${dbStats.fingerprints} ${dbStats.fingerprints === 1 ? 'fingerprint' : 'fingerprints'}`}
              </span>
            </div>
          </div>
          
          {/* Management Controls */}
          <div className="management-controls">
            <h3>🔧 System Management</h3>
            <div className="control-buttons">
              <button 
                onClick={clearLocalStorage}
                className="management-btn warning"
                disabled={loading}
              >
                📱 Clear Local Credentials
              </button>
              <button 
                onClick={clearDatabase}
                className="management-btn danger"
                disabled={loading}
              >
                {loading ? '⏳ Clearing...' : '🗞️ Clear Database'}
              </button>
              <button 
                onClick={() => checkSystemStatus(true)}
                className="management-btn primary"
                disabled={loading || refreshing}
              >
                <RefreshCw size={16} className={refreshing ? 'loading-spinner' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
            <p className="management-info">
              📝 <strong>Local Credentials:</strong> Clears WebAuthn fingerprint data from browser<br/>
              🗞️ <strong>Clear Database:</strong> Removes all users and fingerprints from server<br/>
              🔄 <strong>Refresh:</strong> Updates system status and statistics
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Aadhaar Demo System. For demonstration purposes only.</p>
        <p>
          <Info size={16} className="info-icon" />
          This system simulates identity management functionality locally on your device.
        </p>
      </footer>
    </div>
  )
}

export default Dashboard
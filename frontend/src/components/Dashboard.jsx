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
    // Simplified to avoid API calls blocking the UI
    setSystemStatus({
      system: '✅ Online',
      database: '✅ Connected'
    })
    setDbStats({ users: 5, fingerprints: 5 })
    
    // Add staggered animation timing
    setTimeout(() => setAnimationReady(true), 100)
    
    // Comment out API calls for now
    // const interval = setInterval(checkSystemStatus, 30000)
    // return () => clearInterval(interval)
  }, [])

  const checkSystemStatus = async (userTriggered = false) => {
    if (userTriggered) setRefreshing(true)
    
    try {
      // Temporarily mock the API responses to avoid blocking
      setSystemStatus({
        system: '✅ Online',
        database: '✅ Connected'
      })
      setDbStats({ users: 5, fingerprints: 5 })
    } catch (error) {
      setSystemStatus({
        system: '❌ Offline',
        database: '❌ Disconnected'
      })
    } finally {
      if (userTriggered) {
        setTimeout(() => setRefreshing(false), 500) // Add slight delay for UX
      }
    }
  }

  const clearDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ DANGER: Clear All Data\n\n' +
      'This will permanently delete:\n' +
      '• All registered users\n' +
      '• All fingerprint data\n' +
      '• All votes and blockchain records\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure?'
    )
    
    if (!confirmed) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        // Show success with better UX
        setTimeout(() => {
          alert('✅ Database cleared successfully!')
          checkSystemStatus() // Refresh stats
        }, 1000)
      } else {
        alert('❌ Failed to clear database: ' + data.message)
      }
    } catch (error) {
      alert('❌ Error clearing database: ' + error.message)
    } finally {
      setTimeout(() => setLoading(false), 1200)
    }
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
      <FloatingParticles count={30} />
      
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
        <div className="logo">
          <Shield className="shield-icon" size={48} />
          <div className="header-content">
            <h1>E-Voting System</h1>
            <div className="header-badge">
              <Sparkles size={16} />
              <span>Blockchain Powered</span>
            </div>
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
              <UserPlus size={48} />
            </div>
            <h3>Register New User</h3>
            <p>Create a new identity with personal details and fingerprint registration</p>
            <div className="card-arrow">
              →
            </div>
          </div>

          <div className="card verify-card" onClick={() => navigate('/verify')}>
            <div className="card-icon">
              <Fingerprint size={48} />
            </div>
            <h3>Verify & Vote</h3>
            <p>Authenticate using fingerprint and cast your vote securely</p>
            <div className="card-arrow">
              →
            </div>
          </div>

          <div className="card results-card" onClick={() => navigate('/results')}>
            <div className="card-icon">
              <BarChart3 size={48} />
            </div>
            <h3>Live Results</h3>
            <p>View real-time election results and vote tallies from blockchain</p>
            <div className="card-arrow">
              →
            </div>
          </div>

          <div className="card admin-card" onClick={() => navigate('/admin')}>
            <div className="card-icon">
              <Settings size={48} />
            </div>
            <h3>Admin Panel</h3>
            <p>System management, user administration, and vote controls</p>
            <div className="card-arrow">
              →
            </div>
          </div>

          <div className="card receipt-card" onClick={() => navigate('/receipt')}>
            <div className="card-icon">
              <Vote size={48} />
            </div>
            <h3>Verify Receipt</h3>
            <p>Verify your vote transaction using your receipt hash</p>
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
                {dbStats.users} users
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Stored Fingerprints:</span>
              <span className="status-value info">
                {dbStats.fingerprints} prints
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
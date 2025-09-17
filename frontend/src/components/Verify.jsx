import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, CheckCircle2, User, MapPin, Phone, Mail, Calendar, 
  Shield, Fingerprint, Star, Zap, Clock, Award, Lock, Eye,
  Loader2, AlertTriangle, CheckCircle, XCircle, Info, UserPlus, Vote, Activity
} from 'lucide-react'
import FingerprintCapture from './FingerprintCapture'
import FloatingParticles from './FloatingParticles'
import '../styles/Verify.css'

const Verify = () => {
  const navigate = useNavigate()
  const [verificationStep, setVerificationStep] = useState('scan') // scan, processing, verified, failed
  const [verifiedUser, setVerifiedUser] = useState(null)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [animationReady, setAnimationReady] = useState(false)

  useEffect(() => {
    // Add staggered animation timing
    setTimeout(() => setAnimationReady(true), 200)
  }, [])

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)
    return interval
  }

  const handleVerificationSuccess = (userData) => {
    setIsProcessing(true)
    setVerificationStep('processing')
    
    const progressInterval = simulateProgress()
    
    setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)
      setVerifiedUser(userData)
      setVerificationStep('verified')
      setError('')
      setIsProcessing(false)
    }, 2000)
  }

  const handleVerificationError = (errorMessage) => {
    setIsProcessing(true)
    setVerificationStep('processing')
    
    setTimeout(() => {
      setError(errorMessage)
      setVerificationStep('failed')
      setVerifiedUser(null)
      setIsProcessing(false)
      setProgress(0)
    }, 1500)
  }

  const resetVerification = () => {
    setProgress(0)
    setVerificationStep('scan')
    setVerifiedUser(null)
    setError('')
    setIsProcessing(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getStatusColor = () => {
    switch(verificationStep) {
      case 'scan': return 'status-neutral'
      case 'processing': return 'status-processing'
      case 'verified': return 'status-success'
      case 'failed': return 'status-error'
      default: return 'status-neutral'
    }
  }
  
  const getStatusIcon = () => {
    switch(verificationStep) {
      case 'scan': return <Fingerprint size={20} />
      case 'processing': return <Loader2 className="animate-spin" size={20} />
      case 'verified': return <CheckCircle size={20} />
      case 'failed': return <XCircle size={20} />
      default: return <Info size={20} />
    }
  }

  return (
    <div className="verify-container">
      <FloatingParticles count={25} />
      
      {/* Premium Header */}
      <header className={`verify-header ${animationReady ? 'animate-slideDown' : ''}`}>
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>
          
          <div className="header-title">
            <div className="title-group">
              <Shield className="title-icon" size={28} />
              <h1>Identity Verification</h1>
            </div>
            <p className="subtitle">Secure biometric authentication system</p>
          </div>
          
          <div className="status-display">
            <div className={`status-indicator ${getStatusColor()}`}>
              {getStatusIcon()}
              <div className="status-text">
                <span className="status-label">
                  {verificationStep === 'scan' && 'Ready to Scan'}
                  {verificationStep === 'processing' && 'Processing...'}
                  {verificationStep === 'verified' && 'Verified Successfully'}
                  {verificationStep === 'failed' && 'Verification Failed'}
                </span>
                {verificationStep === 'processing' && (
                  <div className="progress-mini">
                    <div className="progress-bar" style={{width: `${progress}%`}}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="verify-main">
        <div className="main-grid">
          {/* Left Panel - Scanning Area */}
          <div className={`scan-panel ${animationReady ? 'animate-slideLeft' : ''}`}>
            {/* Fingerprint Scanning */}
            {verificationStep === 'scan' && (
              <div className="scan-section">
                <div className="scan-header">
                  <div className="scan-icon">
                    <Fingerprint size={48} className="fingerprint-icon" />
                  </div>
                  <h2>Biometric Authentication</h2>
                  <p>Place your registered finger on the sensor to verify your identity</p>
                </div>
                
                <div className="scan-area">
                  <FingerprintCapture
                    mode="verify"
                    onSuccess={handleVerificationSuccess}
                    onError={handleVerificationError}
                  />
                </div>
                
                <div className="scan-instructions">
                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <span>Position finger on scanner</span>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <span>Hold steady for scan</span>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <span>Wait for verification</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing State */}
            {verificationStep === 'processing' && (
              <div className="processing-section animate-fadeIn">
                <div className="processing-animation">
                  <div className="scan-pulse"></div>
                  <Loader2 size={64} className="processing-spinner" />
                </div>
                <h2>Authenticating Identity</h2>
                <p>Analyzing biometric data and matching with database...</p>
                <div className="progress-container">
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                  <span className="progress-text">{Math.round(progress)}%</span>
                </div>
                <div className="processing-steps">
                  <div className={`step ${progress > 20 ? 'completed' : 'active'}`}>
                    <CheckCircle size={16} />
                    <span>Scanning fingerprint</span>
                  </div>
                  <div className={`step ${progress > 60 ? 'completed' : progress > 20 ? 'active' : ''}`}>
                    <CheckCircle size={16} />
                    <span>Matching database</span>
                  </div>
                  <div className={`step ${progress > 90 ? 'completed' : progress > 60 ? 'active' : ''}`}>
                    <CheckCircle size={16} />
                    <span>Retrieving profile</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Failed */}
            {verificationStep === 'failed' && (
              <div className="failed-section animate-slideUp">
                <div className="failed-animation">
                  <div className="error-pulse"></div>
                  <XCircle size={64} className="error-icon" />
                </div>
                <h2>Authentication Failed</h2>
                <p className="error-description">
                  {error || 'Fingerprint not recognized or not found in database'}
                </p>
                <div className="error-suggestions">
                  <div className="suggestion">
                    <AlertTriangle size={16} />
                    <span>Ensure your finger is clean and dry</span>
                  </div>
                  <div className="suggestion">
                    <Eye size={16} />
                    <span>Place finger fully on the scanner</span>
                  </div>
                  <div className="suggestion">
                    <User size={16} />
                    <span>Use the same finger you registered with</span>
                  </div>
                </div>
                <div className="failed-actions">
                  <button onClick={resetVerification} className="btn-primary retry-btn">
                    <Zap size={18} />
                    Try Again
                  </button>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="btn-secondary register-btn"
                  >
                    <UserPlus size={18} />
                    Register New User
                  </button>
                </div>
              </div>
            )}

            {/* Verification Successful */}
            {verificationStep === 'verified' && verifiedUser && (
              <div className="verified-section animate-slideUp">
                <div className="success-animation">
                  <div className="success-pulse"></div>
                  <CheckCircle size={64} className="success-icon" />
                </div>
                <h2>Authentication Successful!</h2>
                <p className="success-message">Identity verified and profile retrieved</p>
                
                {/* Premium User Profile Card */}
                <div className="user-profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <User size={32} />
                    </div>
                    <div className="profile-info">
                      <h3>{verifiedUser.name}</h3>
                      <span className="user-id">ID: {verifiedUser.uniqueNumber}</span>
                    </div>
                    <div className="verification-stamp">
                      <Award size={24} className="stamp-icon" />
                      <span>Verified</span>
                    </div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="details-row">
                      <div className="detail-card">
                        <div className="detail-icon">
                          <User size={16} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Personal Info</span>
                          <span className="detail-value" title={`${verifiedUser.age} years, ${verifiedUser.gender}`}>{verifiedUser.age} years, {verifiedUser.gender}</span>
                        </div>
                      </div>
                      
                      <div className="detail-card">
                        <div className="detail-icon">
                          <MapPin size={16} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Location</span>
                          <span className="detail-value">{verifiedUser.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {(verifiedUser.phoneNumber || verifiedUser.email) && (
                      <div className="details-row">
                        {verifiedUser.phoneNumber && (
                          <div className="detail-card">
                            <div className="detail-icon">
                              <Phone size={16} />
                            </div>
                            <div className="detail-content">
                              <span className="detail-label">Phone</span>
                              <span className="detail-value">{verifiedUser.phoneNumber}</span>
                            </div>
                          </div>
                        )}
                        
                        {verifiedUser.email && (
                          <div className="detail-card">
                            <div className="detail-icon">
                              <Mail size={16} />
                            </div>
                            <div className="detail-content">
                              <span className="detail-label">Email</span>
                              <span className="detail-value">{verifiedUser.email}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="registration-info">
                      <div className="detail-card full-width">
                        <div className="detail-icon">
                          <Calendar size={16} />
                        </div>
                        <div className="detail-content">
                          <span className="detail-label">Registered</span>
                          <span className="detail-value">{formatDate(verifiedUser.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security Badge */}
                  <div className="security-badge">
                    <Shield size={20} />
                    <div className="badge-content">
                      <span className="badge-title">Biometric Verified</span>
                      <span className="badge-subtitle">Secure authentication complete</span>
                    </div>
                    <div className="badge-indicator"></div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    onClick={() => navigate('/voting', { state: { user: verifiedUser } })}
                    className="btn-vote primary"
                  >
                    <Vote size={20} />
                    <span>Proceed to Vote</span>
                  </button>
                  
                  <div className="secondary-actions">
                    <button onClick={resetVerification} className="btn-secondary">
                      <Fingerprint size={18} />
                      <span>Verify Another</span>
                    </button>
                    <button onClick={() => navigate('/')} className="btn-tertiary">
                      <ArrowLeft size={18} />
                      <span>Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Panel - Security Information */}
          <div className={`info-panel ${animationReady ? 'animate-slideRight' : ''}`}>
            <div className="security-overview">
              <div className="panel-header">
                <Lock className="panel-icon" size={24} />
                <h3>Security Overview</h3>
              </div>
              
              <div className="security-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Shield size={18} className="text-blue-400" />
                  </div>
                  <div className="feature-content">
                    <h4>Biometric Security</h4>
                    <p>Advanced fingerprint recognition with 128-bit encryption</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <Lock size={18} className="text-green-400" />
                  </div>
                  <div className="feature-content">
                    <h4>Local Storage</h4>
                    <p>All data encrypted and stored locally on device</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <Eye size={18} className="text-purple-400" />
                  </div>
                  <div className="feature-content">
                    <h4>Privacy First</h4>
                    <p>No biometric data transmitted over network</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <Zap size={18} className="text-yellow-400" />
                  </div>
                  <div className="feature-content">
                    <h4>Fast Recognition</h4>
                    <p>Sub-second authentication with 99.9% accuracy</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="verification-steps">
              <div className="panel-header">
                <Info className="panel-icon" size={24} />
                <h3>How It Works</h3>
              </div>
              
              <div className="steps-list">
                <div className="step-item">
                  <div className="step-indicator">1</div>
                  <div className="step-content">
                    <h5>Capture</h5>
                    <p>Fingerprint is scanned and digitized</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <div className="step-indicator">2</div>
                  <div className="step-content">
                    <h5>Process</h5>
                    <p>Convert to secure hash for comparison</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <div className="step-indicator">3</div>
                  <div className="step-content">
                    <h5>Match</h5>
                    <p>Compare against registered fingerprints</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <div className="step-indicator">4</div>
                  <div className="step-content">
                    <h5>Verify</h5>
                    <p>Retrieve profile and grant access</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="system-status">
              <div className="panel-header">
                <Activity size={24} className="panel-icon" />
                <h3>System Status</h3>
              </div>
              
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-dot green"></div>
                  <span>Scanner Online</span>
                </div>
                <div className="status-item">
                  <div className="status-dot green"></div>
                  <span>Database Connected</span>
                </div>
                <div className="status-item">
                  <div className="status-dot green"></div>
                  <span>Security Active</span>
                </div>
                <div className="status-item">
                  <div className="status-dot yellow"></div>
                  <span>Awaiting Scan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Verify
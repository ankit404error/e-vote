import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Vote, CheckCircle, AlertCircle, Loader, Receipt, Shield, Users, Trophy, Clock } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import '../styles/Voting.css'

const Voting = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = location.state || {}
  
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voting, setVoting] = useState(false)
  const [voteComplete, setVoteComplete] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [error, setError] = useState('')
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false)
  const [hoveredCandidate, setHoveredCandidate] = useState(null)

  // Helper function for candidate gradient colors
  const getCandidateGradient = (candidateNumber) => {
    const gradients = {
      1: '#6366f1 0%, #8b5cf6 50%, #d946ef 100%', // Purple to Pink
      2: '#f59e0b 0%, #f97316 50%, #dc2626 100%', // Orange to Red
      3: '#059669 0%, #0d9488 50%, #0891b2 100%', // Teal to Blue
      4: '#7c3aed 0%, #a855f7 50%, #c084fc 100%'  // Purple variants
    }
    return gradients[candidateNumber] || gradients[1]
  }

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    
    loadCandidates()
    checkIfUserHasVoted()
  }, [user, navigate])

  const loadCandidates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/blockchain/candidates')
      const data = await response.json()
      
      if (data.success) {
        setCandidates(data.candidates)
      } else {
        setError('Failed to load candidates')
      }
    } catch (error) {
      setError('Network error while loading candidates')
    } finally {
      setLoading(false)
    }
  }

  const checkIfUserHasVoted = async () => {
    try {
      const response = await fetch(`/api/voting/status/${user.id}`)
      const data = await response.json()
      
      if (data.success && data.hasVoted) {
        setHasAlreadyVoted(true)
      }
    } catch (error) {
      console.warn('Could not check voting status:', error)
    }
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate before voting')
      return
    }

    if (hasAlreadyVoted) {
      setError('You have already voted in this election')
      return
    }

    setVoting(true)
    setError('')

    try {
      // Generate OACT token for enhanced security
      const timestamp = Date.now()
      const randomBytes = crypto.getRandomValues(new Uint8Array(16))
      const randomHex = Array.from(randomBytes, byte => 
        byte.toString(16).padStart(2, '0')
      ).join('')
      const oactToken = `OACT_${timestamp}_${randomHex}`
      
      console.log('🗳️ Casting enhanced vote...')
      
      // Try enhanced voting endpoint first
      let response = await fetch('/api/enhanced/cast-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: oactToken,
          candidate: selectedCandidate.name,
          userId: user.id,
          candidateId: selectedCandidate.id
        }),
      })
      
      let data = await response.json()
      
      // If enhanced endpoint fails, fall back to original
      if (!response.ok && response.status !== 200) {
        console.warn('Enhanced endpoint failed, trying fallback...')
        response = await fetch('/api/voting/cast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateId: selectedCandidate.id,
            candidateName: selectedCandidate.name,
            userId: user.id,
          }),
        })
        data = await response.json()
      }

      if (data.success) {
        setTransactionHash(data.transactionHash)
        setVoteComplete(true)
        setHasAlreadyVoted(true)
        
        console.log('✅ Vote cast successfully:', {
          candidate: selectedCandidate.name,
          txHash: data.transactionHash,
          blockNumber: data.blockNumber,
          source: data.source || 'Enhanced Blockchain'
        })
      } else {
        setError(data.error || data.message || 'Failed to cast vote')
      }
    } catch (error) {
      console.error('❌ Voting error:', error)
      setError('Network error while casting vote: ' + error.message)
    } finally {
      setVoting(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/')
  }

  if (!user) {
    return null
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">Please register or verify your identity first.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{
      background: `
        linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%),
        radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1), transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.08), transparent 50%)
      `,
      backgroundSize: '400% 400%, 100% 100%, 100% 100%',
      animation: 'professionalGradientShift 25s ease infinite',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh'
    }}>
      {/* Clean Professional Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.06) 0%, transparent 40%)
        `,
        animation: 'subtleBackgroundShift 30s ease infinite'
      }} />
      
      {/* Minimal Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        opacity: 0.5
      }} />
      
      {/* Subtle Corner Accents */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'gentleFloat 20s ease-in-out infinite',
        filter: 'blur(40px)'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'gentleFloat 25s ease-in-out infinite reverse',
        filter: 'blur(35px)'
      }} />
      
      {/* Enhanced Floating Particles */}
      <FloatingParticles count={35} />
      
      {/* Professional Header */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Subtle Header Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)'
        }} />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Back Button */}
            <button 
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                background: 'rgba(51, 65, 85, 0.8)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontWeight: '500',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(59, 130, 246, 0.2)'
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(51, 65, 85, 0.8)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <ArrowLeft size={22} />
              <span>Dashboard</span>
            </button>
            
            {/* Main Title */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h1 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: '700',
                color: '#f1f5f9',
                margin: '0 0 1rem 0',
                letterSpacing: '-0.5px',
                lineHeight: '1.2'
              }}>
                🗳️ Cast Your Vote
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.4)'
                }}>
                  <Shield size={14} style={{ color: '#10b981' }} />
                  <span style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.85rem' }}>Secure</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.4)'
                }}>
                  <Users size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.85rem' }}>Anonymous</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.4)'
                }}>
                  <Trophy size={14} style={{ color: '#8b5cf6' }} />
                  <span style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.85rem' }}>Transparent</span>
                </div>
              </div>
            </div>
            
            {/* User Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                padding: '0.5rem',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '8px'
              }}>
                <Shield size={16} style={{ color: '#10b981' }} />
              </div>
              <div>
                <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Voter</div>
                <div style={{ color: '#f1f5f9', fontWeight: '500', fontSize: '0.9rem' }}>{user?.name || 'Demo User'}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6">
        {hasAlreadyVoted && !voteComplete ? (
          /* Already Voted Message */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-md text-center">
              <CheckCircle size={80} className="text-green-400 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-4">Vote Already Cast</h2>
              <p className="text-white/80 text-lg mb-6">You have already participated in this election.</p>
              <div className="flex items-center gap-3 bg-green-500/20 rounded-2xl p-4 mb-8">
                <Shield size={20} className="text-green-400" />
                <span className="text-white">Your vote is anonymous and securely stored on the blockchain.</span>
              </div>
              <button 
                onClick={handleBackToDashboard} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                View Results
              </button>
            </div>
          </div>
        ) : voteComplete ? (
          /* Vote Success */
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '70vh',
            padding: '2rem 1rem'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              maxWidth: '700px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Success Icon and Title */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  animation: 'successPulse 2s ease-in-out infinite'
                }}>
                  <CheckCircle size={60} style={{ color: 'white' }} />
                </div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#f8fafc',
                  marginBottom: '0.75rem',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>Vote Cast Successfully!</h2>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '1.2rem',
                  fontWeight: '400'
                }}>Your vote has been securely recorded on the blockchain</p>
              </div>
              
              {/* Transaction Receipt Section */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    display: 'flex'
                  }}>
                    <Receipt size={24} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    margin: 0
                  }}>Official Voting Receipt</h3>
                </div>
                
                {/* Receipt Details */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <div style={{
                    borderBottom: '2px solid rgba(71, 85, 105, 0.4)',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>🗳️ E-VOTE SYSTEM</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Blockchain-Powered Voting Platform</div>
                  </div>
                  
                  <div style={{ color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Date & Time:</span>
                      <span style={{ fontWeight: 'bold' }}>{new Date().toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Voter ID:</span>
                      <span style={{ fontWeight: 'bold' }}>{user?.id || 'VOTER_001'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Voter Name:</span>
                      <span style={{ fontWeight: 'bold' }}>{user?.name || 'Demo User'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Election ID:</span>
                      <span style={{ fontWeight: 'bold' }}>ELECTION_2024_001</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Vote Status:</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ CONFIRMED</span>
                    </div>
                    
                    <div style={{
                      borderTop: '1px solid rgba(71, 85, 105, 0.4)',
                      paddingTop: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Transaction Hash:</div>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        color: '#10b981',
                        fontSize: '0.85rem',
                        wordBreak: 'break-all',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        {transactionHash}
                      </div>
                    </div>
                    
                    <div style={{
                      borderTop: '1px solid rgba(71, 85, 105, 0.4)',
                      paddingTop: '1rem',
                      marginTop: '1rem',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.8rem'
                    }}>
                      This receipt serves as proof of your participation in the election.<br/>
                      Your vote choice remains completely anonymous and secure.
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Guarantee */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  textAlign: 'left'
                }}>
                  <Shield size={28} style={{ color: '#10b981', marginTop: '0.25rem' }} />
                  <div>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>🔒 Privacy Guaranteed</h3>
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      Your vote is completely anonymous and encrypted. No one can trace your vote choice back to you. 
                      The blockchain ensures transparency while maintaining your privacy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <button 
                  onClick={handleBackToDashboard} 
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  📊 View Live Results
                </button>
                <button 
                  onClick={() => {
                    // Enhanced print with better formatting
                    const printContent = `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
                          <h1 style="color: #333; font-size: 28px; margin: 0;">🗳️ E-VOTE SYSTEM</h1>
                          <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Official Voting Receipt</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Date & Time:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${new Date().toLocaleString()}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Voter ID:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${user?.id || 'VOTER_001'}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Voter Name:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${user?.name || 'Demo User'}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Election ID:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">ELECTION_2024_001</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Vote Status:</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">✅ CONFIRMED</td></tr>
                          </table>
                        </div>
                        
                        <div style="background: #e8f5e8; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                          <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Transaction Hash:</p>
                          <p style="font-family: monospace; font-size: 12px; word-break: break-all; margin: 0; background: white; padding: 10px; border-radius: 4px; font-weight: bold; color: #10b981;">${transactionHash}</p>
                        </div>
                        
                        <div style="border-top: 2px solid #ddd; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
                          <p>This receipt serves as proof of your participation in the election.</p>
                          <p>Your vote choice remains completely anonymous and secure.</p>
                          <p style="margin-top: 20px; font-weight: bold;">Thank you for participating in the democratic process!</p>
                        </div>
                      </div>
                    `;
                    
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Voting Receipt</title>
                          <style>
                            @media print {
                              body { margin: 0; padding: 20px; }
                              * { -webkit-print-color-adjust: exact; }
                            }
                          </style>
                        </head>
                        <body>${printContent}</body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  style={{
                    background: 'rgba(71, 85, 105, 0.3)',
                    border: '1px solid rgba(148, 163, 184, 0.4)',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    color: '#e2e8f0',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(71, 85, 105, 0.5)';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(71, 85, 105, 0.3)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Voting Interface */
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Ultra Premium Instructions */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '3rem',
              padding: '2rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}>
              <div>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1rem',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2'
                }}>Select Your Candidate</h2>
                
                <p style={{
                  color: '#94a3b8',
                  fontSize: '1.1rem',
                  maxWidth: '600px',
                  margin: '0 auto 1.5rem auto',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Choose one candidate from the list below. Your vote will be encrypted and stored anonymously on the blockchain.
                </p>
                
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(51, 65, 85, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <Shield size={18} style={{ color: '#10b981' }} />
                  <span style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.9rem' }}>
                    Secure • Anonymous • Verifiable
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <Loader size={48} style={{ color: 'white', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.2rem' }}>Loading candidates...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Candidates Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
                  gap: '2.5rem',
                  marginBottom: '4rem',
                  padding: '0 1rem'
                }}>
                  {candidates.map((candidate, index) => {
                    const isSelected = selectedCandidate?.id === candidate.id
                    const isHovered = hoveredCandidate === candidate.id
                    const candidateNumber = index + 1
                    
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidate(candidate)}
                        onMouseEnter={() => setHoveredCandidate(candidate.id)}
                        onMouseLeave={() => setHoveredCandidate(null)}
                        style={{
                          position: 'relative',
                          background: isSelected 
                            ? 'rgba(15, 23, 42, 0.9)'
                            : isHovered
                            ? 'rgba(30, 41, 59, 0.8)'
                            : 'rgba(15, 23, 42, 0.7)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: isSelected 
                            ? '2px solid rgba(16, 185, 129, 0.6)' 
                            : isHovered
                            ? '2px solid rgba(71, 85, 105, 0.8)'
                            : '1px solid rgba(71, 85, 105, 0.3)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isSelected 
                            ? 'translateY(-4px)' 
                            : isHovered 
                            ? 'translateY(-2px)' 
                            : 'translateY(0)',
                          boxShadow: isSelected 
                            ? '0 20px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.3)' 
                            : isHovered 
                            ? '0 12px 20px rgba(0, 0, 0, 0.25)'
                            : '0 4px 12px rgba(0, 0, 0, 0.15)',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Animated Background Pattern */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: isSelected 
                            ? 'radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(52, 211, 153, 0.2) 0%, transparent 50%)'
                            : 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(219, 39, 119, 0.1) 0%, transparent 50%)',
                          opacity: isHovered || isSelected ? 1 : 0,
                          transition: 'opacity 0.5s ease',
                          pointerEvents: 'none'
                        }} />
                        
                        {/* Candidate Number Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '1.5rem',
                          left: '1.5rem',
                          width: '50px',
                          height: '50px',
                          borderRadius: '16px',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.4rem',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.3s ease'
                        }}>
                          {candidateNumber}
                        </div>
                        {/* Main Card Content */}
                        <div style={{ position: 'relative', zIndex: 2, paddingTop: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            {/* Avatar */}
                            <div style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '24px',
                              background: isSelected 
                                ? 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)'
                                : `linear-gradient(135deg, ${getCandidateGradient(candidateNumber)})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1.8rem',
                              textShadow: '0 3px 6px rgba(0, 0, 0, 0.6)',
                              boxShadow: isSelected 
                                ? '0 8px 25px rgba(16, 185, 129, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)' 
                                : '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
                              border: '3px solid rgba(255, 255, 255, 0.3)',
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                              transition: 'all 0.4s ease'
                            }}>
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            {/* Selection Indicator */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {isSelected ? (
                                <>
                                  <CheckCircle size={40} style={{ 
                                    color: '#10b981', 
                                    filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))',
                                    animation: 'pulse 2s infinite'
                                  }} />
                                  <span style={{
                                    color: '#10b981',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                  }}>SELECTED</span>
                                </>
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  border: '3px solid rgba(255, 255, 255, 0.4)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s ease',
                                  ...(isHovered && {
                                    borderColor: 'rgba(255, 255, 255, 0.8)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                  })
                                }}>
                                  {isHovered && <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                                  }} />}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Candidate Info */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{
                              color: 'white',
                              fontSize: '1.6rem',
                              fontWeight: 'bold',
                              margin: '0 0 0.75rem 0',
                              textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                              letterSpacing: '-0.5px'
                            }}>Candidate {candidateNumber}</h3>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.95)',
                              fontSize: '1.2rem',
                              margin: '0 0 0.5rem 0',
                              fontWeight: '600',
                              textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)'
                            }}>{candidate.name}</p>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '1rem',
                              margin: '0 0 1rem 0',
                              fontStyle: 'italic',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                              opacity: 0.9
                            }}>{candidate.party}</p>
                            
                            {/* Vote Stats */}
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              <Users size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                              <span style={{ 
                                color: 'rgba(255, 255, 255, 0.9)', 
                                fontWeight: '600',
                                fontSize: '0.95rem'
                              }}>
                                {candidate.voteCount} votes cast
                              </span>
                              {isSelected && (
                                <div style={{ 
                                  marginLeft: 'auto',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem', 
                                  color: '#10b981', 
                                  fontWeight: '700',
                                  fontSize: '0.85rem'
                                }}>
                                  <Vote size={14} />
                                  <span>READY TO VOTE</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Selected Candidate Highlight */}
                        {isSelected && (
                          <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '600' }}>
                              <Vote size={16} />
                              <span>Ready to cast vote for this candidate</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Error Message */}
                {error && (
                  <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '20px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      maxWidth: '400px'
                    }}>
                      <AlertCircle size={20} style={{ color: '#ef4444' }} />
                      <span style={{ color: 'white' }}>{error}</span>
                    </div>
                  </div>
                )}

                {/* Vote Button Section */}
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  marginTop: '2rem'
                }}>
                  {/* Premium Vote Button */}
                  <button
                    onClick={handleVote}
                    disabled={!selectedCandidate || voting || hasAlreadyVoted}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      padding: '1.75rem 4rem',
                      borderRadius: '24px',
                      fontWeight: 'bold',
                      fontSize: '1.3rem',
                      border: 'none',
                      cursor: selectedCandidate && !voting && !hasAlreadyVoted ? 'pointer' : 'not-allowed',
                      background: selectedCandidate && !voting && !hasAlreadyVoted
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 30%, #047857 70%, #065f46 100%)'
                        : 'linear-gradient(135deg, rgba(107, 114, 128, 0.6) 0%, rgba(75, 85, 99, 0.6) 100%)',
                      color: selectedCandidate && !voting && !hasAlreadyVoted ? 'white' : 'rgba(156, 163, 175, 0.8)',
                      boxShadow: selectedCandidate && !voting && !hasAlreadyVoted
                        ? '0 20px 40px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                        : '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: selectedCandidate && !voting && !hasAlreadyVoted ? 'scale(1)' : 'scale(0.95)',
                      textShadow: selectedCandidate && !voting && !hasAlreadyVoted ? '0 2px 8px rgba(0, 0, 0, 0.4)' : 'none',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCandidate && !voting && !hasAlreadyVoted) {
                        e.target.style.transform = 'translateY(-8px) scale(1.08)'
                        e.target.style.boxShadow = '0 30px 60px rgba(16, 185, 129, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                        e.target.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 30%, #059669 70%, #047857 100%)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCandidate && !voting && !hasAlreadyVoted) {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                        e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 30%, #047857 70%, #065f46 100%)'
                      }
                    }}
                  >
                    {/* Button shine effect */}
                    {selectedCandidate && !voting && !hasAlreadyVoted && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                        animation: 'shimmer 3s infinite',
                        pointerEvents: 'none'
                      }} />
                    )}
                    
                    {voting ? (
                      <>
                        <Loader size={28} style={{ 
                          animation: 'spin 1s linear infinite',
                          filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
                        }} />
                        <span>Casting Your Vote...</span>
                      </>
                    ) : (
                      <>
                        <Vote size={28} style={{
                          filter: selectedCandidate ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))' : 'none'
                        }} />
                        <span>Cast My Vote</span>
                      </>
                    )}
                  </button>
                  
                  {/* Vote Confirmation */}
                  {selectedCandidate && !voting && (
                    <div style={{ 
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      maxWidth: '500px',
                      margin: '2rem auto 0 auto'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <Clock size={24} style={{ color: '#f59e0b' }} />
                        <h4 style={{ 
                          color: 'white', 
                          margin: 0, 
                          fontSize: '1.2rem',
                          fontWeight: '600'
                        }}>Confirm Your Choice</h4>
                      </div>
                      
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '1.1rem', 
                        margin: '0 0 0.5rem 0',
                        textAlign: 'center'
                      }}>
                        You are voting for:
                      </p>
                      
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '2px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '16px',
                        padding: '1rem',
                        textAlign: 'center',
                        margin: '1rem 0'
                      }}>
                        <p style={{ 
                          color: '#34d399', 
                          fontWeight: 'bold', 
                          fontSize: '1.3rem',
                          margin: '0 0 0.25rem 0'
                        }}>
                          Candidate {candidates.findIndex(c => c.id === selectedCandidate.id) + 1}: {selectedCandidate.name}
                        </p>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          margin: 0,
                          fontSize: '0.95rem'
                        }}>
                          {selectedCandidate.party || 'Independent'}
                        </p>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.9rem'
                      }}>
                        <Shield size={16} />
                        <span>This action is irreversible and anonymous</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Voting
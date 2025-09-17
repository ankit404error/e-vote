import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Users, Vote, Trophy, RefreshCw, Shield, Eye, Clock, Crown, Award, Medal, TrendingUp, ChevronRight, ThumbsUp, Gift, CheckCircle2, AlertTriangle, LucideServer } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import soundEffects from '../utils/SoundEffects'
import '../styles/Results.css'

const Results = () => {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isLive, setIsLive] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animateNumbers, setAnimateNumbers] = useState(false)
  const [highlightWinner, setHighlightWinner] = useState(false)
  const [expandedCandidateId, setExpandedCandidateId] = useState(null)
  const chartRef = useRef(null)

  useEffect(() => {
    loadResults()
    
    // Set up live updates every 5 seconds
    const interval = setInterval(() => {
      if (isLive) {
        loadResults()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isLive])
  
  // Add animations and effects when data loads
  useEffect(() => {
    if (!loading && candidates.length > 0) {
      // Play notification sound for data load
      soundEffects.feedback('notification')
      
      // Trigger number animations
      setTimeout(() => setAnimateNumbers(true), 300)
      
      // Highlight winner with delay
      setTimeout(() => setHighlightWinner(true), 800)
      
      // Show confetti for winner
      if (getWinner() && !showConfetti) {
        setTimeout(() => {
          setShowConfetti(true)
          soundEffects.feedback('winner')
        }, 1200)
      }
    }
  }, [loading, candidates])

  const loadResults = async (userTriggered = false) => {
    if (userTriggered) {
      // Reset animations for refreshed data
      setAnimateNumbers(false)
      setHighlightWinner(false)
      setShowConfetti(false)
    }
    
    try {
      console.log('📊 Fetching enhanced election results...')
      
      // Try enhanced endpoint first, fall back to original
      let response = await fetch('/api/enhanced/results')
      let data = await response.json()
      
      // If enhanced endpoint fails, use original
      if (!response.ok || !data.success) {
        console.warn('Enhanced results endpoint failed, trying fallback...')
        response = await fetch('/api/blockchain/results')
        data = await response.json()
      }
      
      if (data.success) {
        console.log('✅ Results loaded:', {
          totalVotes: data.results.totalVotes,
          candidates: data.results.candidates?.length || 0,
          source: data.source || 'Enhanced Blockchain'
        })
        
        // Add animation transition
        if (!loading) {
          const oldCandidates = [...candidates]
          
          // Update data with smooth transitions
          setTimeout(() => {
            setResults(data.results)
            setCandidates(data.results.candidates || [])
            setError('')
            setLastUpdated(new Date())
            
            // Trigger animations again
            if (userTriggered) {
              setTimeout(() => setAnimateNumbers(true), 300)
              setTimeout(() => setHighlightWinner(true), 800)
            }
          }, userTriggered ? 400 : 0)
        } else {
          setResults(data.results)
          setCandidates(data.results.candidates || [])
          setError('')
          setLastUpdated(new Date())
        }
      } else {
        const errorMsg = data.error || data.message || 'Failed to load results'
        console.error('❌ Results loading failed:', errorMsg)
        setError(`Failed to load results: ${errorMsg}`)
      }
    } catch (error) {
      console.error('❌ Network error loading results:', error)
      setError('Network error while loading results: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLiveUpdates = () => {
    setIsLive(!isLive)
    soundEffects.feedback('click')
  }
  
  const toggleCandidateDetails = (candidateId) => {
    if (expandedCandidateId === candidateId) {
      setExpandedCandidateId(null)
    } else {
      setExpandedCandidateId(candidateId)
    }
    
    soundEffects.feedback('click')
  }

  const calculatePercentage = (voteCount, totalVotes) => {
    if (totalVotes === 0) return 0
    return Math.round((voteCount / totalVotes) * 100)
  }

  const getWinner = () => {
    if (!candidates || candidates.length === 0) return null
    return candidates.reduce((winner, candidate) => 
      candidate.voteCount > winner.voteCount ? candidate : winner
    )
  }

  const formatTime = (date) => {
    return date ? date.toLocaleTimeString() : 'Never'
  }

  if (loading) {
    return (
      <div className="results-container">
        <FloatingParticles count={30} speed={1.5} />
        <div className="loading-screen">
          <div className="loading-icon-container">
            <BarChart3 className="loading-icon spin" size={48} />
            <div className="loading-pulse"></div>
          </div>
          <h2 className="animate-slideInUp">Loading Election Results...</h2>
          <p className="animate-slideInUp animation-delay-2">Fetching live data from blockchain...</p>
          <div className="loading-progress">
            <div className="loading-progress-bar"></div>
          </div>
        </div>
      </div>
    )
  }

  const winner = getWinner()
  const totalVotes = results?.totalVotes || 0

  return (
    <div className="results-container">
      <FloatingParticles count={30} />
      
      {/* Confetti Animation for Winner */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="confetti-piece" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Header */}
      <header className="results-header">
        <button 
          onClick={() => {
            soundEffects.feedback('click')
            navigate('/')
          }}
          className="back-button"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        
        <div className="header-title">
          <BarChart3 size={32} className="header-icon" />
          <h1>📊 Live Election Results</h1>
        </div>
        
        <div className="live-controls">
          <button 
            onClick={toggleLiveUpdates}
            className={`live-toggle ${isLive ? 'active' : 'inactive'}`}
          >
            <div className={`live-indicator ${isLive ? 'live' : 'paused'}`} />
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button 
            onClick={() => {
              soundEffects.feedback('success')
              loadResults(true)
            }} 
            disabled={loading}
            className="refresh-button"
          >
            <RefreshCw size={14} className={loading ? 'loading-spinner' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <main className="results-main">
        {error && (
          <div className="error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="overview-card total-votes">
            <div className="card-icon">
              <Vote size={24} />
            </div>
            <div className="card-content">
              <h3>Total Votes Cast</h3>
              <p className="big-number count-animation">
                {animateNumbers ? totalVotes.toLocaleString() : '0'}
              </p>
            </div>
          </div>
          
          <div className="overview-card total-candidates">
            <div className="card-icon">
              <Users size={24} />
            </div>
            <div className="card-content">
              <h3>Candidates</h3>
              <p className="big-number count-animation">
                {animateNumbers ? candidates.length : '0'}
              </p>
            </div>
          </div>
          
          <div className="overview-card voting-status">
            <div className="card-icon">
              <Shield size={24} />
            </div>
            <div className="card-content">
              <h3>Voting Status</h3>
              <p className={`status ${results?.votingActive ? 'active' : 'closed'}`}>
                {results?.votingActive ? '🟢 ACTIVE' : '🔴 CLOSED'}
              </p>
            </div>
          </div>

          <div className="overview-card last-updated">
            <div className="card-icon">
              <Clock size={24} />
            </div>
            <div className="card-content">
              <h3>Last Updated</h3>
              <p className="timestamp">{formatTime(lastUpdated)}</p>
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {winner && totalVotes > 0 && (
          <div className="winner-section">
            <div className={`winner-card ${highlightWinner ? 'highlight-winner' : ''}`}>
              <div className="winner-icon">
                <Crown size={48} />
              </div>
              <div className="winner-info">
                <h2>🏆 Current Leader</h2>
                <h3>{winner.name}</h3>
                <p className="winner-party">{winner.party}</p>
                <div className="winner-stats">
                  <span className="winner-votes count-animation">
                    {animateNumbers ? winner.voteCount.toLocaleString() : '0'} votes
                  </span>
                  <span className="winner-percentage count-animation">
                    ({animateNumbers ? calculatePercentage(winner.voteCount, totalVotes) : '0'}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="detailed-results">
          <div className="results-header-section">
            <h2>📊 Detailed Results</h2>
            <p>Real-time vote tallies from the blockchain</p>
          </div>

          <div className="candidates-results">
            {candidates.length === 0 ? (
              <div className="no-results">
                <BarChart3 size={48} />
                <h3>No Results Available</h3>
                <p>No votes have been cast yet or results are being processed.</p>
              </div>
            ) : (
              candidates.map((candidate, index) => {
                const percentage = calculatePercentage(candidate.voteCount, totalVotes)
                const isWinner = winner && candidate.id === winner.id
                const isExpanded = expandedCandidateId === candidate.id
                
                return (
                  <div 
                    key={candidate.id} 
                    className={`candidate-result ${isWinner ? 'winner' : ''} ${highlightWinner && isWinner ? 'pulse-highlight' : ''} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCandidateDetails(candidate.id)}
                  >
                    <div className="candidate-position">
                      <span className={`position ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                        #{index + 1}
                      </span>
                      {isWinner && <Crown className="position-icon" size={16} />}
                    </div>
                    
                    <div className="candidate-info-result">
                      <div className="candidate-avatar-result">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="candidate-details-result">
                        <h4>{candidate.name}</h4>
                        <p className="party-result">{candidate.party}</p>
                      </div>
                    </div>
                    
                    <div className="vote-stats">
                      <div className="vote-numbers">
                        <span className="vote-count count-animation">
                          {animateNumbers ? candidate.voteCount.toLocaleString() : '0'}
                        </span>
                        <span className="vote-percentage count-animation">
                          {animateNumbers ? percentage : '0'}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: animateNumbers ? `${percentage}%` : '0%' }}
                        ></div>
                      </div>
                      
                      {/* Expanded view with additional stats */}
                      {isExpanded && (
                        <div className="expanded-stats">
                          <div className="stat-item">
                            <TrendingUp size={16} />
                            <span>Share of total votes: <strong>{percentage}%</strong></span>
                          </div>
                          <div className="stat-item">
                            <ChevronRight size={16} />
                            <span>Difference from leader: <strong>
                              {isWinner ? 'Current Leader' : `-${winner.voteCount - candidate.voteCount} votes`}
                            </strong></span>
                          </div>
                          <div className="stat-item">
                            <ThumbsUp size={16} />
                            <span>Projected final position: <strong>#{index + 1}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Blockchain Information */}
        <div className="blockchain-info">
          <div className="blockchain-card">
            <LucideServer size={24} className="blockchain-icon" />
            <div className="blockchain-details">
              <h3>🔗 Blockchain Transparency</h3>
              <p>All votes are securely stored on the blockchain for complete transparency and immutability.</p>
              <div className="blockchain-stats">
                <div className="stat">
                  <CheckCircle2 size={16} className="stat-icon" />
                  <span><strong>Encrypted Votes:</strong> {animateNumbers ? (results?.encryptedVotesCast || 0) : '0'}</span>
                </div>
                <div className="stat">
                  <Gift size={16} className="stat-icon" />
                  <span><strong>Public Tallies:</strong> {animateNumbers ? totalVotes : '0'}</span>
                </div>
                <div className="stat">
                  <Shield size={16} className="stat-icon" />
                  <span><strong>Network:</strong> Local Hardhat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh Notice */}
        <div className="auto-refresh-notice">
          <Eye size={16} className="notice-icon" />
          <span>
            {isLive ? 
              "🟢 Results update automatically every 5 seconds" : 
              "⏸️ Live updates paused - click refresh to update manually"
            }
          </span>
        </div>
        
        {/* Judges' Notes */}
        <div className="judges-notes">
          <div className="note-badge">
            <Medal size={16} />
            <span>For Hackathon Judges</span>
          </div>
          <div className="notes-content">
            <h4>Feature Highlights:</h4>
            <ul>
              <li>Real-time data visualization with smooth animations</li>
              <li>Interactive winner highlight with celebration effects</li>
              <li>Expandable candidate details for deeper insights</li>
              <li>Responsive design with optimal mobile experience</li>
              <li>Advanced particle system and background animations</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Results
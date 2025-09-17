import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Fingerprint, CheckCircle, AlertCircle, Loader, Shield, AlertTriangle, FileText } from 'lucide-react'
import FingerprintCapture from './FingerprintCapture'
import '../styles/Register.css'

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Personal Details, 2: Fingerprint
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState(null)
  const [uniqueNumber, setUniqueNumber] = useState('')

  const [formData, setFormData] = useState({
    uniqueNumber: '',
    name: '',
    age: '',
    gender: '',
    location: '',
    phoneNumber: '',
    email: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('Input change:', name, value) // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.age || formData.age < 1 || formData.age > 150) {
      setError('Please provide a valid age between 1 and 150')
      return false
    }
    if (!formData.gender) {
      setError('Gender is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Location is required')
      return false
    }
    return true
  }

  const handlePersonalDetailsSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setUserId(data.data.userId)
        setUniqueNumber(data.data.uniqueNumber)
        setSuccess('Personal details registered successfully!')
        setTimeout(() => {
          setStep(2)
        }, 1500)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleFingerprintSuccess = () => {
    setSuccess('Registration completed successfully!')
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  const handleFingerprintError = (errorMessage) => {
    setError(errorMessage)
  }

  return (
    <div className="register-container">
      {/* Header */}
      <header className="register-header">
        <div className="header-content">
          <div className="header-left">
            <div className="government-logo">
              <Shield size={24} />
              <div className="logo-text">
                <h1>Digital Voter Registration Portal</h1>
                <p>Government of India | Election Commission</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="back-button" onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span id='header-span'>Personal Details</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span id='header-span'>Biometric Verification</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="register-main">
        <div className="form-container">
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="registration-section">
              <div className="section-header">
                <h2>Voter Registration Form</h2>
                <p>Please fill in your personal details accurately as per your official documents</p>
              </div>

              <form onSubmit={handlePersonalDetailsSubmit} className="registration-form">
                <div className="form-fields">
                  {/* Important Notice */}
                  <div className="notice-box">
                    <AlertTriangle size={16} />
                    <div>
                      <strong>Important:</strong> Please ensure all information matches your official identity documents (Aadhaar, Passport, etc.)
                    </div>
                  </div>

                  {/* Unique Number Field */}
                  <div className="field-group">
                    <label htmlFor="uniqueNumber">Voter ID Number (Optional)</label>
                    <input
                      type="text"
                      id="uniqueNumber"
                      name="uniqueNumber"
                      value={formData.uniqueNumber}
                      onChange={handleInputChange}
                      placeholder="Leave empty for auto-generation"
                      maxLength="12"
                    />
                    <span className="field-help">If you already have a Voter ID, enter it here. Otherwise, leave blank for auto-generation.</span>
                  </div>

                  <div className="field-row">
                    {/* Name Field */}
                    <div className="field-group">
                      <label htmlFor="name">Full Name <span className="required">*</span></label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full legal name"
                        required
                      />
                      <span className="field-help">As per your official documents</span>
                    </div>

                    {/* Age Field */}
                    <div className="field-group">
                      <label htmlFor="age">Age <span className="required">*</span></label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Your age"
                        min="18"
                        max="150"
                        required
                      />
                      <span className="field-help">Must be 18 or above to register</span>
                    </div>
                  </div>

                  <div className="field-row">
                    {/* Gender Field */}
                    <div className="field-group">
                      <label htmlFor="gender">Gender <span className="required">*</span></label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Location Field */}
                    <div className="field-group">
                      <label htmlFor="location">Address <span className="required">*</span></label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State, PIN Code"
                        required
                      />
                      <span className="field-help">Complete address as per address proof</span>
                    </div>
                  </div>

                  <div className="field-row">
                    {/* Phone Field */}
                    <div className="field-group">
                      <label htmlFor="phoneNumber">Mobile Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                      />
                      <span className="field-help">For OTP verification (optional)</span>
                    </div>

                    {/* Email Field */}
                    <div className="field-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                      <span className="field-help">For notifications and updates (optional)</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {error && (
                  <div className="message error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="message success">
                    <CheckCircle size={16} />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader className="spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      'Continue to Biometric Verification'
                    )}
                  </button>
                  
                  <div className="form-disclaimer">
                    <p><strong>Data Privacy:</strong> All information provided is encrypted and securely stored in compliance with Government of India data protection guidelines.</p>
                  </div>
                </div>
            </form>
          </div>
        )}

          {/* Step 2: Fingerprint Registration */}
          {step === 2 && (
            <div className="registration-section">
              <div className="section-header">
                <h2>Biometric Verification</h2>
                <p>Complete your voter registration with fingerprint authentication</p>
              </div>

              {/* Registration Summary */}
              <div className="registration-summary">
                <h3>Registration Details</h3>
                <div className="summary-table">
                  <div className="summary-row">
                    <span className="label">Full Name:</span>
                    <span className="value">{formData.name}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Voter ID:</span>
                    <span className="value">{uniqueNumber}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Age:</span>
                    <span className="value">{formData.age} years</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Address:</span>
                    <span className="value">{formData.location}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Gender:</span>
                    <span className="value">{formData.gender}</span>
                  </div>
                </div>
              </div>

              {/* Fingerprint Capture */}
              <div className="biometric-section">
                <h3>Fingerprint Authentication</h3>
                <p>Please place your finger on the scanner to complete registration</p>
                
                <FingerprintCapture
                  userId={userId}
                  onSuccess={handleFingerprintSuccess}
                  onError={handleFingerprintError}
                />
              </div>

              {/* Messages */}
              {error && (
                <div className="message error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="message success">
                  <CheckCircle size={16} />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Register
import { useState, useEffect } from 'react'
import { Fingerprint, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import '../styles/FingerprintCapture.css'

const FingerprintCapture = ({ userId, onSuccess, onError, mode = 'register' }) => {
  const [status, setStatus] = useState('ready') // ready, capturing, success, error
  const [message, setMessage] = useState('')
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false)

  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential && 
        window.navigator.credentials &&
        window.navigator.credentials.create) {
      setIsWebAuthnSupported(true)
      setMessage('Place your finger on the sensor when ready')
    } else {
      setIsWebAuthnSupported(false)
      setMessage('WebAuthn is not supported in this browser. For demo purposes, click "Simulate Fingerprint"')
    }
  }, [])

  // Store credential information for verification
  const storeCredentialInfo = (credential, userId) => {
    const credentialInfo = {
      id: credential.id,
      rawId: Array.from(new Uint8Array(credential.rawId)),
      userId: userId,
      timestamp: Date.now()
    }
    localStorage.setItem(`webauthn_cred_${userId}`, JSON.stringify(credentialInfo))
    localStorage.setItem('last_registered_user', userId.toString())
  }

  const getAllStoredCredentials = () => {
    const credentials = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('webauthn_cred_')) {
        try {
          const credInfo = JSON.parse(localStorage.getItem(key))
          credentials.push(credInfo)
        } catch (e) {
          console.warn('Invalid credential data:', key)
        }
      }
    }
    return credentials
  }

  const captureFingerprint = async () => {
    setStatus('capturing')
    setMessage('Capturing fingerprint...')

    try {
      let fingerprintData = null

      if (isWebAuthnSupported) {
        try {
          if (mode === 'register') {
            // REGISTRATION: Simulate fingerprint enrollment
            // Note: WebAuthn can only use existing Windows Hello fingerprints
            setMessage('Please place your finger on the sensor to enroll...')
            await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate enrollment time
            
            try {
              // Try to create a WebAuthn credential to test if biometrics work
              const challenge = crypto.getRandomValues(new Uint8Array(32))
              
              const publicKeyCredentialCreationOptions = {
                challenge: challenge,
                rp: {
                  name: "Aadhaar Demo System",
                  id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
                },
                user: {
                  id: new TextEncoder().encode(userId?.toString() || 'demo_user'),
                  name: `user_${userId}@aadhaar.local`,
                  displayName: `User ${userId}`,
                },
                pubKeyCredParams: [
                  {alg: -7, type: "public-key"},   // ES256 (required)
                  {alg: -257, type: "public-key"}, // RS256 (required for Windows Hello)
                ],
                authenticatorSelection: {
                  authenticatorAttachment: "platform",
                  userVerification: "required",
                  requireResidentKey: false
                },
                timeout: 30000,
                attestation: "none"
              }

              const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
              })

              if (credential) {
                // Store credential info and create a unique fingerprint ID for this user
                const uniqueFingerprintId = `fp_${userId}_${Date.now()}`
                storeCredentialInfo(credential, userId)
                
                // Store the association between this user and their Windows Hello fingerprint
                localStorage.setItem(`fingerprint_${userId}`, uniqueFingerprintId)
                
                fingerprintData = uniqueFingerprintId
                setMessage('Fingerprint enrolled successfully using Windows Hello!')
              } else {
                throw new Error('Biometric authentication failed')
              }
            } catch (webauthnError) {
              console.warn('WebAuthn registration failed:', webauthnError)
              // Fallback to simulation
              const uniqueFingerprintId = `simulated_fp_${userId}_${Date.now()}`
              localStorage.setItem(`fingerprint_${userId}`, uniqueFingerprintId)
              fingerprintData = uniqueFingerprintId
              setMessage('Fingerprint enrolled (simulated - please enable Windows Hello for real biometrics)')
            }
            
          } else {
            // VERIFICATION: Check for registered users and authenticate
            const storedCredentials = getAllStoredCredentials()
            
            if (storedCredentials.length === 0) {
              throw new Error('No users have been registered. Please register a user first.')
            }
            
            setMessage('Please authenticate with your registered fingerprint...')
            
            try {
              const challenge = crypto.getRandomValues(new Uint8Array(32))
              
              const publicKeyCredentialRequestOptions = {
                challenge: challenge,
                allowCredentials: storedCredentials.map(cred => ({
                  id: new Uint8Array(cred.rawId),
                  type: 'public-key',
                  transports: ['internal']
                })),
                userVerification: "required",
                timeout: 30000
              }

              const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
              })

              if (assertion) {
                // Find matching stored credential and get the user's fingerprint ID
                const matchingCred = storedCredentials.find(cred => cred.id === assertion.id)
                
                if (matchingCred) {
                  const userFingerprintId = localStorage.getItem(`fingerprint_${matchingCred.userId}`)
                  if (userFingerprintId) {
                    fingerprintData = userFingerprintId
                    setMessage('Biometric verification successful!')
                  } else {
                    throw new Error('User fingerprint data not found')
                  }
                } else {
                  throw new Error('Credential not recognized')
                }
              } else {
                throw new Error('Authentication cancelled or failed')
              }
            } catch (webauthnError) {
              console.warn('WebAuthn verification failed:', webauthnError)
              // For demo purposes, show a user selection dialog
              const registeredUsers = storedCredentials.map(cred => cred.userId)
              if (registeredUsers.length === 1) {
                // If only one user, simulate their fingerprint
                const userFingerprintId = localStorage.getItem(`fingerprint_${registeredUsers[0]}`)
                if (userFingerprintId) {
                  fingerprintData = userFingerprintId
                  setMessage('Fingerprint verified (simulated - enable Windows Hello for real biometrics)')
                } else {
                  throw new Error('No fingerprint data found for registered user')
                }
              } else {
                throw new Error('Multiple users registered. Please use Windows Hello for proper identification.')
              }
            }
          }
        } catch (webauthnError) {
          console.warn('WebAuthn failed:', webauthnError)
          setStatus('error')
          setMessage(`WebAuthn Error: ${webauthnError.message}`)
          onError && onError(webauthnError.message)
          return
        }
      } else {
        setStatus('error')
        setMessage('WebAuthn is not supported in this browser. Please use Chrome, Edge, or Firefox.')
        onError && onError('WebAuthn not supported')
        return
      }

      // Store or verify fingerprint based on mode
      if (mode === 'register') {
        await registerFingerprint(fingerprintData)
      } else {
        await verifyFingerprint(fingerprintData)
      }

    } catch (error) {
      setStatus('error')
      setMessage('Failed to capture fingerprint')
      onError && onError(error.message || 'Fingerprint capture failed')
    }
  }

  const registerFingerprint = async (fingerprintData) => {
    try {
      const response = await fetch('/api/register-fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          fingerprintData: fingerprintData
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage('Fingerprint registered successfully!')
        onSuccess && onSuccess(data.data)
      } else {
        throw new Error(data.message || 'Registration failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to register fingerprint')
      onError && onError(error.message || 'Registration failed')
    }
  }

  const verifyFingerprint = async (fingerprintData) => {
    try {
      const response = await fetch('/api/verify-fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprintData: fingerprintData
        }),
      })

      const data = await response.json()

      if (data.success && data.verified) {
        setStatus('success')
        setMessage('Fingerprint verified successfully!')
        onSuccess && onSuccess(data.user)
      } else if (data.success && !data.verified) {
        setStatus('error')
        setMessage('Fingerprint not recognized')
        onError && onError('Fingerprint not found in database')
      } else {
        throw new Error(data.message || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to verify fingerprint')
      onError && onError(error.message || 'Verification failed')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'capturing':
        return <Loader className="spin" size={64} />
      case 'success':
        return <CheckCircle size={64} className="success-icon" />
      case 'error':
        return <AlertCircle size={64} className="error-icon" />
      default:
        return <Fingerprint size={64} className="fingerprint-icon" />
    }
  }

  const getStatusClass = () => {
    switch (status) {
      case 'capturing':
        return 'capturing'
      case 'success':
        return 'success'
      case 'error':
        return 'error'
      default:
        return 'ready'
    }
  }

  return (
    <div className={`fingerprint-capture ${getStatusClass()}`}>
      <div className="capture-area">
        <div className="fingerprint-scanner">
          {getStatusIcon()}
          <div className="scanner-ring"></div>
        </div>
        
        <div className="capture-info">
          <h3>
            {mode === 'register' ? 'Register Fingerprint' : 'Verify Identity'}
          </h3>
          <p className="status-message">{message}</p>
        </div>

        {status === 'ready' && (
          <button 
            onClick={captureFingerprint}
            className="capture-button"
            disabled={status === 'capturing'}
          >
            {isWebAuthnSupported ? 'Capture Fingerprint' : 'Simulate Fingerprint'}
          </button>
        )}

        {status === 'error' && (
          <button 
            onClick={() => {
              setStatus('ready')
              setMessage(isWebAuthnSupported ? 'Place your finger on the sensor when ready' : 'Click to simulate fingerprint capture')
            }}
            className="retry-button"
          >
            Try Again
          </button>
        )}
      </div>

    </div>
  )
}

export default FingerprintCapture
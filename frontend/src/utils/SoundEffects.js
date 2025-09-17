// Sound Effects Utility for Enhanced UI Experience
// This provides subtle audio feedback without requiring external files

class SoundEffects {
  constructor() {
    this.audioContext = null
    this.enabled = true
    this.initialize()
  }

  initialize() {
    try {
      // Create audio context for generating sounds
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext()
      } else if (typeof webkitAudioContext !== 'undefined') {
        this.audioContext = new webkitAudioContext()
      }
    } catch (e) {
      console.log('Web Audio API not supported')
      this.enabled = false
    }
  }

  // Generate a tone with specified frequency and duration
  createTone(frequency, duration = 0.1, type = 'sine') {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (e) {
      console.log('Sound generation failed')
    }
  }

  // Click sound for button interactions
  playClick() {
    this.createTone(800, 0.1, 'square')
  }

  // Success sound for positive actions
  playSuccess() {
    setTimeout(() => this.createTone(523, 0.15, 'sine'), 0)    // C
    setTimeout(() => this.createTone(659, 0.15, 'sine'), 100)  // E
    setTimeout(() => this.createTone(784, 0.2, 'sine'), 200)   // G
  }

  // Notification sound for data updates
  playNotification() {
    this.createTone(440, 0.1, 'sine')
    setTimeout(() => this.createTone(554, 0.1, 'sine'), 150)
  }

  // Winner announcement sound
  playWinner() {
    const notes = [523, 659, 784, 1047] // C, E, G, C octave
    notes.forEach((note, index) => {
      setTimeout(() => this.createTone(note, 0.3, 'sine'), index * 100)
    })
  }

  // Error sound
  playError() {
    this.createTone(200, 0.3, 'square')
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  // Haptic feedback (if supported)
  vibrate(pattern = 100) {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern)
    }
  }

  // Combined audio and haptic feedback
  feedback(type = 'click') {
    switch (type) {
      case 'click':
        this.playClick()
        this.vibrate(50)
        break
      case 'success':
        this.playSuccess()
        this.vibrate([100, 50, 100])
        break
      case 'winner':
        this.playWinner()
        this.vibrate([200, 100, 200, 100, 200])
        break
      case 'notification':
        this.playNotification()
        this.vibrate(100)
        break
      case 'error':
        this.playError()
        this.vibrate([150, 100, 150])
        break
      default:
        this.playClick()
        this.vibrate(50)
    }
  }
}

// Create singleton instance
const soundEffects = new SoundEffects()

export default soundEffects
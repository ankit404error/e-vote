import { useEffect, useState } from 'react'
import '../styles/FloatingParticles.css'

const FloatingParticles = ({ count = 40 }) => {
  const [particles, setParticles] = useState([])

  const particleTypes = [
    'particle-glow',
    'particle-shimmer', 
    'particle-pulse',
    'particle-twinkle'
  ]

  const particleColors = [
    'rgba(139, 92, 246, 0.6)',
    'rgba(59, 130, 246, 0.6)',
    'rgba(16, 185, 129, 0.6)',
    'rgba(245, 158, 11, 0.6)',
    'rgba(236, 72, 153, 0.6)'
  ]

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 2,
          duration: Math.random() * 25 + 15,
          delay: Math.random() * 10,
          type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          blur: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.2
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [count])

  return (
    <div className="floating-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${particle.type}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            filter: `blur(${particle.blur}px)`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  )
}

export default FloatingParticles
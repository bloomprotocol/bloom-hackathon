'use client'

import React, { useEffect, useRef, useState } from 'react'
import styles from './terminalTransition.module.css'
import mainStyles from './mainpage.module.css'
import { mainpageContent } from './content.config'

interface TerminalTransitionProps {
  onTransitionComplete: () => void
  selectedOption: number
  selectedOptionText: string
  userType: 'developer' | 'user'
}

const TerminalTransition: React.FC<TerminalTransitionProps> = ({ 
  onTransitionComplete, 
  selectedOption,
  selectedOptionText, 
  userType 
}) => {
  const [showTerminal, setShowTerminal] = useState(false)
  const [showFramingText, setShowFramingText] = useState(false)
  const [floatUp, setFloatUp] = useState(false)
  const [terminalPosition, setTerminalPosition] = useState({ top: '50%', left: '50%' })

  // RPG-specific states (only for user)
  const [geometryVisible, setGeometryVisible] = useState(false)
  const [emergenceTextVisible, setEmergenceTextVisible] = useState(false)

  const terminalRef = useRef<HTMLDivElement>(null)
  const rippleContainerRef = useRef<HTMLDivElement>(null)
  const isCreatingRipplesRef = useRef(true)
  const rippleCountRef = useRef(0)
  const rippleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const neonColors = [
    'neon-purple',
    'neon-pink',
    'neon-blue',
    'neon-green',
    'neon-yellow',
    'neon-orange'
  ]

  const createRipple = () => {
    if (!isCreatingRipplesRef.current || rippleCountRef.current >= 5) return

    const container = rippleContainerRef.current
    if (!container) return

    const ring = document.createElement('div')
    ring.className = `${styles.geometryRing} ${styles.ripple}`
    ring.classList.add(styles[neonColors[rippleCountRef.current % neonColors.length]])

    container.appendChild(ring)
    rippleCountRef.current++

    setTimeout(() => {
      ring.remove()
    }, 3000)

    if (rippleCountRef.current < 5) {
      const minDelay = 400
      const maxDelay = 1400
      const nextDelay = minDelay + Math.random() * (maxDelay - minDelay)
      rippleTimeoutRef.current = setTimeout(createRipple, nextDelay)
    }
  }

  const getCommandText = () => {
    if (userType === 'developer') {
      return selectedOption === 1 
        ? mainpageContent.terminalTransition.commands.developer.option1
        : mainpageContent.terminalTransition.commands.developer.option2
    } else {
      return selectedOption === 1 
        ? mainpageContent.terminalTransition.commands.user.option1
        : mainpageContent.terminalTransition.commands.user.option2
    }
  }

  const getOutputText = () => {
    if (userType === 'developer') {
      if (selectedOption === 1) {
        return mainpageContent.terminalTransition.output.developer.option1
      } else {
        return mainpageContent.terminalTransition.output.developer.option2
      }
    } else {
      if (selectedOption === 1) {
        return mainpageContent.terminalTransition.output.user.option1
      } else {
        return mainpageContent.terminalTransition.output.user.option2
      }
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const runSequence = async () => {
    setShowTerminal(true)
    setShowFramingText(true)

    if (userType === 'developer') {
      // Developer sequence
      await sleep(2500)
      setShowFramingText(false)
      
      await sleep(500)
      setFloatUp(true)
      
      await sleep(800)
      onTransitionComplete()
    } else {
      // User RPG sequence
      await sleep(500)
      await sleep(800) // Wait for terminal lines to appear

      // Fade out framing text
      setShowFramingText(false)
      await sleep(300)

      // Sacred geometry appears
      setGeometryVisible(true)
      createRipple()
      await sleep(500)

      // Show emergence text
      setEmergenceTextVisible(true)
      await sleep(1500)

      // Terminal floats up
      setFloatUp(true)
      
      // Stop creating ripples
      isCreatingRipplesRef.current = false
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current)
      }

      // Wait for float animation then immediately transition
      await sleep(800)
      onTransitionComplete()
    }
  }

  useEffect(() => {
    runSequence()

    return () => {
      if (userType === 'user') {
        isCreatingRipplesRef.current = false
        if (rippleTimeoutRef.current) {
          clearTimeout(rippleTimeoutRef.current)
        }
      }
    }
  }, [])

  // Track terminal position for RPG effects
  useEffect(() => {
    if (userType === 'user' && (geometryVisible || floatUp) && terminalRef.current) {
      const updatePosition = () => {
        if (terminalRef.current) {
          const rect = terminalRef.current.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          setTerminalPosition({
            top: `${centerY}px`,
            left: `${centerX}px`
          })
        }
      }
      
      updatePosition()
      
      if (floatUp) {
        const interval = setInterval(updatePosition, 16)
        const timeout = setTimeout(() => {
          clearInterval(interval)
        }, 800)
        
        return () => {
          clearInterval(interval)
          clearTimeout(timeout)
        }
      }
    }
  }, [geometryVisible, floatUp, userType])

  const framingTextContent = () => {
    if (userType === 'developer') {
      return (
        <>
          <h1 className="text-[40px] font-bold text-white mb-3">
            {mainpageContent.terminalTransition.framingText.developer.title}
          </h1>
          <p className="text-[25px] text-[#bfdbfe]">
            {mainpageContent.terminalTransition.framingText.developer.subtitle}
          </p>
        </>
      )
    } else {
      return (
        <>
          <h1 className="text-[32px] font-bold text-white mb-3">
            {mainpageContent.terminalTransition.framingText.user.title}
          </h1>
          <p className="text-[20px] text-[#FFB3E6]">
            {mainpageContent.terminalTransition.framingText.user.subtitle}
          </p>
        </>
      )
    }
  }

  return (
    <>
      <div className={`${styles.transitionWrapper} ${showTerminal ? styles.show : ''} ${floatUp ? styles.floatUp : ''}`}>
        <div className="relative px-4 max-w-[1440px] mx-auto flex flex-col justify-center items-center z-[2]">
            {/* Framing text */}
            <div className={`text-center mb-8 h-[35vh] content-center ${mainStyles.framingText} ${showFramingText ? styles.framingTextFadeIn : styles.framingTextFadeOut}`}>
              {framingTextContent()}
            </div>
            
            {/* Terminal */}
            <div ref={terminalRef} className={`${mainStyles["terminal"]} font-mono`}>
              <div className={`${mainStyles["terminal-header"]} justify-between`}>
                <div className={mainStyles["terminal-dots"]}>
                  <div className={mainStyles["terminal-dot-red"]}></div>
                  <div className={mainStyles["terminal-dot-yellow"]}></div>
                  <div className={mainStyles["terminal-dot-green"]}></div>
                </div>
                <div className={mainStyles["toggleContainer"]}>
                  <span className={`${mainStyles["toggleText"]} ${userType === 'developer' ? mainStyles["toggleTextDeveloper"] : mainStyles["toggleTextUser"]}`}>
                    {userType === 'developer' ? mainpageContent.terminalTransition.toggleText.developer : mainpageContent.terminalTransition.toggleText.user}
                  </span>
                  <button className={`px-0 ${mainStyles["toggleButton"]} ${userType === 'developer' ? mainStyles["toggleButtonDeveloper"] : mainStyles["toggleButtonUser"]}`} disabled>
                    <span className={`${mainStyles["toggleSwitch"]}`} />
                  </button>
                </div>
              </div>
              <div className={mainStyles["terminal-content"]}>
                <div className={`${mainStyles["terminal-line"]} ${styles.line1}`}>
                  <span className={mainStyles["prompt"]}>{getCommandText().split(' ')[0]}</span> {getCommandText().substring(2)}
                </div>
                {getOutputText().map((line, index) => (
                  <div key={index} className={`${mainStyles["terminal-line"]} ${styles.output} ${styles[`line${index + 2}`]}`}>
                    <span style={{ color: userType === 'developer' ? '#93c5fd' : '#FF8CCC' }}>
                      {line}
                    </span>
                  </div>
                ))}
                <div className={`${mainStyles["input-line"]} ${styles[`line${getOutputText().length + 2}`]}`}>
                  <span className={mainStyles["input-prompt"]}>&gt;</span>
                  <div className={mainStyles["cursor"]}></div>
                </div>
              </div>
            </div>
        </div>
        
        {/* User-specific overlays */}
        {userType === 'user' && (
          <>
            <div className={`${styles.emergenceText} ${emergenceTextVisible ? styles.show : ''}`}>
              {mainpageContent.terminalTransition.emergence.text}
            </div>
          </>
        )}
      </div>
      
      {/* Sacred geometry - outside wrapper for user */}
      {userType === 'user' && (
        <div 
          className={`${styles.sacredGeometry} ${geometryVisible ? styles.reveal : ''}`}
          style={{
            top: terminalPosition.top,
            left: terminalPosition.left,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className={styles.rippleContainer} ref={rippleContainerRef} />
        </div>
      )}
    </>
  )
}

export default TerminalTransition 
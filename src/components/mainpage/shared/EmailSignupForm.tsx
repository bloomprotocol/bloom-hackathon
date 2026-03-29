import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './EmailSignupForm.module.css';
import { COLORS } from './animations.config';
import { collectFingerprintForWaitlist } from '@/lib/utils/userFinger';
import waitlistServices from '@/lib/api/services/waitlistService';
import { logger } from '@/lib/utils/logger';
import { useModal } from '@/lib/context/ModalContext';

interface EmailSignupFormProps {
  variant: 'developer' | 'user';
  title: string;
  buttonText: string | string[];
  successButtonText?: string;
  placeholderText?: string;
  successPlaceholderText?: string;
  show: boolean;
  className?: string;
  referralCode?: string;
  selectedOption: number;
  selectedOptionText: string;
}

const EmailSignupFormEnhanced: React.FC<EmailSignupFormProps> = React.memo(({ 
  variant,
  title,
  buttonText,
  successButtonText,
  placeholderText = "Enter your email",
  successPlaceholderText = "You're on the list!",
  show,
  className = '',
  referralCode = '',
  selectedOption,
  selectedOptionText
}) => {
  const { openHumanVerificationModal, setOnVerificationComplete } = useModal();
  
  const [emailValue, setEmailValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [placeholderMessage, setPlaceholderMessage] = useState(placeholderText);
  const [currentButtonText, setCurrentButtonText] = useState(
    Array.isArray(buttonText) ? buttonText[0] : buttonText
  );
  
  const totalInvalidAttemptsRef = useRef(0);
  const [totalInvalidAttempts, setTotalInvalidAttempts] = useState(0);

  // Monitor status changes
  useEffect(() => {
    if (isSubmitted) {
      setPlaceholderMessage(successPlaceholderText);
    } else if (isDuplicate) {
      setPlaceholderMessage(" Submitted 🫡");
    } else if (isDisabled || totalInvalidAttempts >= 3) {
      setPlaceholderMessage("🤡 Try later 🤡");
      setIsDisabled(true);
    } else if (totalInvalidAttempts >= 2) {
      setPlaceholderMessage("Ooops 🫨");
    } else {
      setPlaceholderMessage(placeholderText);
    }
  }, [totalInvalidAttempts, isSubmitted, isDuplicate, isDisabled, placeholderText, successPlaceholderText]);

  // Button text animation
  useEffect(() => {
    if (!Array.isArray(buttonText) || buttonText.length <= 1) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % buttonText.length;
      setCurrentButtonText(buttonText[index]);
    }, 1000);

    return () => clearInterval(interval);
  }, [buttonText]);
  
  // Handle actual form submission after verification
  const handleSubmitAfterVerification = useCallback(async (email: string) => {
    setIsSubmitting(true);
    
    try {
      const userRole = variant === 'developer' ? 'builder' : 'user';
      const source = `homepage_waitlist_${userRole}`;
      const tag = 'waitlist';
      
      // Collect fingerprint data
      const fingerprint = await collectFingerprintForWaitlist(email, tag, source);
      
      if (!fingerprint) {
        logger.error('[Waitlist] Failed to collect fingerprint data');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare waitlist request data
      const signupData = {
        email: email,
        tag: tag,
        source: source,
        referral: referralCode || undefined,
        terminal_option: {
          [selectedOption.toString()]: selectedOptionText
        },
        fingerprint: fingerprint
      };
      
      // Send request
      const response = await waitlistServices.signupWaitlist(signupData);
      
      // Handle response
      if (response.success) {
        setIsSubmitted(true);
        setEmailValue('');
      } else {
        totalInvalidAttemptsRef.current += 2;
        const newTotalAttempts = totalInvalidAttemptsRef.current;
        
        logger.warn('[Waitlist] Signup failed', { 
          statusCode: response.statusCode,
          error: response.error || response.message || 'Unknown error',
          totalAttempts: newTotalAttempts
        });
        
        setTotalInvalidAttempts(newTotalAttempts);
        setEmailValue('');
        
        if (response.statusCode === 409 && response.error?.includes('Duplicate')) {
          setIsDuplicate(true);
        }
        
        if (newTotalAttempts >= 3) {
          setIsDisabled(true);
        }
      }
    } catch (error) {
      logger.error('[Waitlist] Error during signup', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [variant, referralCode, selectedOption, selectedOptionText]);
  
  // Handle submit button click - opens verification modal first
  const handleSubmit = useCallback(async () => {
    if (isDisabled || isSubmitting) {
      return;
    }
    
    // Validate email format
    if (!emailValue || !emailValue.includes('@')) {
      return;
    }
    
    // Capture email value in closure
    const currentEmail = emailValue;
    
    // Set verification callback and open modal
    setOnVerificationComplete(() => {
      // This will be called after verification
      handleSubmitAfterVerification(currentEmail);
    });
    
    openHumanVerificationModal();
  }, [emailValue, isDisabled, isSubmitting, setOnVerificationComplete, openHumanVerificationModal, handleSubmitAfterVerification]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value);
  }, []);

  const borderColor = variant === 'developer' ? COLORS.developer.primary : COLORS.user.primary;
  const hoverBorderColor = variant === 'developer' ? COLORS.developer.secondary : COLORS.user.secondary;
  const gradientColors = variant === 'developer' 
    ? 'linear-gradient(135deg, #4ecdc4, #60a5fa)'
    : 'linear-gradient(135deg, #ba55d3, #FF5199)';
  const successGradient = variant === 'developer'
    ? 'linear-gradient(135deg, #4ecdc4, #2563eb)'
    : gradientColors;
    
  const getButtonText = () => {
    if (isSubmitted || isDuplicate) {
      return successButtonText || (variant === 'developer' ? 'Welcome to Bloom!' : "You're on the list!");
    }
    
    if (isSubmitting) {
      return "Processing...";
    }
    
    return currentButtonText;
  };

  // Check if we should disable the submit button
  const isSubmitDisabled = isSubmitting || isSubmitted || isDuplicate || isDisabled;

  return (
    <div className={`${styles.signupSection} ${show ? styles.show : ''} ${className}`}>
      <div className={styles.signupTitle}>{title}</div>
      <input
        type="email"
        className={styles.emailInput}
        placeholder={placeholderMessage}
        value={emailValue}
        onChange={handleEmailChange}
        onKeyPress={handleKeyPress}
        style={{
          borderColor: borderColor,
          '--hover-border-color': hoverBorderColor
        } as React.CSSProperties}
        disabled={isSubmitting || isSubmitted || isDuplicate || isDisabled}
      />
      
      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        style={{
          background: (isSubmitted || isDuplicate) ? successGradient : gradientColors,
          opacity: isSubmitDisabled ? 0.7 : 1,
          cursor: isSubmitDisabled ? 'not-allowed' : 'pointer'
        }}
        disabled={isSubmitDisabled}
      >
        {getButtonText()}
      </button>
    </div>
  );
});

EmailSignupFormEnhanced.displayName = 'EmailSignupFormEnhanced';

export default EmailSignupFormEnhanced; 
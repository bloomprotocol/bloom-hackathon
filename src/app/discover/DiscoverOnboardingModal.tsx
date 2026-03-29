'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Sprout, Check } from 'lucide-react';

interface DiscoverOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoosePath: (path: 'supporter' | 'builder') => void;
}

type ModalStage = 'invitation-card' | 'path-selection' | 'builder-form' | 'success';

export default function DiscoverOnboardingModal({
  isOpen,
  onClose,
  onChoosePath,
}: DiscoverOnboardingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<ModalStage>('invitation-card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    url: '',
    email: '',
  });

  // Mount detection for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('invitation-card');
      setFormData({
        projectName: '',
        description: '',
        url: '',
        email: '',
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle ENTER button on invitation card
  const handleEnter = () => {
    setStage('path-selection');
  };

  // Handle supporter path
  const handleSupporterPath = () => {
    onChoosePath('supporter');
    onClose();
  };

  // Handle builder path
  const handleBuilderPath = () => {
    setStage('builder-form');
    onChoosePath('builder');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/builder-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setIsSubmitting(false);
      setStage('success');

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting builder form:', error);
      setIsSubmitting(false);
      alert('Failed to submit. Please try again.');
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
      style={{
        background: 'rgba(15, 12, 20, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full mx-4 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          maxWidth: stage === 'invitation-card' ? '372px' : '480px',
          borderRadius: '20px',
          background: stage === 'invitation-card' ? 'transparent' : 'white',
          padding: stage === 'invitation-card' ? '0' : '40px',
          boxShadow: stage === 'invitation-card' ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
          height: stage === 'invitation-card' ? '520px' : 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - always visible */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-all duration-200 z-10 rounded-full hover:bg-black/5"
          style={{
            color: stage === 'invitation-card' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(100, 80, 140, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = stage === 'invitation-card' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(100, 80, 140, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = stage === 'invitation-card' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(100, 80, 140, 0.3)';
          }}
          aria-label="Close modal"
        >
          <span className="text-2xl leading-none">×</span>
        </button>

        {/* Invitation Card Stage */}
        {stage === 'invitation-card' && (
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden transition-opacity duration-500"
            style={{
              background: 'linear-gradient(160deg, #1a1228 0%, #1e1535 15%, #231940 30%, #1f1a3a 50%, #2a1f35 65%, #1d1520 80%, #18121c 100%)',
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: '200px',
                height: '300px',
                background: 'radial-gradient(ellipse at center, rgba(200, 170, 255, 0.12) 0%, rgba(160, 120, 220, 0.06) 30%, rgba(120, 80, 180, 0.02) 55%, transparent 75%)',
                animation: 'breathe 6s ease-in-out infinite',
              }}
            />

            {/* Star particles */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 20% 15%, rgba(255, 255, 255, 0.4), transparent),
                  radial-gradient(1px 1px at 70% 25%, rgba(255, 255, 255, 0.3), transparent),
                  radial-gradient(1px 1px at 40% 60%, rgba(255, 255, 255, 0.2), transparent),
                  radial-gradient(1px 1px at 80% 70%, rgba(255, 255, 255, 0.35), transparent),
                  radial-gradient(1px 1px at 15% 80%, rgba(255, 255, 255, 0.25), transparent),
                  radial-gradient(1.5px 1.5px at 55% 40%, rgba(200, 180, 255, 0.4), transparent),
                  radial-gradient(1px 1px at 90% 50%, rgba(255, 255, 255, 0.2), transparent),
                  radial-gradient(1px 1px at 30% 35%, rgba(255, 255, 255, 0.15), transparent),
                  radial-gradient(1px 1px at 65% 85%, rgba(200, 180, 255, 0.3), transparent)
                `,
                animation: 'twinkle 8s ease-in-out infinite alternate',
              }}
            />

            {/* Vertical light beam */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(200, 180, 255, 0.08) 15%, rgba(200, 180, 255, 0.15) 35%, rgba(220, 200, 255, 0.06) 60%, transparent 80%)',
              }}
            >
              <div
                className="absolute top-[30%] w-[60px] h-[1px] -left-[30px]"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.12), transparent)',
                }}
              />
              <div
                className="absolute top-[65%] w-[60px] h-[1px] -left-[30px]"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.12), transparent)',
                }}
              />
            </div>

            {/* Top ornamental line */}
            <div className="absolute top-[28px] left-1/2 -translate-x-1/2">
              <div
                className="w-[40px] h-[1px]"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.35), transparent)',
                }}
              />
              <div
                className="absolute -top-[7px] left-1/2 -translate-x-1/2 text-[8px]"
                style={{ color: 'rgba(200, 180, 255, 0.4)' }}
              >
                ✦
              </div>
            </div>

            {/* Card content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-[30px] py-[40px] text-center">
              <div
                className="font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-[4px] uppercase mb-8"
                style={{ color: 'rgba(255, 255, 255, 0.85)' }}
              >
                YOU ARE INVITED
              </div>

              <h2
                className="font-['Cormorant_Garamond'] text-[28px] font-light leading-[1.3] mb-2 italic"
                style={{ color: 'rgba(240, 235, 255, 0.9)' }}
              >
                Where Every Agent
                <br />
                Finds Its{' '}
                <em className="not-italic font-medium" style={{ color: 'rgba(220, 200, 255, 1)' }}>
                  Tribe
                </em>
              </h2>

              <div
                className="w-[24px] h-[1px] my-6"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.3), transparent)',
                }}
              />

              <p
                className="font-['IBM_Plex_Mono'] text-[13px] font-light leading-[1.7] max-w-[220px]"
                style={{ color: 'rgba(255, 255, 255, 0.85)' }}
              >
                Bring your agent — or start here.
                <br />
                The tribe awaits.
              </p>

              <button
                onClick={handleEnter}
                className="mt-9 font-['IBM_Plex_Mono'] text-[11px] font-semibold tracking-[3px] uppercase px-7 py-3 rounded-full transition-all duration-400"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(200, 180, 255, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.borderColor = 'rgba(200, 180, 255, 0.45)';
                  e.currentTarget.style.background = 'rgba(200, 180, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(200, 180, 255, 0.25)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ENTER
              </button>
            </div>

            {/* Bloom Protocol Logo */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="flex items-center gap-3 opacity-90">
                <div className="w-7 h-7 flex-shrink-0 relative">
                  <img
                    src="/identity/bloom-logo.png"
                    alt="Bloom Protocol"
                    className="w-full h-full object-contain brightness-110"
                  />
                </div>
                <div className="h-5 flex-shrink-0 relative">
                  <img
                    src="/identity/bloom-text-logo.png"
                    alt="Bloom Protocol"
                    className="h-full w-auto object-contain brightness-110"
                  />
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes breathe {
                0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
                50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
              }
              @keyframes twinkle {
                0% { opacity: 0.6; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Path Selection Stage */}
        {stage === 'path-selection' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              {/* Bloom sprout logo */}
              <div className="flex justify-center mb-4">
                <img
                  src="/identity/bloom-logo.png"
                  alt="Bloom"
                  className="w-6 h-6 object-contain"
                />
              </div>

              <h2
                className="font-sans text-[22px] font-semibold"
                style={{ color: '#1a1228' }}
              >
                Welcome to Bloom!
              </h2>
              <p
                className="font-sans text-[14px] font-light"
                style={{ color: 'rgba(80, 60, 120, 0.5)' }}
              >
                How would you like to start?
              </p>
            </div>

            {/* Two path cards - stack on mobile */}
            <div className="flex flex-col desktop:flex-row gap-4">
              {/* Supporter path */}
              <button
                onClick={handleSupporterPath}
                className="flex-1 text-left p-6 rounded-2xl border transition-all duration-200"
                style={{
                  border: '1px solid rgba(150, 130, 200, 0.12)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 242, 255, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(140, 110, 200, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(150, 130, 200, 0.12)';
                }}
              >
                <div className="space-y-3">
                  <Eye
                    className="w-8 h-8"
                    style={{ color: 'rgba(120, 90, 180, 0.6)' }}
                    strokeWidth={1.5}
                  />
                  <h3
                    className="font-sans text-[16px] font-semibold"
                    style={{ color: '#1a1228' }}
                  >
                    Discover Projects
                  </h3>
                  <p
                    className="font-sans text-[13px] font-light leading-relaxed"
                    style={{ color: 'rgba(80, 60, 120, 0.5)' }}
                  >
                    Explore early-stage projects and pledge your support to earn your Supporter
                    Identity
                  </p>
                </div>
              </button>

              {/* Builder path */}
              <button
                onClick={handleBuilderPath}
                className="flex-1 text-left p-6 rounded-2xl border transition-all duration-200"
                style={{
                  border: '1px solid rgba(150, 130, 200, 0.12)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(240, 255, 245, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(72, 160, 120, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(150, 130, 200, 0.12)';
                }}
              >
                <div className="space-y-3">
                  <Sprout
                    className="w-8 h-8"
                    style={{ color: 'rgba(72, 160, 120, 0.6)' }}
                    strokeWidth={1.5}
                  />
                  <h3
                    className="font-sans text-[16px] font-semibold"
                    style={{ color: '#1a1228' }}
                  >
                    I&apos;m Building Something
                  </h3>
                  <p
                    className="font-sans text-[13px] font-light leading-relaxed"
                    style={{ color: 'rgba(80, 60, 120, 0.5)' }}
                  >
                    Submit your project to be considered for Bloom&apos;s curated discovery page
                  </p>
                </div>
              </button>
            </div>

            {/* Maybe later option */}
            <div className="text-center">
              <button
                onClick={onClose}
                className="font-sans text-[12px] font-light transition-colors"
                style={{ color: 'rgba(80, 60, 120, 0.4)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(80, 60, 120, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(80, 60, 120, 0.4)';
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* Builder Form Stage */}
        {stage === 'builder-form' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2
                className="font-sans text-[20px] font-semibold"
                style={{ color: '#1a1228' }}
              >
                Tell us about your project
              </h2>
              <p
                className="font-sans text-[13px] font-light"
                style={{ color: 'rgba(80, 60, 120, 0.5)' }}
              >
                We&apos;ll review and get back to you
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Project name */}
              <div>
                <label
                  htmlFor="projectName"
                  className="block font-sans text-[12px] font-medium mb-1.5"
                  style={{ color: 'rgba(60, 50, 80, 0.6)' }}
                >
                  Project name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  required
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  className="w-full px-4 py-3 font-sans text-[14px] rounded-xl border transition-all"
                  style={{
                    border: '1px solid rgba(150, 130, 200, 0.15)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(120, 90, 180, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 90, 180, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(150, 130, 200, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* One-line description */}
              <div>
                <label
                  htmlFor="description"
                  className="block font-sans text-[12px] font-medium mb-1.5"
                  style={{ color: 'rgba(60, 50, 80, 0.6)' }}
                >
                  One-line description *
                </label>
                <input
                  type="text"
                  id="description"
                  required
                  placeholder="What are you building?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 font-sans text-[14px] rounded-xl border transition-all placeholder:text-gray-400"
                  style={{
                    border: '1px solid rgba(150, 130, 200, 0.15)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(120, 90, 180, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 90, 180, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(150, 130, 200, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Project URL */}
              <div>
                <label
                  htmlFor="url"
                  className="block font-sans text-[12px] font-medium mb-1.5"
                  style={{ color: 'rgba(60, 50, 80, 0.6)' }}
                >
                  Project URL
                </label>
                <input
                  type="url"
                  id="url"
                  placeholder="Website, GitHub, or demo link"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 font-sans text-[14px] rounded-xl border transition-all placeholder:text-gray-400"
                  style={{
                    border: '1px solid rgba(150, 130, 200, 0.15)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(120, 90, 180, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 90, 180, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(150, 130, 200, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-[12px] font-medium mb-1.5"
                  style={{ color: 'rgba(60, 50, 80, 0.6)' }}
                >
                  Your email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="So we can reach you"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 font-sans text-[14px] rounded-xl border transition-all placeholder:text-gray-400"
                  style={{
                    border: '1px solid rgba(150, 130, 200, 0.15)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(120, 90, 180, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(120, 90, 180, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(150, 130, 200, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 font-sans text-[14px] font-medium text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(72, 160, 120, 0.85)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'rgba(72, 160, 120, 1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'rgba(72, 160, 120, 0.85)';
                  }
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </form>
          </div>
        )}

        {/* Success Stage */}
        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(72, 160, 120, 0.1)',
              }}
            >
              <Check
                className="w-8 h-8"
                style={{ color: 'rgba(72, 160, 120, 1)' }}
                strokeWidth={2.5}
              />
            </div>

            <div className="space-y-2">
              <h2
                className="font-sans text-[20px] font-semibold"
                style={{ color: '#1a1228' }}
              >
                Thanks for submitting!
              </h2>
              <p
                className="font-sans text-[14px] font-light max-w-[320px]"
                style={{ color: 'rgba(80, 60, 120, 0.5)' }}
              >
                We&apos;ll review your project and reach out soon. In the meantime, explore other
                projects!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

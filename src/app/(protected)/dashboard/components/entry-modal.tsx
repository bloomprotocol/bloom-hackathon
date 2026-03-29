'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Eye, Sprout, ArrowLeft, Check } from 'lucide-react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStage = 'path-selection' | 'builder-form' | 'success';

export default function EntryModal({ isOpen, onClose }: EntryModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<ModalStage>('path-selection');
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
      setStage('path-selection');
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

  // Handle supporter path
  const handleSupporterPath = () => {
    onClose();
    router.push('/discover');
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
      // TODO: Show error message to user
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
        className={`relative w-full max-w-[480px] mx-4 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          borderRadius: '20px',
          background: 'white',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-5 h-5 flex items-center justify-center transition-colors"
          style={{
            color: 'rgba(100, 80, 140, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(100, 80, 140, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(100, 80, 140, 0.3)';
          }}
          aria-label="Close modal"
        >
          <span className="text-2xl leading-none">×</span>
        </button>

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
                How would you like to enter?
              </h2>
              <p
                className="font-sans text-[14px] font-light"
                style={{ color: 'rgba(80, 60, 120, 0.5)' }}
              >
                Choose your path into Bloom
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
                    Explore early-stage projects, pledge your support, and earn your Supporter
                    Identity
                  </p>
                </div>
              </button>

              {/* Builder path */}
              <button
                onClick={() => setStage('builder-form')}
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
          </div>
        )}

        {/* Builder Form Stage */}
        {stage === 'builder-form' && (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStage('path-selection')}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'rgba(80, 60, 120, 0.5)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(80, 60, 120, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(80, 60, 120, 0.5)';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

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
                We&apos;ll review your project and reach out soon.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 font-sans text-[14px] font-medium rounded-full transition-all"
              style={{
                border: '1px solid rgba(150, 130, 200, 0.2)',
                color: 'rgba(100, 70, 160, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(140, 110, 200, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

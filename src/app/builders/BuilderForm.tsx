'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

type ActivePanel = null | 'discovery' | 'quests';

export default function BuilderForm() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    url: '',
    email: '',
    twitter: '',
    linkedin: '',
  });

  const router = useRouter();
  const { isAuthenticated, connectWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/builder-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        setFormData({ projectName: '', description: '', url: '', email: '', twitter: '', linkedin: '' });
        setShowSuccess(false);
        setActivePanel(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting builder form:', error);
      setIsSubmitting(false);
      alert('Failed to submit. Please try again.');
    }
  };

  const handleLaunchQuests = () => {
    if (isAuthenticated) {
      router.push('/builder');
    } else {
      // After login completes, redirect to builder dashboard
      sessionStorage.setItem('redirectAfterAuth', '/builder');
      connectWithEmail();
    }
  };

  // Success state after form submission
  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-green-50">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
              Thanks for submitting!
            </h2>
            <p className="text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
              We&apos;ll review your project and reach out soon. In the meantime, explore other projects!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 desktop:py-16 px-4">
      {/* Header */}
      <div className="text-center mb-8 desktop:mb-12 space-y-4">
        <h1
          className="text-3xl desktop:text-5xl font-normal text-gray-900 tracking-tight"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Builder Portal
        </h1>
        <p
          className="text-lg desktop:text-xl text-gray-600 max-w-xl mx-auto"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Find your first 100 true supporters and validate your go-to-market
        </p>
      </div>

      {/* Value Props */}
      <div className="mb-10 desktop:mb-12 grid grid-cols-1 desktop:grid-cols-3 gap-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Early Growth
          </h3>
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Connect with supporters who believe in your vision
          </p>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Market Validation
          </h3>
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Validate go-to-market and collect PMF signals
          </p>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Turn Support into Capital
          </h3>
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Build credibility and momentum for fundraising
          </p>
        </div>
      </div>

      {/* Two-Path Cards */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6 mb-10">
        {/* Path 1: Get Listed on Discovery */}
        <button
          onClick={() => setActivePanel(activePanel === 'discovery' ? null : 'discovery')}
          className={`text-left p-6 rounded-2xl border-2 transition-all ${
            activePanel === 'discovery'
              ? 'border-[#8478e0] bg-[#8478e0]/5 shadow-lg'
              : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-[#8478e0]/40 hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#393f49] mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                Get Listed on Discovery
              </h3>
              <p className="text-sm text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Submit your project for our curated Discovery page. Our team reviews every submission.
              </p>
              <span
                className="inline-block mt-3 text-xs font-medium text-[#8478e0]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                No login required
              </span>
            </div>
          </div>
        </button>

        {/* Path 2: Launch X Quests */}
        <button
          onClick={handleLaunchQuests}
          className="text-left p-6 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-[#1DA1F2]/40 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#393f49] mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                Launch X Quests
              </h3>
              <p className="text-sm text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Create social missions on X to grow your community and reward participants.
              </p>
              <span
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#1DA1F2]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isAuthenticated ? 'Go to Builder Dashboard' : 'Connect wallet to start'}
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Discovery Submission Form (expandable) */}
      {activePanel === 'discovery' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 desktop:p-8 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <h2
            className="text-xl desktop:text-2xl font-semibold text-gray-900 mb-6"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Submit Your Project
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Project name *
              </label>
              <input
                type="text"
                id="projectName"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                One-line description *
              </label>
              <input
                type="text"
                id="description"
                required
                placeholder="What are you building?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-gray-400"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Project URL *
              </label>
              <input
                type="url"
                id="url"
                required
                placeholder="Website, GitHub, or demo link"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-gray-400"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Your email *
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="So we can reach you"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-gray-400"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <div className="border-t border-gray-200 pt-5">
              <p className="text-sm font-medium text-gray-700 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Social Links (Optional)
              </p>

              <div className="mb-4">
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Twitter / X
                </label>
                <input
                  type="url"
                  id="twitter"
                  placeholder="https://x.com/yourhandle"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-gray-400"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-gray-400"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-base rounded-full shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

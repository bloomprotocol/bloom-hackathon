'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AuthModal from '@/components/ui/AuthModal';

interface LoginContentProps {
  returnUrl?: string;
}

type LoginMethod = 'email' | 'wallet' | null;

export default function LoginContent({ returnUrl }: LoginContentProps) {
  const router = useRouter();
  const { isAuthenticated, connectWithEmail } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<LoginMethod>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = returnUrl || '/dashboard';
      router.push(destination);
    }
  }, [isAuthenticated, returnUrl, router]);

  // Handle email login
  const handleEmailLogin = () => {
    setSelectedMethod('email');
    connectWithEmail();
  };

  // Handle wallet login
  const handleWalletLogin = () => {
    setSelectedMethod('wallet');
    setIsAuthModalOpen(true);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Logged In</h1>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <img
              src="https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg"
              alt="Bloom Protocol"
              className="mx-auto h-12 w-auto"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to Bloom Protocol
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose your preferred login method
            </p>
          </div>

          {/* Login Options */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
            {/* Email Login */}
            <button
              onClick={handleEmailLogin}
              className="w-full flex items-center justify-between px-6 py-4 border-2 rounded-xl transition-all duration-200 border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Email Login</h3>
                  <p className="text-sm text-gray-500">Continue with email or Google</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Wallet Login */}
            <button
              onClick={handleWalletLogin}
              className="w-full flex items-center justify-between px-6 py-4 border-2 border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Wallet Connect</h3>
                  <p className="text-sm text-gray-500">Connect with your crypto wallet</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={handleEmailLogin}
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign up with email
              </button>
            </p>
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setSelectedMethod(null);
        }}
      />
    </>
  );
}

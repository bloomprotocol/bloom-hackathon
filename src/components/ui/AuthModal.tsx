'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { TurnstileWidget, useTurnstile, isTurnstileConfigured } from '@/lib/integration/turnstile';
import { BaseModal } from '@/components/ui';
import { useWalletDetection, type DetectedWallet, type NetworkType } from '@/hooks/useWalletDetection';
import { getPlatform } from '@/lib/utils/platform';
import { verifyTurnstileToken } from '@/lib/api/services/turnstileService';
import SolanaWalletConnector from '@/components/auth/SolanaWalletConnector';
import { logger } from '@/lib/utils/logger';
import OTPInput from '@/components/auth/OTPInput';
import { useRouter } from 'next/navigation';

type ModalView = 'verification' | 'authSelection' | 'emailInput' | 'otpVerification' | 'walletSelection' | 'networkSelection' | 'mobileWalletFlow' | 'solanaWalletStandard';
type MobileWalletStage = 'connecting' | 'sign_prompt' | 'verifying' | 'success' | 'error';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: ModalView;
}

export default function AuthModal({
    isOpen,
    onClose,
    initialView = 'verification'
}: AuthModalProps) {
    const {
        connectWithWallet,
        connectWithEmail,
        loginWithWallet,
        isAuthenticated,
        triggerMobileSign,
        phantomHookState,
        okxHookState,
        metamaskHookState,
        walletConnectHookState
    } = useAuth();
    const [currentView, setCurrentView] = useState<ModalView>(initialView);

    // Wallet detection with network support info
    const { isReady, detectedWallets } = useWalletDetection();

    // Selected wallet for network selection
    const [selectedWallet, setSelectedWallet] = useState<DetectedWallet | null>(null);

    const {
        token: turnstileToken,
        isVerified,
        handleSuccess: handleTurnstileSuccess,
        handleError: handleTurnstileError,
        handleExpire: handleTurnstileExpire,
        reset: resetTurnstile,
    } = useTurnstile();

    // Track verification status for UI control
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

    // Track when user clicks Sign button (to show verifying UI immediately)
    const [isSigningTriggered, setIsSigningTriggered] = useState(false);

    // Email OTP state
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
    const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);

    // Get mobile wallet connecting state from sessionStorage
    const connectingWallet = typeof window !== 'undefined'
        ? sessionStorage.getItem('mobile_wallet_connecting') as 'phantom' | 'okx' | 'metamask' | 'walletconnect' | null
        : null;

    // Calculate mobile wallet stage based on hook states
    // Note: WalletConnect does NOT use this flow - it uses AppKit modal and auto-sign
    const mobileWalletStage = useMemo((): MobileWalletStage | null => {
        if (!connectingWallet) return null;

        // WalletConnect should never enter mobileWalletFlow
        // It uses its own AppKit modal and auto-sign flow
        if (connectingWallet === 'walletconnect') return null;

        const hookState = connectingWallet === 'phantom'
            ? phantomHookState
            : connectingWallet === 'okx'
                ? okxHookState
                : metamaskHookState;

        // Show success when authenticated
        if (isAuthenticated) return 'success';
        if (hookState?.error) return 'error';
        if (hookState?.lastSignature) return 'verifying';  // Has signature, waiting for backend
        // Show verifying immediately when user clicks Sign button
        if (isSigningTriggered) return 'verifying';
        if (hookState?.publicKey) return 'sign_prompt';     // Connected, waiting for sign
        if (hookState?.isConnecting) return 'connecting';

        return 'connecting';  // Default when redirecting to wallet app
    }, [connectingWallet, phantomHookState, okxHookState, metamaskHookState, isSigningTriggered, isAuthenticated]);

    // Handle Sign button click
    const handleMobileSign = () => {
        if (connectingWallet) {
            setIsSigningTriggered(true);  // Show verifying UI immediately
            triggerMobileSign(connectingWallet);
        }
    };

    // Reset modal state
    const resetModal = () => {
        setCurrentView('verification');
        setVerificationStatus('pending');
        setIsSigningTriggered(false);
        setSelectedWallet(null);
        resetTurnstile();
    };

    // Handle modal close
    const handleClose = () => {
        onClose();
        // Delay reset to avoid content change during close animation
        setTimeout(resetModal, 300);
    };

    // When modal opens, check if we're in mobile wallet flow
    useEffect(() => {
        if (isOpen) {
            // Check if returning from mobile wallet
            if (connectingWallet && mobileWalletStage) {
                setCurrentView('mobileWalletFlow');
                setVerificationStatus('success');  // Skip verification since user already started flow
            } else {
                setCurrentView(initialView);
            }
        }
    }, [isOpen, initialView, connectingWallet, mobileWalletStage]);

    // Show success state then close modal when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated && isOpen) {
            // If in mobile wallet flow, show success stage first
            if (currentView === 'mobileWalletFlow') {
                setIsSigningTriggered(false);  // Clear signing state to show success
                // Wait 800ms to show success UI before closing
                setTimeout(() => {
                    handleClose();
                }, 800);
            } else {
                handleClose();
            }
        }
    }, [isAuthenticated, isOpen, currentView]);

    // Handle verification success
    const handleVerificationSuccess = async (token: string) => {
        handleTurnstileSuccess(token);

        // Call backend to verify the token
        try {
            const result = await verifyTurnstileToken(token);

            if (result.verified) {
                setVerificationStatus('success');
            } else {
                setVerificationStatus('failed');
                logger.error('Turnstile verification failed', { error: result.error });
            }
        } catch (error) {
            logger.error('Failed to verify Turnstile token', { error });
            setVerificationStatus('failed');
        }

        // Always move to auth selection view after backend verification
        setTimeout(() => {
            setCurrentView('authSelection');
        }, 500);
    };

    // Handle verification error
    const handleVerificationError = () => {
        handleTurnstileError('Verification failed');
        setVerificationStatus('failed');
        // Move to auth selection view with failed status
        setTimeout(() => {
            setCurrentView('authSelection');
        }, 500);
    };

    // Handle email submission (send OTP)
    const handleEmailSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Validation
        if (!email || !email.includes('@')) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setIsEmailSubmitting(true);
        setEmailError('');

        try {
            const response = await fetch('/api/auth/email/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type: 'login' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send code');
            }

            // Success - move to OTP view
            setOtpExpiresAt(Date.now() + (data.data.expiresIn * 1000));
            setCurrentView('otpVerification');

        } catch (error) {
            setEmailError(error instanceof Error ? error.message : 'Failed to send code. Please try again.');
        } finally {
            setIsEmailSubmitting(false);
        }
    };

    // Handle OTP verification
    const handleOtpComplete = async (code: string) => {
        setOtpCode(code);
        setIsOtpSubmitting(true);
        setOtpError('');

        try {
            const response = await fetch('/api/auth/email/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid code');
            }

            // Success! Close modal and redirect to dashboard
            logger.info('[Email OTP] Authentication successful', { email });
            handleClose();

            // Redirect to dashboard with hard reload to ensure AuthContext re-initialization
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 300);

        } catch (error) {
            setOtpError(error instanceof Error ? error.message : 'Invalid code. Please try again.');
            setOtpCode('');
            setIsOtpSubmitting(false);
        }
    };

    // Handle resend OTP
    const handleResendOtp = async () => {
        setOtpError('');
        await handleEmailSubmit();
    };

    // Handle retry verification
    const handleRetryVerification = () => {
        setVerificationStatus('pending');
        resetTurnstile();
        setCurrentView('verification');
    };

    // Handle wallet click - check if network selection is needed
    const handleWalletClick = async (wallet: DetectedWallet) => {
        if (verificationStatus !== 'success') return;

        if (wallet.supportedNetworks === 'both') {
            // Show network selection for multi-network wallets
            setSelectedWallet(wallet);
            setCurrentView('networkSelection');
        } else {
            // Direct connect for single-network wallets (Solana-only or EVM-only)
            const platform = getPlatform();
            const network: NetworkType = wallet.supportedNetworks === 'solana' ? 'solana' : 'evm';
            const evmProvider = network === 'evm' ? wallet.evmProvider : undefined;
            const solanaProvider = network === 'solana' ? wallet.solanaProvider : undefined;

            if (platform.isMobile) {
                // Mobile: Don't close modal, wallet will redirect
                await connectWithWallet(wallet.name, network, evmProvider, solanaProvider);
            } else {
                // Desktop: Close modal and connect
                handleClose();
                setTimeout(async () => {
                    await connectWithWallet(wallet.name, network, evmProvider, solanaProvider);
                }, 100);
            }
        }
    };

    // Wallets that use Wallet Standard for Solana (not traditional window.xxx.solana injection)
    const walletStandardSolanaWallets = ['MetaMask', 'Binance Wallet'];

    // Handle network selection
    const handleNetworkSelect = async (network: NetworkType) => {
        if (!selectedWallet) return;

        const platform = getPlatform();

        // Store the selected network in session for AuthContext to use
        sessionStorage.setItem('selected_network', network);

        // Check if this wallet uses Wallet Standard for Solana
        const usesWalletStandard = walletStandardSolanaWallets.includes(selectedWallet.name);

        if (network === 'solana' && usesWalletStandard && !platform.isMobile) {
            // Use SolanaWalletConnector for Wallet Standard wallets on desktop
            setCurrentView('solanaWalletStandard');
            return;
        }

        // Get the provider from the detected wallet
        const evmProvider = network === 'evm' ? selectedWallet.evmProvider : undefined;
        const solanaProvider = network === 'solana' ? selectedWallet.solanaProvider : undefined;

        if (platform.isMobile) {
            // For WalletConnect or wallets using WalletConnect on mobile: close modal so AppKit modal can show
            if (selectedWallet.name === 'WalletConnect' || selectedWallet.useWalletConnect) {
                handleClose();
                // Small delay to ensure modal is closed before AppKit opens
                setTimeout(async () => {
                    // Use 'WalletConnect' as the wallet name to trigger WalletConnect flow
                    // Pass walletId for direct connection without showing wallet selection modal
                    await connectWithWallet('WalletConnect', network, evmProvider, solanaProvider, selectedWallet.walletId);
                }, 100);
            } else {
                // Other mobile wallets: Don't close modal (they use deep links)
                await connectWithWallet(selectedWallet.name, network, evmProvider, solanaProvider);
            }
        } else {
            // Desktop: Close modal and connect
            handleClose();
            setTimeout(async () => {
                await connectWithWallet(selectedWallet.name, network, evmProvider, solanaProvider);
            }, 100);
        }
    };

    // Get caption based on current view
    const getCaption = () => {
        const text = (() => {
            switch (currentView) {
                case 'verification':
                    return "Verify you're human";
                case 'authSelection':
                    return "Welcome to Bloom Protocol";
                case 'emailInput':
                    return "Continue with Email";
                case 'otpVerification':
                    return "Enter Verification Code";
                case 'walletSelection':
                    return "Select wallet";
                case 'networkSelection':
                    return "Select network";
                case 'solanaWalletStandard':
                    return "Connect Solana Wallet";
                case 'mobileWalletFlow':
                    if (mobileWalletStage === 'connecting') return "Connecting...";
                    if (mobileWalletStage === 'sign_prompt') return "Verify ownership";
                    if (mobileWalletStage === 'verifying') return "Verifying...";
                    if (mobileWalletStage === 'success') return "Success!";
                    if (mobileWalletStage === 'error') return "Connection failed";
                    return "Connecting wallet";
                default:
                    return "";
            }
        })();

        return text ? (
            <span className="font-['Times'] font-bold text-[20px] text-[#393F49]">
                {text}
            </span>
        ) : null;
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            logo={{
                src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
                alt: "Bloom Protocol",
                width: 34.62,
                height: 34
            }}
            caption={getCaption()}
        >
            {/* Verification View */}
            {currentView === 'verification' && (
                <>
                    {/* Verification Container - Fixed height container */}
                    <div className="relative mx-0 my-[30px] h-[65px]">
                        {/* Turnstile Widget */}
                        <div className="font-['Outfit'] absolute inset-0 flex">
                            {isTurnstileConfigured() && process.env.NODE_ENV === 'production' ? (
                                <TurnstileWidget
                                    onSuccess={handleVerificationSuccess}
                                    onError={handleVerificationError}
                                    onExpire={handleVerificationError}
                                    theme="light"
                                    size="normal"
                                />
                            ) : (
                                // Dev mode fallback - skip Turnstile in development
                                <div>
                                    <p className="text-gray-600 mb-4 font-['Outfit']">
                                        {process.env.NODE_ENV === 'development'
                                            ? 'Development Mode - Verification Skipped'
                                            : 'Turnstile not configured'}
                                    </p>
                                    <button
                                        onClick={async () => {
                                            // In dev mode, set success directly
                                            setVerificationStatus('success');
                                            setTimeout(() => {
                                                setCurrentView('authSelection');
                                            }, 500);
                                        }}
                                        className="font-['Outfit'] px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Continue to Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Authentication Selection View */}
            {currentView === 'authSelection' && (
                <div className="px-6 py-8">
                    {/* Primary Login Options */}
                    <div className="space-y-3 mb-4">
                        {/* Email Login (Custom OTP - No Privy Cost) */}
                        <button
                            onClick={() => {
                                if (verificationStatus !== 'success') return;
                                setCurrentView('emailInput');
                            }}
                            disabled={verificationStatus !== 'success'}
                            className={`w-full px-4 py-3 rounded-lg transition-all duration-200 font-semibold font-['Outfit'] ${verificationStatus === 'success'
                                ? 'bg-white text-black hover:bg-[#90d446] mobile:active:bg-[#90d446] cursor-pointer border-2 border-gray-200 hover:border-[#90d446]'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                            }`}
                        >
                            Login with Email
                        </button>

                        {/* Google/Email Login via Thirdweb Connect */}
                        <button
                            onClick={async () => {
                                if (verificationStatus !== 'success') return;
                                handleClose();
                                setTimeout(async () => {
                                    try {
                                        await connectWithEmail();
                                    } catch (error) {
                                        logger.error('[Auth] Google login error', { error });
                                    }
                                }, 100);
                            }}
                            disabled={verificationStatus !== 'success'}
                            className={`w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium font-['Outfit'] flex items-center justify-center gap-2 ${verificationStatus === 'success'
                                ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                            }`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Sign Up Link for New Users */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600 font-['Outfit']">
                            New to Bloom?{' '}
                            <button
                                onClick={() => {
                                    if (verificationStatus !== 'success') return;
                                    setCurrentView('emailInput');
                                }}
                                disabled={verificationStatus !== 'success'}
                                className={`font-semibold ${verificationStatus === 'success'
                                    ? 'text-purple-600 hover:text-purple-700 cursor-pointer'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Create Account →
                            </button>
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-['Outfit']">or</span>
                        </div>
                    </div>

                    {/* Connect Wallet Button - Same level as email/Google */}
                    <button
                        onClick={() => {
                            if (verificationStatus !== 'success') return;
                            setCurrentView('walletSelection');
                        }}
                        disabled={verificationStatus !== 'success'}
                        className={`w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium font-['Outfit'] flex items-center justify-center gap-2 ${verificationStatus === 'success'
                            ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Connect Wallet
                    </button>

                    {/* Retry button when verification failed */}
                    {verificationStatus === 'failed' && (
                        <button
                            onClick={handleRetryVerification}
                            className="w-full mt-4 px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-semibold font-['Outfit']"
                        >
                            Retry human verification
                        </button>
                    )}

                    {/* Help text */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 font-['Outfit']">
                            By connecting, you agree to our Terms of Service
                        </p>
                    </div>
                </div>
            )}

            {/* Email Input View */}
            {currentView === 'emailInput' && (
                <div className="px-6 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => setCurrentView('authSelection')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Outfit']"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-['Outfit']">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError('');
                                }}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-['Outfit']"
                                disabled={isEmailSubmitting}
                                required
                                autoFocus
                            />
                        </div>

                        {emailError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800 font-['Outfit']">{emailError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isEmailSubmitting || !email}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-['Outfit']"
                        >
                            {isEmailSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending Code...
                                </span>
                            ) : (
                                'Send Verification Code'
                            )}
                        </button>
                    </form>

                    {/* Help text */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 font-['Outfit']">
                            We'll send you a 6-digit code to verify your email
                        </p>
                    </div>
                </div>
            )}

            {/* OTP Verification View */}
            {currentView === 'otpVerification' && (
                <div className="px-6 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setCurrentView('emailInput');
                            setOtpCode('');
                            setOtpError('');
                        }}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Outfit']"
                        disabled={isOtpSubmitting}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <div className="space-y-6">
                        {/* Email display */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 font-['Outfit']">
                                We sent a code to
                            </p>
                            <p className="text-base font-semibold text-gray-900 font-['Outfit']">
                                {email}
                            </p>
                        </div>

                        {/* OTP Input */}
                        <div>
                            <OTPInput
                                length={6}
                                onComplete={handleOtpComplete}
                                disabled={isOtpSubmitting}
                                error={!!otpError}
                                autoFocus
                            />
                        </div>

                        {otpError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800 text-center font-['Outfit']">{otpError}</p>
                            </div>
                        )}

                        {isOtpSubmitting && (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-purple-600">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-['Outfit'] font-medium">Verifying...</span>
                                </div>
                            </div>
                        )}

                        {/* Resend code */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 font-['Outfit']">
                                Didn't receive the code?{' '}
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isEmailSubmitting}
                                    className="font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Resend
                                </button>
                            </p>
                        </div>

                        {/* Expiry info */}
                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-['Outfit']">
                                Code expires in 10 minutes
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Wallet Selection View */}
            {currentView === 'walletSelection' && (
                <div className="px-6 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setCurrentView('authSelection');
                        }}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Outfit']"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {(() => {
                        const platform = getPlatform();

                        if (platform.isMobile) {
                            // Mobile wallet options - show fixed list
                            return (
                                <div className="space-y-3">
                                    {/* Phantom App - Solana only */}
                                    <button
                                        onClick={() => handleWalletClick({
                                            name: 'Phantom',
                                            supportedNetworks: 'solana',
                                            icon: 'https://statics.bloomprotocol.ai/icon/wallet-phantom.png'
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 cursor-pointer transition-all duration-200 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://statics.bloomprotocol.ai/icon/wallet-phantom.png"
                                                alt="Phantom"
                                                className="w-6 h-6"
                                            />
                                            <span className="font-['Outfit'] font-medium text-gray-700">Phantom</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-['Outfit']">Solana</span>
                                    </button>

                                    {/* OKX App - Both EVM and Solana */}
                                    <button
                                        onClick={() => handleWalletClick({
                                            name: 'OKX Wallet',
                                            supportedNetworks: 'both',
                                            icon: 'https://statics.bloomprotocol.ai/icon/wallet-okx.png'
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 cursor-pointer transition-all duration-200 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://statics.bloomprotocol.ai/icon/wallet-okx.png"
                                                alt="OKX Wallet"
                                                className="w-6 h-6"
                                            />
                                            <span className="font-['Outfit'] font-medium text-gray-700">OKX Wallet</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-['Outfit']">EVM & Solana</span>
                                    </button>

                                    {/* MetaMask App - EVM only */}
                                    <button
                                        onClick={() => handleWalletClick({
                                            name: 'MetaMask',
                                            supportedNetworks: 'evm',
                                            icon: 'https://statics.bloomprotocol.ai/icon/wallet/metamask_wallet.svg'
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 cursor-pointer transition-all duration-200 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://statics.bloomprotocol.ai/icon/wallet/metamask_wallet.svg"
                                                alt="MetaMask"
                                                className="w-6 h-6"
                                            />
                                            <span className="font-['Outfit'] font-medium text-gray-700">MetaMask</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-['Outfit']">EVM</span>
                                    </button>

                                    {/* WalletConnect - Both networks */}
                                    <button
                                        onClick={() => handleWalletClick({
                                            name: 'WalletConnect',
                                            supportedNetworks: 'both',
                                            icon: 'https://statics.bloomprotocol.ai/icon/wallet/walletconnect.svg'
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 cursor-pointer transition-all duration-200 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://statics.bloomprotocol.ai/icon/wallet/walletconnect.svg"
                                                alt="WalletConnect"
                                                className="w-6 h-6"
                                            />
                                            <span className="font-['Outfit'] font-medium text-gray-700">WalletConnect</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-['Outfit']">EVM & Solana</span>
                                    </button>
                                </div>
                            );
                        } else {
                            // Desktop wallet options - show detected wallets
                            return (
                                <>
                                    {!isReady ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                                            <p className="font-['Outfit'] mt-2 text-sm text-gray-600">Detecting wallets...</p>
                                        </div>
                                    ) : detectedWallets.length > 0 ? (
                                        <div className="space-y-3">
                                            {detectedWallets.map((wallet) => (
                                                <button
                                                    key={wallet.name}
                                                    onClick={() => handleWalletClick(wallet)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 cursor-pointer transition-all duration-200 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 flex-shrink-0">
                                                            {wallet.icon && (
                                                                <img
                                                                    src={wallet.icon}
                                                                    alt={wallet.name}
                                                                    className="w-6 h-6"
                                                                />
                                                            )}
                                                        </div>
                                                        <span className="font-['Outfit'] font-medium text-gray-700 text-left">{wallet.name}</span>
                                                    </div>
                                                    {wallet.supportedNetworks === 'both' ? (
                                                        <span className="text-xs text-gray-400 font-['Outfit']">
                                                            EVM & Solana
                                                        </span>
                                                    ) : wallet.supportedNetworks === 'solana' && (
                                                        <span className="text-xs text-gray-400 font-['Outfit']">
                                                            Solana
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="font-['Outfit'] text-center py-4">
                                            <p className="text-sm text-gray-600">No wallets detected</p>
                                            <p className="text-xs text-gray-500 mt-1">Please install a wallet extension (MetaMask, Phantom, etc.)</p>
                                        </div>
                                    )}
                                </>
                            );
                        }
                    })()}
                </div>
            )}

            {/* Network Selection View */}
            {currentView === 'networkSelection' && selectedWallet && (
                <div className="px-6 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setSelectedWallet(null);
                            setCurrentView('walletSelection');
                        }}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Outfit']"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Wallet info */}
                    <div className="flex items-center gap-3 mb-6">
                        {selectedWallet.icon && (
                            <img
                                src={selectedWallet.icon}
                                alt={selectedWallet.name}
                                className="w-10 h-10"
                            />
                        )}
                        <div>
                            <p className="font-['Outfit'] font-semibold text-gray-800">{selectedWallet.name}</p>
                            <p className="font-['Outfit'] text-sm text-gray-500">Select a network to continue</p>
                        </div>
                    </div>

                    {/* Network options */}
                    <div className="space-y-3">
                        {/* Solana option */}
                        <button
                            onClick={() => handleNetworkSelect('solana')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center gap-3"
                        >
                            <div className="w-6 h-6 flex-shrink-0">
                                <img
                                    src="https://statics.bloomprotocol.ai/icon/SOLANA.png"
                                    alt="Solana"
                                    className="w-6 h-6"
                                />
                            </div>
                            <span className="font-['Outfit'] font-medium text-gray-700 text-left">Solana</span>
                        </button>

                        {/* EVM option */}
                        <button
                            onClick={() => handleNetworkSelect('evm')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center gap-3"
                        >
                            <div className="w-6 h-6 flex-shrink-0">
                                <img
                                    src="https://statics.bloomprotocol.ai/icon/wallet/evm_compatible.jpg"
                                    alt="EVM"
                                    className="w-6 h-6"
                                />
                            </div>
                            <span className="font-['Outfit'] font-medium text-gray-700 text-left">EVM Compatibles</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Solana Wallet Standard View (for MetaMask, Binance, etc.) */}
            {currentView === 'solanaWalletStandard' && selectedWallet && (
                <div className="px-6 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setCurrentView('networkSelection');
                        }}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Outfit']"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Wallet info */}
                    <div className="flex items-center gap-3 mb-6">
                        {selectedWallet.icon && (
                            <img
                                src={selectedWallet.icon}
                                alt={selectedWallet.name}
                                className="w-10 h-10"
                            />
                        )}
                        <div>
                            <p className="font-['Outfit'] font-semibold text-gray-800">{selectedWallet.name}</p>
                            <p className="font-['Outfit'] text-sm text-gray-500">Solana Network</p>
                        </div>
                    </div>

                    {/* Solana Wallet Connector */}
                    <SolanaWalletConnector
                        walletName={selectedWallet.name}
                        onSuccess={async (address, signature, message) => {
                            try {
                                await loginWithWallet(address, undefined, signature, message, 'solana');
                                handleClose();
                            } catch (error) {
                                logger.error('[AuthModal] Solana login failed', { error });
                            }
                        }}
                        onError={(error) => {
                            logger.error('[AuthModal] Solana connection error', { error });
                        }}
                        onCancel={() => {
                            setCurrentView('networkSelection');
                        }}
                    />
                </div>
            )}

            {/* Mobile Wallet Flow View */}
            {currentView === 'mobileWalletFlow' && (
                <div className="px-6 py-8">
                    {mobileWalletStage === 'connecting' && (
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
                            <p className="font-['Outfit'] text-gray-700">
                                Connecting to {connectingWallet === 'phantom' ? 'Phantom' : connectingWallet === 'okx' ? 'OKX Wallet' : connectingWallet === 'walletconnect' ? 'WalletConnect' : 'MetaMask'}...
                            </p>
                            <p className="font-['Outfit'] text-sm text-gray-500 mt-2">
                                Please confirm in your wallet app
                            </p>
                        </div>
                    )}

                    {mobileWalletStage === 'sign_prompt' && (
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-['Outfit'] text-gray-700 mb-2">
                                Wallet connected!
                            </p>
                            <p className="font-['Outfit'] text-sm text-gray-500 mb-6">
                                Please sign a message to verify you own this wallet
                            </p>
                            <button
                                onClick={handleMobileSign}
                                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold font-['Outfit']"
                            >
                                Sign Message
                            </button>
                        </div>
                    )}

                    {mobileWalletStage === 'verifying' && (
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
                            <p className="font-['Outfit'] text-gray-700">
                                Verifying signature...
                            </p>
                            <p className="font-['Outfit'] text-sm text-gray-500 mt-2">
                                Please wait while we verify your wallet
                            </p>
                        </div>
                    )}

                    {mobileWalletStage === 'success' && (
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-['Outfit'] text-gray-700">
                                Wallet connected successfully!
                            </p>
                        </div>
                    )}

                    {mobileWalletStage === 'error' && (
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-['Outfit'] text-gray-700 mb-2">
                                Connection failed
                            </p>
                            <p className="font-['Outfit'] text-sm text-gray-500 mb-6">
                                {(connectingWallet === 'phantom' ? phantomHookState?.error : connectingWallet === 'okx' ? okxHookState?.error : connectingWallet === 'walletconnect' ? walletConnectHookState?.error : metamaskHookState?.error) || 'Please try again'}
                            </p>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('mobile_wallet_connecting');
                                    setCurrentView('authSelection');
                                }}
                                className="w-full px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-semibold font-['Outfit']"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            )}
        </BaseModal>
    );
}

'use client'
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import styles from './mainpage.module.css';
import randomWelcomeMessage from '@/lib/utils/welcomeMessages';
// 移除舊的 useMenu 依賴 - MainPage 不應該控制 Menu 顯示

import { mainpageContent } from './content.config';

// Lazy load heavy components
const JourneyTimeline = lazy(() => import('./developer/journeyTimeline'));
const RPG = lazy(() => import('./user/rpg'));

interface MainPageContentProps {
    onSelection?: (option: number, isDeveloper: boolean, optionText: string) => void;
}

// Transition content component
const TransitionContent = React.memo(({ 
    showFramingText, 
    userType, 
    selectedOption,
    selectedOptionText 
}: { 
    showFramingText: boolean;
    userType: UserType;
    selectedOption: number;
    selectedOptionText: string;
}) => {
    const getCommandText = () => {
        if (userType === 'developer') {
            return selectedOption === 1 
                ? mainpageContent.terminalTransition.commands.developer.option1
                : mainpageContent.terminalTransition.commands.developer.option2;
        } else {
            return selectedOption === 1 
                ? mainpageContent.terminalTransition.commands.user.option1
                : mainpageContent.terminalTransition.commands.user.option2;
        }
    };

    const getOutputText = () => {
        if (userType === 'developer') {
            if (selectedOption === 1) {
                return mainpageContent.terminalTransition.output.developer.option1;
            } else {
                return mainpageContent.terminalTransition.output.developer.option2;
            }
        } else {
            if (selectedOption === 1) {
                return mainpageContent.terminalTransition.output.user.option1;
            } else {
                return mainpageContent.terminalTransition.output.user.option2;
            }
        }
    };

    return (
        <>
            {/* Framing text */}
            <div className={`text-center mb-8 h-[35vh] content-center ${styles.framingText} ${showFramingText ? styles.framingTextVisible : styles.framingTextHidden}`}>
                {userType === 'developer' ? (
                    <>
                        <h1 className="text-[40px] font-bold text-white mb-3">
                            {mainpageContent.terminalTransition.framingText.developer.title}
                        </h1>
                        <p className="text-[25px] text-[#bfdbfe]">
                            {mainpageContent.terminalTransition.framingText.developer.subtitle}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-[32px] font-bold text-white mb-3">
                            {mainpageContent.terminalTransition.framingText.user.title}
                        </h1>
                        <p className="text-[20px] text-[#FFB3E6]">
                            {mainpageContent.terminalTransition.framingText.user.subtitle}
                        </p>
                    </>
                )}
            </div>
            
            {/* Terminal with transition content */}
            <div className={`${styles["terminal"]} font-mono`}>
                <div className={`${styles["terminal-header"]} justify-between`}>
                    <div className={styles["terminal-dots"]}>
                        <div className={styles["terminal-dot-red"]}></div>
                        <div className={styles["terminal-dot-yellow"]}></div>
                        <div className={styles["terminal-dot-green"]}></div>
                    </div>
                    <div className={styles["toggleContainer"]}>
                        <span className={`${styles["toggleText"]} ${userType === 'developer' ? styles["toggleTextDeveloper"] : styles["toggleTextUser"]}`}>
                            {userType === 'developer' ? mainpageContent.terminalTransition.toggleText.developer : mainpageContent.terminalTransition.toggleText.user}
                        </span>
                        <button className={`px-0 ${styles["toggleButton"]} ${userType === 'developer' ? styles["toggleButtonDeveloper"] : styles["toggleButtonUser"]}`} disabled>
                            <span className={`${styles["toggleSwitch"]}`} />
                        </button>
                    </div>
                </div>
                <div className={styles["terminal-content"]}>
                    <div className={`${styles["terminal-line"]} ${styles.transitionLine1}`}>
                        <span className={styles["prompt"]}>{getCommandText().split(' ')[0]}</span> {getCommandText().substring(2)}
                    </div>
                    {getOutputText().map((line, index) => (
                        <div key={index} className={`${styles["terminal-line"]} ${styles[`transitionLine${index + 2}`]}`}>
                            <span style={{ color: userType === 'developer' ? '#93c5fd' : '#FF8CCC' }}>
                                {line}
                            </span>
                        </div>
                    ))}
                    <div className={`${styles["input-line"]} ${styles[`transitionLine${getOutputText().length + 2}`]}`}>
                        <span className={styles["input-prompt"]}>&gt;</span>
                        <div className={styles["cursor"]}></div>
                    </div>
                </div>
            </div>
        </>
    );
});

TransitionContent.displayName = 'TransitionContent';

const MainPageContent = React.memo(({ onSelection }: MainPageContentProps) => {
    useEffect(() => {
        // console.log(mainpageContent.mainPage.welcomeLog.prefix + randomWelcomeMessage.message, `font-size: ${mainpageContent.mainPage.welcomeLog.fontSize};`);
        
    }, []);

    const [isDeveloperMode, setIsDeveloperMode] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [textVisible, setTextVisible] = useState(true);
    const [displayDeveloperText, setDisplayDeveloperText] = useState(true);

    useEffect(() => {
        setDisplayDeveloperText(isDeveloperMode);
    }, [isDeveloperMode]);

    const handleToggleClick = useCallback(() => {
        if (isAnimating) return;

        setIsAnimating(true);
        setTextVisible(false);

        // First fade out the text
        setTimeout(() => {
            // Then switch the mode
            setIsDeveloperMode(!isDeveloperMode);
            // And fade the new text in
            setTextVisible(true);
            setIsAnimating(false);
        }, 200); // Same speed as the toggle animation
    }, [isAnimating, isDeveloperMode]);

    // Handle terminal option click
    const handleOptionClick = useCallback((optionNumber: number) => {
        if (onSelection) {
            // 获取选项文本
            let optionText = '';
            if (isDeveloperMode) {
                optionText = optionNumber === 1 
                    ? mainpageContent.mainPage.terminal.options.developer.option1.replace('[1] ', '')
                    : mainpageContent.mainPage.terminal.options.developer.option2.replace('[2] ', '');
            } else {
                optionText = optionNumber === 1 
                    ? mainpageContent.mainPage.terminal.options.user.option1.replace('[1] ', '')
                    : mainpageContent.mainPage.terminal.options.user.option2.replace('[2] ', '');
            }
            onSelection(optionNumber, isDeveloperMode, optionText);
        }
    }, [onSelection, isDeveloperMode]);

    return (
        <>
            {/* Framing text */}
            <div className={`text-center mb-[40px] h-[35vh] content-center ${styles.framingText} ${isAnimating ? styles.framingTextAnimating : ''} ${textVisible ? styles.framingTextVisible : styles.framingTextHidden}`}>
                {displayDeveloperText ? (
                    <>
                        <h1 className="text-[40px] font-bold text-[#1f2937] mb-[15px]">
                            {mainpageContent.mainPage.framingText.developer.title}
                        </h1>
                        <p className="text-[25px] text-[#4b5563]">
                            {mainpageContent.mainPage.framingText.developer.subtitle}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-[40px] font-bold text-[#1f2937] mb-[15px]">
                            {mainpageContent.mainPage.framingText.user.title}
                        </h1>
                        <p className="text-[25px] text-[#4b5563]">
                            {mainpageContent.mainPage.framingText.user.subtitle}
                        </p>
                    </>
                )}
            </div>
            {/* Terminal Dialog Box with Liquid Glass Effects */}
            <div className={`${styles["terminal"]} font-mono`}>
                {/* Terminal Header */}
                <div className={`${styles["terminal-header"]} justify-between`}>
                    {/* Terminal Header Left */}
                    <div className={`${styles["terminal-dots"]}`}>
                        <div className={`${styles["terminal-dot-red"]}`}></div>
                        <div className={`${styles["terminal-dot-yellow"]}`}></div>
                        <div className={`${styles["terminal-dot-green"]}`}></div>
                    </div>
                    {/* Developer Mode Toggle */}
                    <div className={styles["toggleContainer"]}>
                        <span className={`${styles["toggleText"]} ${isDeveloperMode
                            ? styles["toggleTextDeveloper"]
                            : styles["toggleTextUser"]
                            }`}>
                            {isDeveloperMode ? mainpageContent.mainPage.terminal.toggleText.developer : mainpageContent.mainPage.terminal.toggleText.user}
                        </span>
                        <button
                            onClick={handleToggleClick}
                            className={`px-[0px] ${styles["toggleButton"]} ${isDeveloperMode
                                ? styles["toggleButtonDeveloper"]
                                : styles["toggleButtonUser"]
                                }`}
                        >
                            <span
                                className={`${styles["toggleSwitch"]} ${
                                    isAnimating
                                        ? styles["toggleSwitchAnimating"]
                                        : styles["toggleSwitchReturning"]
                                    }`}
                            />
                        </button>
                    </div>
                </div>
                {/* Terminal Content */}
                <div className={`${styles["terminal-content"]}`}>
                    <div className={`${styles["terminal-line"]}`}>
                        <span className={`${styles["prompt"]}`}>$</span> {mainpageContent.mainPage.terminal.prompt.substring(2)}
                    </div>
                    {/* Terminal Options */}
                    {isDeveloperMode ? (
                        <>
                            <div 
                                className={`${styles.terminalOption} ${isDeveloperMode
                                    ? styles.terminalOptionDeveloper
                                    : styles.terminalOptionUser
                                    } ${isAnimating ? styles.terminalOptionAnimating : ''}`}
                                onClick={() => handleOptionClick(1)}
                                style={{ cursor: 'pointer' }}
                            >
                                {mainpageContent.mainPage.terminal.options.developer.option1}
                            </div>
                            <div 
                                className={`${styles.terminalOptionLast} ${isDeveloperMode
                                    ? styles.terminalOptionDeveloper
                                    : styles.terminalOptionUser
                                    } ${isAnimating ? styles.terminalOptionAnimating : ''}`}
                                onClick={() => handleOptionClick(2)}
                                style={{ cursor: 'pointer' }}
                            >
                                {mainpageContent.mainPage.terminal.options.developer.option2}
                            </div>
                        </>
                    ) : (
                        <>
                            <div 
                                className={`${styles.terminalOption} ${isDeveloperMode
                                    ? styles.terminalOptionDeveloper
                                    : styles.terminalOptionUser
                                    } ${isAnimating ? styles.terminalOptionAnimating : ''}`}
                                onClick={() => handleOptionClick(1)}
                                style={{ cursor: 'pointer' }}
                            >
                                {mainpageContent.mainPage.terminal.options.user.option1}
                            </div>
                            <div 
                                className={`${styles.terminalOptionLast} ${isDeveloperMode
                                    ? styles.terminalOptionDeveloper
                                    : styles.terminalOptionUser
                                    } ${isAnimating ? styles.terminalOptionAnimating : ''}`}
                                onClick={() => handleOptionClick(2)}
                                style={{ cursor: 'pointer' }}
                            >
                                {mainpageContent.mainPage.terminal.options.user.option2}
                            </div>
                        </>
                    )}
                    {/* input line and cursor */}
                    <div className={`${styles["input-line"]}`}>
                        <span className={`${styles["input-prompt"]}`}>&gt;</span>
                        <div className={`${styles["cursor"]}`}></div>
                    </div>
                </div>
            </div>
        </>
    );
});

MainPageContent.displayName = 'MainPageContent';

// Loading component for lazy loaded components
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
);

type ViewMode = 'terminal' | 'transitioning' | 'timeline';
type UserType = 'developer' | 'user';

export default function MainPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('terminal');
    const [userType, setUserType] = useState<UserType>('developer');
    const [selectedOption, setSelectedOption] = useState(1);
    const [selectedOptionText, setSelectedOptionText] = useState('');
    // 🚀 NEW: Menu 總是顯示，不需要控制其可見性
    
    // Transition states
    const [showFramingText, setShowFramingText] = useState(false);
    const [floatUp, setFloatUp] = useState(false);
    const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fadeIn' | 'fadeOut' | 'floating'>('idle');

    const handleTerminalSelection = useCallback(async (option: number, isDeveloper: boolean, optionText: string) => {
        setUserType(isDeveloper ? 'developer' : 'user');
        setSelectedOption(option);
        setSelectedOptionText(optionText);
        setViewMode('transitioning');
        
        // Start transition animation
        setShowFramingText(true);
        setTransitionPhase('fadeIn');
        
        // Run transition sequence
        setTimeout(() => {
            setTransitionPhase('fadeOut');
            setShowFramingText(false);
        }, 2500);
        
        setTimeout(() => {
            setTransitionPhase('floating');
            setFloatUp(true);
        }, 3000);
        
        setTimeout(() => {
            setViewMode('timeline');
            setTransitionPhase('idle');
            setFloatUp(false);
        }, 3800);
    }, []);


    const handleBackToTerminal = useCallback(() => {
        setViewMode('terminal');
        setSelectedOption(1);
        setSelectedOptionText('');
    }, []);

    return (
        <>
            {/* SVG Filters for Liquid Glass Effect */}
            <svg style={{ display: 'none' }}>
                <filter id="container-glass" x="-50%" y="-50%" width="200%" height="200%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="3" seed="5" result="noise" />
                    <feGaussianBlur in="noise" stdDeviation="0.5" result="blur" />
                    <feDisplacementMap in="SourceGraphic" in2="blur" scale="120" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>
            
            {/* Background layer - changes based on view mode */}
            {viewMode === 'terminal' && (
                <div 
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: `url('https://statics.bloomprotocol.ai/mainpage/mainpage_beta.webp')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}
            
            {/* Purple background for transition and timeline views */}
            {(viewMode === 'transitioning' || viewMode === 'timeline') && (
                <>
                    {/* Menu cover - only covers the menu area */}
                    <div 
                        className="fixed top-0 left-0 right-0 h-[56px] desktop:h-[84px] z-[60]"
                        style={{
                            backgroundColor: '#2d174a',
                            transition: 'background-color 0.3s ease-in-out'
                        }}
                    />
                    {/* Background layer */}
                    <div 
                        className="fixed inset-0 z-0"
                        style={{
                            backgroundColor: '#2d174a',
                            transition: 'background-color 0.3s ease-in-out'
                        }}
                    />
                </>
            )}
            
            <Suspense fallback={<LoadingSpinner />}>
                {viewMode !== 'timeline' ? (
                    <div className={`relative px-[16px] max-w-[1440px] mx-auto h-[88vh] flex-col justify-center items-center z-[2] ${floatUp ? styles.floatUp : ''}`}>
                        {/* Terminal view */}
                        {viewMode === 'terminal' && (
                            <MainPageContent onSelection={handleTerminalSelection} />
                        )}

                        {/* Transition animation - in place */}
                        {viewMode === 'transitioning' && (
                            <TransitionContent 
                                showFramingText={showFramingText}
                                userType={userType}
                                selectedOption={selectedOption}
                                selectedOptionText={selectedOptionText}
                            />
                        )}
                    </div>
                ) : (
                    /* Timeline view */
                    userType === 'developer' ? (
                        <JourneyTimeline
                            userType={userType}
                            selectedOption={selectedOption}
                            selectedOptionText={selectedOptionText}
                            onBackToTerminal={handleBackToTerminal}
                        />
                    ) : (
                        <RPG 
                            selectedOption={selectedOption}
                            selectedOptionText={selectedOptionText}
                            onBackToTerminal={handleBackToTerminal}
                        />
                    )
                )}
            </Suspense>
        </>
    );
}
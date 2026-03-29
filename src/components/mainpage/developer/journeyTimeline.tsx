import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styles from './journeyTimeline.module.css';
import { ANIMATION_TIMINGS } from '../shared/animations.config';
import { useAnimationEngine } from '../shared/AnimationEngine';
import AnimatedHeader from '../shared/AnimatedHeader';
import StatsDisplay from '../shared/StatsDisplay';
import EmailSignupForm from '../shared/EmailSignupForm';
import BackToTerminalButton from '../shared/BackToTerminalButton';
import { mainpageContent } from '../content.config';

interface JourneyTimelineProps {
  userType: 'developer' | 'user';
  selectedOption: number;
  selectedOptionText: string;
  onBackToTerminal?: () => void;
}

// Move milestones data outside component to avoid recreation on every render
const MILESTONES = [
  {
    day: 7,
    label: mainpageContent.journeyTimeline.milestones.day7.label,
    event: mainpageContent.journeyTimeline.milestones.day7.event,
    users: 1314,
    revenue: 0,
    user_feedback: 0,
    metrics: mainpageContent.journeyTimeline.milestones.day7.metrics
  },
  {
    day: 21,
    label: mainpageContent.journeyTimeline.milestones.day21.label,
    event: mainpageContent.journeyTimeline.milestones.day21.event,
    users: 5200,
    revenue: 1247,
    user_feedback: 150,
    metrics: mainpageContent.journeyTimeline.milestones.day21.metrics
  },
  {
    day: 28,
    label: mainpageContent.journeyTimeline.milestones.day28.label,
    event: mainpageContent.journeyTimeline.milestones.day28.event,
    users: 9955,
    revenue: 5420,
    user_feedback: 500,
    metrics: mainpageContent.journeyTimeline.milestones.day28.metrics
  }
];

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ userType, selectedOption, selectedOptionText, onBackToTerminal }) => {
  const [activeMarkers, setActiveMarkers] = useState<number[]>([]);
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    user_feedback: 0
  });
  const [showSignup, setShowSignup] = useState(false);
  const animationEngine = useAnimationEngine();
  
  // 使用 ref 來追蹤當前的 stats 值，避免循環依賴
  const statsRef = useRef(stats);
  statsRef.current = stats;

  // 使用 props 中的选项信息

  const animateStatsToMilestone = useCallback(async (milestone: typeof MILESTONES[0], index: number) => {
    if (!animationEngine) return;
    
    
    const startStats = { ...statsRef.current };
    
    
    
    // 創建一個更新所有統計數據的函數
    const updateAllStats = (progress: number) => {
      const newStats = {
        users: Math.round(startStats.users + (milestone.users - startStats.users) * progress),
        revenue: Math.round(startStats.revenue + (milestone.revenue - startStats.revenue) * progress),
        user_feedback: Math.round(startStats.user_feedback + (milestone.user_feedback - startStats.user_feedback) * progress)
      };
      setStats(newStats);
      statsRef.current = newStats;
    };
    
    // 使用單一動畫來更新所有數據
    await animationEngine.start(
      `stats-${index}`,
      ANIMATION_TIMINGS.STATS_UPDATE_DURATION,
      updateAllStats,
      'easeOut'
    );
    
    
  }, [animationEngine]);

  useEffect(() => {
    if (!animationEngine) return;

    // Timeline 顯示動畫 - 完全獨立
    const runTimelineAnimation = async () => {
      
      
      // 第一個里程碑
      await animationEngine.delay(ANIMATION_TIMINGS.MILESTONE_BASE_DELAY);
      setActiveMarkers([0]);
      
      
      // 第二個里程碑
      await animationEngine.delay(ANIMATION_TIMINGS.MILESTONE_STAGGER);
      setActiveMarkers([0, 1]);
      
      
      // 第三個里程碑
      await animationEngine.delay(ANIMATION_TIMINGS.MILESTONE_STAGGER);
      setActiveMarkers([0, 1, 2]);
      
      
      // 顯示註冊表單
      await animationEngine.delay(ANIMATION_TIMINGS.SIGNUP_SHOW_DELAY);
      setShowSignup(true);
      
    };

    // Stats 更新動畫 - 完全獨立
    const runStatsAnimation = async () => {
      
      
      // 等待一小段時間後開始更新數據
      await animationEngine.delay(ANIMATION_TIMINGS.MILESTONE_BASE_DELAY + ANIMATION_TIMINGS.STATS_UPDATE_DELAY);
      
      // 更新第一個里程碑的數據
      await animateStatsToMilestone(MILESTONES[0], 0);
      
      // 間隔後更新第二個里程碑的數據
      await animationEngine.delay(500);
      await animateStatsToMilestone(MILESTONES[1], 1);
      
      // 間隔後更新第三個里程碑的數據
      await animationEngine.delay(500);
      await animateStatsToMilestone(MILESTONES[2], 2);
      
      
    };

    // 同時但獨立地運行兩個動畫
    runTimelineAnimation();
    runStatsAnimation();

    return () => {
      animationEngine.stopAll();
    };
  }, [animationEngine, animateStatsToMilestone]);

  // Memoize milestone components
  const milestoneElements = useMemo(() => (
    MILESTONES.map((milestone, index) => (
      <div
        key={milestone.day}
        className={`${styles.dayMarker} ${activeMarkers.includes(index) ? styles.active : ''}`}
      >
        <div className={styles.dayLabel}>{milestone.label}</div>
        <div className={styles.dayEvent}>{milestone.event}</div>
        <div className={styles.dayMetrics}>
          {milestone.metrics.map((metric, i) => (
            <div key={i} className={styles.metric}>
              <span>{metric.icon}</span>
              <span className={metric.highlight ? styles.metricHighlight : ''}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    ))
  ), [activeMarkers]);

  return (
    <div className={styles.container}>
      {/* Header - 使用共用組件 */}
      <AnimatedHeader
        title={mainpageContent.journeyTimeline.header.title}
        subtitle={mainpageContent.journeyTimeline.header.subtitle}
        variant="developer"
      />

      {/* Stats Terminal - 使用共用組件 */}
      <StatsDisplay
        variant="developer"
        format="terminal"
        stats={stats}
      />

      {/* Timeline */}
      <div className={`${styles.timeline} mt-5`}>
        <div className={styles.progressLine}>
          <div className={styles.progressFill}></div>
        </div>
        {milestoneElements}
      </div>

      {/* Signup section - 使用共用組件 */}
      <EmailSignupForm
        variant="developer"
        title={mainpageContent.journeyTimeline.emailSignup.title}
        buttonText={mainpageContent.journeyTimeline.emailSignup.buttonText}
        successButtonText={mainpageContent.journeyTimeline.emailSignup.successButtonText}
        placeholderText={mainpageContent.journeyTimeline.emailSignup.placeholderText}
        successPlaceholderText={mainpageContent.journeyTimeline.emailSignup.successPlaceholderText}
        show={showSignup}
        className="mt-5"
        referralCode=""
        selectedOption={selectedOption}
        selectedOptionText={selectedOptionText}
      />

      {/* Back button - 使用共用組件 */}
      <BackToTerminalButton onBack={onBackToTerminal!} />
    </div>
  );
};

export default JourneyTimeline;
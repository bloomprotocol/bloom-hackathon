export const ANIMATION_TIMINGS = {
  // 通用動畫時間
  FADE_IN: 800,
  FADE_OUT: 300,
  SLIDE_UP: 500,
  TRANSITION_DEFAULT: 300,
  
  // JourneyTimeline 特定時間
  MILESTONE_BASE_DELAY: 400,
  MILESTONE_STAGGER: 300,
  STATS_UPDATE_DELAY: 300,
  STATS_UPDATE_DURATION: 800,
  SIGNUP_SHOW_DELAY: 300,
  BACK_BUTTON_SHOW_DELAY: 2000,
  PROGRESS_FILL_DURATION: 7000,
  PROGRESS_FILL_DELAY: 1000,
  
  // RPG 特定時間
  PARTICLE_DURATION_MIN: 10000,
  PARTICLE_DURATION_MAX: 20000,
  BUTTON_TEXT_TOGGLE: 1000,
  INVENTORY_STAGGER: 300,
  
  // TerminalTransition 時間
  TERMINAL_SHOW_DELAY: 2500,
  TERMINAL_FLOAT_DELAY: 500,
  TERMINAL_FLOAT_DURATION: 800,
} as const;

export const ANIMATION_EASING = {
  DEFAULT: 'ease-out',
  SMOOTH: 'ease-in-out',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const COLORS = {
  developer: {
    primary: '#2563eb',
    secondary: '#bfdbfe',
    gradient: 'linear-gradient(135deg, #bfdbfe, #2563eb)',
    text: '#93c5fd',
    highlight: '#60a5fa',
  },
  user: {
    primary: '#FF5199',
    secondary: '#FFB3E6',
    gradient: 'linear-gradient(135deg, #FFB3E6, #FF5199)',
    text: '#FF8CCC',
    highlight: '#ff1493',
  },
  common: {
    success: '#6bcf7f',
    background: 'rgba(20, 20, 30, 0.95)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

export type AnimationTiming = typeof ANIMATION_TIMINGS;
export type AnimationEasing = typeof ANIMATION_EASING;
export type ColorScheme = typeof COLORS; 
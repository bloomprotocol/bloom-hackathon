import React from 'react';

/**
 * Task Configuration System
 * 
 * This configuration maps task display logic based on:
 * 1. content_type (from task.extra.content_type) - PRIMARY
 * 2. task_type (from task.type) - FALLBACK for legacy data
 * 
 * Data structure from backend:
 * {
 *   type: "CONTENT_SUBMISSION",        // task_type (backend enum)
 *   extra: {
 *     content_type: "URL_SUBMISSION",  // content_type (determines UI)
 *     category_name: "Tasks"
 *   }
 * }
 * 
 * Priority: TaskCard will check content_type first, then fall back to task_type
 */

// Task 配置的類型定義
interface TaskButtonTextConfig {
  initial: string | ((statusData?: any) => string);
  in_progress?: string | ((statusData?: any) => string);
  completed: string;
  processing: string;
  failed: string;
}

interface InputConfig {
  placeholder: string;
  type: string;
  className?: string;
  validation?: (value: string) => boolean;
  // 已提交值的顯示配置
  submittedValueDisplay?: {
    show: boolean;
    format?: (value: string) => string;
    className?: string;
    prefix?: string;
  };
}

type DisplayMode = 'input-and-button' | 'text-and-button' | 'button-only';

interface TaskTypeConfig {
  component: 'button' | 'input' | 'social' | 'custom' | 'modal';
  modalType?: 'url_submission' | 'bounty_hunter' | 'review' | 'options' | 'ranking';
  buttonText: TaskButtonTextConfig;
  inputConfig?: InputConfig;
  socialConfig?: {
    platform: string;
    actionUrl?: string;
  };
  customComponent?: React.ComponentType<any>;
  // 不同狀態下的顯示模式
  displayMode?: {
    initial?: DisplayMode;
    in_progress?: DisplayMode;
    completed?: DisplayMode;
    processing?: DisplayMode;
    failed?: DisplayMode;
  };
}

// Task UI configuration mapping
// Maps content_type (or task_type for legacy) to UI components
// Priority: content_type > task_type
export const taskConfig: Record<string, TaskTypeConfig> = {
  // 每日簽到
  // Task Type: DAILY_CHECKIN
  DAILY_CHECKIN: {
    component: 'button',
    buttonText: {
      initial: 'Start Now',
      in_progress: (statusData) => {
        const days = statusData?.extra?.consecutiveDays || 0;
        const required = statusData?.extra?.requiredDays || 7;
        return `Day ${days}/${required}`;
      },
      completed: 'Done',
      processing: 'Verifying',
      failed: 'Oooops'
    }
  },

  // 註冊帳號
  // Task Type: REGISTER_ACCOUNT
  // @description: the prebuilt task for "Welcome to Bloom Protocol"
  REGISTER_ACCOUNT: {
    component: 'button',
    buttonText: {
      initial: 'Register',
      completed: 'Done',
      processing: 'Verifying',
      failed: 'Oooops'
    }
  },

  // 與協議互動
  // Task Type: INTERACT_WITH_BLOOM_PROTOCOL
  // @description: the prebuilt task for "Interact with Bloom Protocol"
  INTERACT_WITH_BLOOM_PROTOCOL: {
    component: 'button',
    buttonText: {
      initial: 'Interact',
      completed: 'Done',
      processing: 'Verifying',
      failed: 'Oooops'
    }
  },

  // 內容提交類型 (支援多種內容類型)
  // @todo: We are going to refactor
  CONTENT_SUBMISSION: {
    component: 'input',
    buttonText: {
      initial: 'Submit',
      completed: 'Done',
      in_progress: 'Ranking by GPT',
      processing: 'Verifying',
      failed: 'Oooops'
    },
    inputConfig: {
      placeholder: 'Enter URL',
      type: 'url',
      className: 'w-full px-3 py-2 bg-white rounded-lg border border-greyLine focus:outline-none focus:border-secondary text-sm',
      validation: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      // 已提交值的顯示配置
      submittedValueDisplay: {
        show: true,
        format: (value: string) => {
          try {
            const url = new URL(value);
            return url.hostname;
          } catch {
            return value;
          }
        },
        className: 'text-xs text-gray-600 italic',
        prefix: 'Submitted: '
      }
    },
    // 顯示模式配置
    displayMode: {
      initial: 'input-and-button',
      in_progress: 'text-and-button',
      completed: 'text-and-button',
      processing: 'text-and-button',
      failed: 'input-and-button'
    }
  },

  // URL 提交類型 - 現在作為 content_type 使用
  URL_SUBMISSION: {
    component: 'modal',
    modalType: 'url_submission',
    buttonText: {
      initial: 'Submit Content',
      completed: 'Approved',
      in_progress: 'Ranking by GPT',
      processing: 'Submitting...',
      failed: 'Try Again'
    }
  },

  // Bounty Hunter (Bug Report) - 作為 content_type 使用
  BOUNTY_HUNTER: {
    component: 'modal',
    modalType: 'bounty_hunter',
    buttonText: {
      initial: 'Submit',
      completed: 'Completed',
      in_progress: 'Under Review',
      processing: 'Submitting...',
      failed: 'Failed'
    }
  },

  // Project Review - 作為 content_type 使用
  PROJECT_REVIEW: {
    component: 'modal',
    modalType: 'review',
    buttonText: {
      initial: 'Write Review',
      in_progress: 'Pending Approval',
      completed: 'Approved',
      processing: 'Submitting',
      failed: 'Failed'
    }
  },

  // 文本提交類型
  // @description: this can be used for any text submission task
  TEXT_SUBMISSION: {
    component: 'input',
    buttonText: {
      initial: 'Submit',
      completed: 'Done',
      processing: 'Verifying',
      failed: 'Oooops'
    },
    inputConfig: {
      placeholder: 'Enter your answer',
      type: 'text',
      className: 'w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#8478e0] text-sm'
    }
  },

  // 社交媒體連接
  // @description: this is the prebuilt task for "Connect your Twitter", not in the scope of this time
  SOCIAL_TWITTER: {
    component: 'social',
    buttonText: {
      initial: 'Connect',
      completed: 'Connected',
      processing: 'Connecting',
      failed: 'Failed'
    },
    socialConfig: {
      platform: 'twitter'
    }
  },

  // OPTIONS 選擇題類型
  // @description: Multiple choice questions for quizzes or surveys
  OPTIONS: {
    component: 'modal',
    modalType: 'options',
    buttonText: {
      initial: 'Answer',
      completed: 'Correct!',     // 加驚嘆號更有鼓勵感
      in_progress: 'Reviewing',
      processing: 'Submitting',
      failed: 'Try Again'
    }
  },
  RANKING: {
    component: 'modal',
    modalType: 'ranking',
    buttonText: {
      initial: 'Start Ranking',
      completed: 'Ranked',
      processing: 'Submitting',
      failed: 'Try Again'
    }
  },

  // 默認配置
  DEFAULT: {
    component: 'button',
    buttonText: {
      initial: 'Complete',
      completed: 'Done',
      processing: 'Verifying',
      failed: 'Oooops'
    }
  }
};


// 輔助函數：獲取按鈕文本
export const getTaskButtonText = (
  task: { task_type?: string; content_type?: string | null; type?: string; extra?: any },
  buttonState: string,
  statusData?: any
): string => {
  // First check if task has custom button text in extra field
  if (task.extra?.buttonText && task.extra.buttonText[buttonState]) {
    // Return custom text if it exists for this button state
    return task.extra.buttonText[buttonState];
  }
  
  // Fall back to default configuration
  // Use content_type first, then task_type, then type for backward compatibility
  const configKey = task.content_type || task.task_type || task.type || 'DEFAULT';
  const config = taskConfig[configKey] || taskConfig.DEFAULT;
  const textConfig = config.buttonText[buttonState as keyof TaskButtonTextConfig];
  
  if (!textConfig) {
    return config.buttonText.initial as string;
  }
  
  return typeof textConfig === 'function' ? textConfig(statusData) : textConfig;
};

// 按鈕樣式配置
export const buttonStyles = {
  completed: "bg-[rgba(113,202,65,0.2)] text-[#393F49] cursor-default hover:bg-[rgba(113,202,65,0.2)] hover:text-dark border-none",
  processing: "bg-[#8E38FF] text-white animate-pulse cursor-wait hover:bg-[#8E38FF] border-none",
  failed: "bg-[#FF5199] text-white hover:bg-[#FF5199] border-none",
  in_progress: "inline-block p-x[6px] relative overflow-hidden bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] via-[#8B5CF6] via-[#A78BFA] via-[#C4B5FD] via-[#8B5CF6] to-[#7C3AED] bg-[length:400%_400%] text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)] animate-purple-flow border-none",
  initial: "bg-[#393F49] text-white hover:bg-[#393F49] border-none"
};
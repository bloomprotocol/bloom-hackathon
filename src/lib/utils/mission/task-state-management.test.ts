/**
 * 任务状态管理逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. 任务状态变化必须符合流转规则
 * 2. UI 状态必须实时反映任务状态
 * 3. 操作后必须刷新相关缓存
 * 4. 乐观更新提升用户体验
 * 5. 错误时必须正确回滚状态
 */

// 模拟任务状态管理的业务逻辑
type TaskStatus = 'initial' | 'processing' | 'in_progress' | 'completed' | 'failed';
type TaskType = 'DAILY_CHECKIN' | 'CONTENT_SUBMISSION' | 'URL_SUBMISSION' | 'BOUNTY_HUNTER';

interface TaskUIState {
  isDisabled: boolean;
  showLoading: boolean;
  showSuccess: boolean;
  showError: boolean;
  buttonText: string;
  statusIcon: 'none' | 'loading' | 'checkmark' | 'error' | 'pending';
  animation: 'none' | 'pulse' | 'flow-gradient';
}

interface TaskOperation {
  taskId: string;
  taskType: TaskType;
  currentStatus: TaskStatus;
  operationType: 'verify' | 'retry' | 'view';
}

interface CacheKey {
  queryKey: (string | number)[];
  shouldInvalidate: boolean;
}

class TaskStateManagement {
  // 业务规则：根据任务状态决定 UI 显示
  static getTaskUIState(status: TaskStatus, isProcessing: boolean = false): TaskUIState {
    // 处理中状态优先
    if (isProcessing) {
      return {
        isDisabled: true,
        showLoading: true,
        showSuccess: false,
        showError: false,
        buttonText: 'Processing...',
        statusIcon: 'loading',
        animation: 'pulse'
      };
    }

    switch (status) {
      case 'initial':
        return {
          isDisabled: false,
          showLoading: false,
          showSuccess: false,
          showError: false,
          buttonText: 'Start Task',
          statusIcon: 'none',
          animation: 'none'
        };

      case 'processing':
        return {
          isDisabled: true,
          showLoading: true,
          showSuccess: false,
          showError: false,
          buttonText: 'Processing...',
          statusIcon: 'loading',
          animation: 'pulse'
        };

      case 'in_progress':
        return {
          isDisabled: true,
          showLoading: false,
          showSuccess: false,
          showError: false,
          buttonText: 'Under Review',
          statusIcon: 'pending',
          animation: 'flow-gradient'
        };

      case 'completed':
        return {
          isDisabled: true,
          showLoading: false,
          showSuccess: true,
          showError: false,
          buttonText: 'Completed',
          statusIcon: 'checkmark',
          animation: 'none'
        };

      case 'failed':
        return {
          isDisabled: false,
          showLoading: false,
          showSuccess: false,
          showError: true,
          buttonText: 'Retry',
          statusIcon: 'error',
          animation: 'none'
        };

      default:
        return {
          isDisabled: true,
          showLoading: false,
          showSuccess: false,
          showError: false,
          buttonText: 'Unknown',
          statusIcon: 'none',
          animation: 'none'
        };
    }
  }

  // 业务规则：验证状态转换是否合法
  static isValidStateTransition(from: TaskStatus, to: TaskStatus): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      'initial': ['processing', 'completed'], // 可以直接完成（如注册任务）
      'processing': ['in_progress', 'completed', 'failed'],
      'in_progress': ['completed', 'failed'], // 审核结果
      'completed': [], // 终态，不能转换
      'failed': ['processing'] // 可以重试
    };

    return validTransitions[from]?.includes(to) || false;
  }

  // 业务规则：决定操作后的缓存策略
  static getCacheInvalidationKeys(
    operation: TaskOperation,
    missionId: string
  ): CacheKey[] {
    const keys: CacheKey[] = [];

    // 基础缓存：任务详情
    keys.push({
      queryKey: ['missionDetail', missionId],
      shouldInvalidate: true
    });

    // 用户任务记录
    keys.push({
      queryKey: ['userTasks'],
      shouldInvalidate: true
    });

    // 特定任务类型的额外缓存
    switch (operation.taskType) {
      case 'DAILY_CHECKIN':
        keys.push({
          queryKey: ['dailyCheckinStreak'],
          shouldInvalidate: true
        });
        break;

      case 'URL_SUBMISSION':
      case 'BOUNTY_HUNTER':
        // 需要审核的任务，刷新 Builder Inbox
        if (operation.currentStatus === 'processing') {
          keys.push({
            queryKey: ['builderInbox'],
            shouldInvalidate: true
          });
        }
        break;
    }

    // 任务完成时刷新任务列表
    if (operation.currentStatus === 'completed') {
      keys.push({
        queryKey: ['missionList'],
        shouldInvalidate: true
      });
    }

    return keys;
  }

  // 业务规则：乐观更新策略
  static getOptimisticUpdate(
    currentStatus: TaskStatus,
    operation: TaskOperation
  ): {
    immediateStatus: TaskStatus;
    showOptimisticUI: boolean;
    rollbackOnError: boolean;
  } {
    // 重试操作
    if (operation.operationType === 'retry' && currentStatus === 'failed') {
      return {
        immediateStatus: 'processing',
        showOptimisticUI: true,
        rollbackOnError: true
      };
    }

    // 开始验证
    if (operation.operationType === 'verify' && currentStatus === 'initial') {
      return {
        immediateStatus: 'processing',
        showOptimisticUI: true,
        rollbackOnError: true
      };
    }

    // 查看操作不改变状态
    if (operation.operationType === 'view') {
      return {
        immediateStatus: currentStatus,
        showOptimisticUI: false,
        rollbackOnError: false
      };
    }

    return {
      immediateStatus: currentStatus,
      showOptimisticUI: false,
      rollbackOnError: false
    };
  }

  // 业务规则：错误恢复策略
  static getErrorRecoveryStrategy(
    taskType: TaskType,
    errorCode?: string
  ): {
    showRetryButton: boolean;
    retryDelay: number;
    maxRetries: number;
    errorMessage: string;
  } {
    // 通用错误消息
    const defaultError = 'Task failed. Please try again.';

    // 特定错误处理
    if (errorCode === 'NETWORK_ERROR') {
      return {
        showRetryButton: true,
        retryDelay: 1000,
        maxRetries: 3,
        errorMessage: 'Network error. Check your connection.'
      };
    }

    if (errorCode === 'ALREADY_COMPLETED') {
      return {
        showRetryButton: false,
        retryDelay: 0,
        maxRetries: 0,
        errorMessage: 'This task has already been completed.'
      };
    }

    // 任务类型特定策略
    switch (taskType) {
      case 'DAILY_CHECKIN':
        return {
          showRetryButton: true,
          retryDelay: 1500, // 1.5秒后重置按钮
          maxRetries: 1,
          errorMessage: errorCode === 'STREAK_BROKEN' 
            ? 'Streak broken! Starting over.' 
            : defaultError
        };

      case 'URL_SUBMISSION':
      case 'BOUNTY_HUNTER':
        return {
          showRetryButton: true,
          retryDelay: 2000,
          maxRetries: 3,
          errorMessage: 'Submission failed. Please check your input.'
        };

      default:
        return {
          showRetryButton: true,
          retryDelay: 1500,
          maxRetries: 3,
          errorMessage: defaultError
        };
    }
  }

  // 业务规则：任务组进度同步
  static calculateMissionProgressAfterTaskUpdate(
    allTasks: { id: string; status: TaskStatus }[],
    updatedTaskId: string,
    newStatus: TaskStatus
  ): {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    missionCompleted: boolean;
  } {
    // 更新特定任务的状态
    const updatedTasks = allTasks.map(task => 
      task.id === updatedTaskId 
        ? { ...task, status: newStatus }
        : task
    );

    const totalTasks = updatedTasks.length;
    const completedTasks = updatedTasks.filter(t => t.status === 'completed').length;
    const progressPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    const missionCompleted = totalTasks > 0 && completedTasks === totalTasks;

    return {
      totalTasks,
      completedTasks,
      progressPercentage,
      missionCompleted
    };
  }
}

describe('任务状态管理 - 核心业务逻辑', () => {
  describe('UI 状态映射', () => {
    test('initial 状态显示开始按钮', () => {
      const uiState = TaskStateManagement.getTaskUIState('initial');
      
      expect(uiState.isDisabled).toBe(false);
      expect(uiState.buttonText).toBe('Start Task');
      expect(uiState.statusIcon).toBe('none');
      expect(uiState.animation).toBe('none');
    });

    test('processing 状态显示加载动画', () => {
      const uiState = TaskStateManagement.getTaskUIState('processing');
      
      expect(uiState.isDisabled).toBe(true);
      expect(uiState.showLoading).toBe(true);
      expect(uiState.buttonText).toBe('Processing...');
      expect(uiState.statusIcon).toBe('loading');
      expect(uiState.animation).toBe('pulse');
    });

    test('in_progress 状态显示审核中', () => {
      const uiState = TaskStateManagement.getTaskUIState('in_progress');
      
      expect(uiState.isDisabled).toBe(true);
      expect(uiState.buttonText).toBe('Under Review');
      expect(uiState.statusIcon).toBe('pending');
      expect(uiState.animation).toBe('flow-gradient');
    });

    test('completed 状态显示完成标记', () => {
      const uiState = TaskStateManagement.getTaskUIState('completed');
      
      expect(uiState.isDisabled).toBe(true);
      expect(uiState.showSuccess).toBe(true);
      expect(uiState.buttonText).toBe('Completed');
      expect(uiState.statusIcon).toBe('checkmark');
    });

    test('failed 状态显示重试按钮', () => {
      const uiState = TaskStateManagement.getTaskUIState('failed');
      
      expect(uiState.isDisabled).toBe(false);
      expect(uiState.showError).toBe(true);
      expect(uiState.buttonText).toBe('Retry');
      expect(uiState.statusIcon).toBe('error');
    });

    test('处理中标志覆盖原状态', () => {
      const uiState = TaskStateManagement.getTaskUIState('initial', true);
      
      expect(uiState.isDisabled).toBe(true);
      expect(uiState.showLoading).toBe(true);
      expect(uiState.buttonText).toBe('Processing...');
    });
  });

  describe('状态转换验证', () => {
    test('initial 可以转到 processing', () => {
      expect(TaskStateManagement.isValidStateTransition('initial', 'processing')).toBe(true);
    });

    test('initial 可以直接转到 completed（自动完成任务）', () => {
      expect(TaskStateManagement.isValidStateTransition('initial', 'completed')).toBe(true);
    });

    test('processing 可以转到多个状态', () => {
      expect(TaskStateManagement.isValidStateTransition('processing', 'in_progress')).toBe(true);
      expect(TaskStateManagement.isValidStateTransition('processing', 'completed')).toBe(true);
      expect(TaskStateManagement.isValidStateTransition('processing', 'failed')).toBe(true);
    });

    test('completed 是终态不能转换', () => {
      expect(TaskStateManagement.isValidStateTransition('completed', 'initial')).toBe(false);
      expect(TaskStateManagement.isValidStateTransition('completed', 'processing')).toBe(false);
    });

    test('failed 只能转到 processing（重试）', () => {
      expect(TaskStateManagement.isValidStateTransition('failed', 'processing')).toBe(true);
      expect(TaskStateManagement.isValidStateTransition('failed', 'completed')).toBe(false);
    });

    test('非法的状态转换', () => {
      expect(TaskStateManagement.isValidStateTransition('initial', 'in_progress')).toBe(false);
      expect(TaskStateManagement.isValidStateTransition('in_progress', 'initial')).toBe(false);
    });
  });

  describe('缓存失效策略', () => {
    test('基础操作刷新任务详情和用户任务', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'CONTENT_SUBMISSION',
        currentStatus: 'initial',
        operationType: 'verify'
      };
      
      const keys = TaskStateManagement.getCacheInvalidationKeys(operation, 'mission_1');
      
      expect(keys).toContainEqual({
        queryKey: ['missionDetail', 'mission_1'],
        shouldInvalidate: true
      });
      expect(keys).toContainEqual({
        queryKey: ['userTasks'],
        shouldInvalidate: true
      });
    });

    test('每日签到刷新连续签到记录', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'DAILY_CHECKIN',
        currentStatus: 'processing',
        operationType: 'verify'
      };
      
      const keys = TaskStateManagement.getCacheInvalidationKeys(operation, 'mission_1');
      
      expect(keys).toContainEqual({
        queryKey: ['dailyCheckinStreak'],
        shouldInvalidate: true
      });
    });

    test('需要审核的任务刷新 Builder Inbox', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'URL_SUBMISSION',
        currentStatus: 'processing',
        operationType: 'verify'
      };
      
      const keys = TaskStateManagement.getCacheInvalidationKeys(operation, 'mission_1');
      
      expect(keys).toContainEqual({
        queryKey: ['builderInbox'],
        shouldInvalidate: true
      });
    });

    test('任务完成时刷新任务列表', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'CONTENT_SUBMISSION',
        currentStatus: 'completed',
        operationType: 'verify'
      };
      
      const keys = TaskStateManagement.getCacheInvalidationKeys(operation, 'mission_1');
      
      expect(keys).toContainEqual({
        queryKey: ['missionList'],
        shouldInvalidate: true
      });
    });
  });

  describe('乐观更新策略', () => {
    test('验证操作立即显示 processing', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'CONTENT_SUBMISSION',
        currentStatus: 'initial',
        operationType: 'verify'
      };
      
      const result = TaskStateManagement.getOptimisticUpdate('initial', operation);
      
      expect(result.immediateStatus).toBe('processing');
      expect(result.showOptimisticUI).toBe(true);
      expect(result.rollbackOnError).toBe(true);
    });

    test('重试操作立即显示 processing', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'DAILY_CHECKIN',
        currentStatus: 'failed',
        operationType: 'retry'
      };
      
      const result = TaskStateManagement.getOptimisticUpdate('failed', operation);
      
      expect(result.immediateStatus).toBe('processing');
      expect(result.showOptimisticUI).toBe(true);
      expect(result.rollbackOnError).toBe(true);
    });

    test('查看操作不改变状态', () => {
      const operation: TaskOperation = {
        taskId: 'task_1',
        taskType: 'CONTENT_SUBMISSION',
        currentStatus: 'completed',
        operationType: 'view'
      };
      
      const result = TaskStateManagement.getOptimisticUpdate('completed', operation);
      
      expect(result.immediateStatus).toBe('completed');
      expect(result.showOptimisticUI).toBe(false);
      expect(result.rollbackOnError).toBe(false);
    });
  });

  describe('错误恢复策略', () => {
    test('网络错误允许重试', () => {
      const strategy = TaskStateManagement.getErrorRecoveryStrategy(
        'CONTENT_SUBMISSION',
        'NETWORK_ERROR'
      );
      
      expect(strategy.showRetryButton).toBe(true);
      expect(strategy.maxRetries).toBe(3);
      expect(strategy.errorMessage).toContain('Network error');
    });

    test('已完成任务不允许重试', () => {
      const strategy = TaskStateManagement.getErrorRecoveryStrategy(
        'CONTENT_SUBMISSION',
        'ALREADY_COMPLETED'
      );
      
      expect(strategy.showRetryButton).toBe(false);
      expect(strategy.maxRetries).toBe(0);
      expect(strategy.errorMessage).toContain('already been completed');
    });

    test('每日签到断签有特定消息', () => {
      const strategy = TaskStateManagement.getErrorRecoveryStrategy(
        'DAILY_CHECKIN',
        'STREAK_BROKEN'
      );
      
      expect(strategy.showRetryButton).toBe(true);
      expect(strategy.retryDelay).toBe(1500);
      expect(strategy.errorMessage).toBe('Streak broken! Starting over.');
    });

    test('提交类任务有更长的重试延迟', () => {
      const strategy = TaskStateManagement.getErrorRecoveryStrategy(
        'URL_SUBMISSION'
      );
      
      expect(strategy.retryDelay).toBe(2000);
      expect(strategy.errorMessage).toContain('check your input');
    });
  });

  describe('任务组进度同步', () => {
    test('单个任务完成更新进度', () => {
      const allTasks = [
        { id: 'task_1', status: 'completed' as TaskStatus },
        { id: 'task_2', status: 'initial' as TaskStatus },
        { id: 'task_3', status: 'initial' as TaskStatus },
      ];
      
      const result = TaskStateManagement.calculateMissionProgressAfterTaskUpdate(
        allTasks,
        'task_2',
        'completed'
      );
      
      expect(result.totalTasks).toBe(3);
      expect(result.completedTasks).toBe(2);
      expect(result.progressPercentage).toBe(67);
      expect(result.missionCompleted).toBe(false);
    });

    test('最后一个任务完成标记任务组完成', () => {
      const allTasks = [
        { id: 'task_1', status: 'completed' as TaskStatus },
        { id: 'task_2', status: 'completed' as TaskStatus },
        { id: 'task_3', status: 'initial' as TaskStatus },
      ];
      
      const result = TaskStateManagement.calculateMissionProgressAfterTaskUpdate(
        allTasks,
        'task_3',
        'completed'
      );
      
      expect(result.completedTasks).toBe(3);
      expect(result.progressPercentage).toBe(100);
      expect(result.missionCompleted).toBe(true);
    });

    test('任务失败不增加完成数', () => {
      const allTasks = [
        { id: 'task_1', status: 'completed' as TaskStatus },
        { id: 'task_2', status: 'initial' as TaskStatus },
      ];
      
      const result = TaskStateManagement.calculateMissionProgressAfterTaskUpdate(
        allTasks,
        'task_2',
        'failed'
      );
      
      expect(result.completedTasks).toBe(1);
      expect(result.progressPercentage).toBe(50);
      expect(result.missionCompleted).toBe(false);
    });

    test('空任务组的进度', () => {
      const result = TaskStateManagement.calculateMissionProgressAfterTaskUpdate(
        [],
        'task_1',
        'completed'
      );
      
      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
      expect(result.progressPercentage).toBe(0);
      expect(result.missionCompleted).toBe(false);
    });
  });
});
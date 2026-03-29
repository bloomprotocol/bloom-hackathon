/**
 * 任务验证逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. 任务状态流转：initial → processing → completed/in_progress/failed
 * 2. 不同任务类型有不同的验证规则
 * 3. DAILY_CHECKIN 需要连续签到，断签会失败
 * 4. URL_SUBMISSION 需要 Builder 审核
 * 5. 任务完成后不能重复验证
 */

// 模拟任务验证的业务逻辑
type TaskType = 
  | 'DAILY_CHECKIN' 
  | 'CONTENT_SUBMISSION' 
  | 'URL_SUBMISSION' 
  | 'BOUNTY_HUNTER' 
  | 'PROJECT_REVIEW'
  | 'REGISTER_ACCOUNT';

type TaskStatus = 'initial' | 'processing' | 'in_progress' | 'completed' | 'failed';

interface TaskVerificationPayload {
  taskId: string;
  taskType: TaskType;
  // Task-specific fields
  url?: string;
  caption?: string;
  title?: string;
  content?: string;
  projectId?: string;
  testDate?: string; // For DAILY_CHECKIN in dev
}

interface TaskProgress {
  consecutiveDays?: number;
  lastCheckinDate?: string;
  checkinHistory?: string[];
  submittedUrl?: string;
  submittedAt?: string;
}

class TaskVerificationLogic {
  // 业务规则：验证 URL 格式
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // 必须是 http 或 https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      // 不能是直接的文件链接
      const invalidExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip'];
      const pathname = urlObj.pathname.toLowerCase();
      return !invalidExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  // 业务规则：检查是否可以开始验证
  static canStartVerification(currentStatus: TaskStatus): boolean {
    // 只有 initial 或 failed 状态可以开始新的验证
    return currentStatus === 'initial' || currentStatus === 'failed';
  }

  // 业务规则：计算连续签到天数
  static calculateConsecutiveDays(
    lastCheckinDate: string | undefined,
    currentDate: string
  ): { consecutive: number; isContinuous: boolean } {
    if (!lastCheckinDate) {
      // 第一次签到
      return { consecutive: 1, isContinuous: true };
    }

    const last = new Date(lastCheckinDate);
    const current = new Date(currentDate);
    const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // 同一天重复签到
      return { consecutive: 0, isContinuous: false };
    } else if (diffDays === 1) {
      // 连续签到
      return { consecutive: 1, isContinuous: true };
    } else {
      // 断签
      return { consecutive: 0, isContinuous: false };
    }
  }

  // 业务规则：根据任务类型决定验证后的状态
  static determineVerificationStatus(
    taskType: TaskType,
    validationResult: boolean
  ): TaskStatus {
    if (!validationResult) {
      return 'failed';
    }

    switch (taskType) {
      case 'DAILY_CHECKIN':
      case 'CONTENT_SUBMISSION':
      case 'REGISTER_ACCOUNT':
        // 这些任务验证通过后直接完成
        return 'completed';
      
      case 'URL_SUBMISSION':
      case 'BOUNTY_HUNTER':
      case 'PROJECT_REVIEW':
        // 这些任务需要审核，进入 in_progress 状态
        return 'in_progress';
      
      default:
        return 'completed';
    }
  }

  // 业务规则：验证任务提交的 payload
  static validateTaskPayload(payload: TaskVerificationPayload): {
    isValid: boolean;
    error?: string;
  } {
    const { taskType } = payload;

    switch (taskType) {
      case 'DAILY_CHECKIN':
        // 每日签到只需要 taskId
        return { isValid: true };

      case 'CONTENT_SUBMISSION':
        if (!payload.url) {
          return { isValid: false, error: 'URL is required' };
        }
        if (!this.isValidUrl(payload.url)) {
          return { isValid: false, error: 'Invalid URL format' };
        }
        return { isValid: true };

      case 'URL_SUBMISSION':
        if (!payload.url || !payload.caption) {
          return { isValid: false, error: 'URL and caption are required' };
        }
        if (!this.isValidUrl(payload.url)) {
          return { isValid: false, error: 'Invalid URL format' };
        }
        return { isValid: true };

      case 'BOUNTY_HUNTER':
        if (!payload.title || !payload.content) {
          return { isValid: false, error: 'Title and content are required' };
        }
        return { isValid: true };

      case 'PROJECT_REVIEW':
        if (!payload.content || !payload.projectId) {
          return { isValid: false, error: 'Content and projectId are required' };
        }
        return { isValid: true };

      case 'REGISTER_ACCOUNT':
        // 注册账号是自动完成的
        return { isValid: true };

      default:
        return { isValid: false, error: 'Unknown task type' };
    }
  }

  // 业务规则：模拟完整的验证流程
  static simulateVerification(
    taskType: TaskType,
    currentStatus: TaskStatus,
    payload: TaskVerificationPayload,
    progress?: TaskProgress
  ): {
    canStart: boolean;
    payloadValid: boolean;
    newStatus: TaskStatus;
    updatedProgress?: TaskProgress;
    error?: string;
  } {
    // 1. 检查是否可以开始验证
    const canStart = this.canStartVerification(currentStatus);
    if (!canStart) {
      return {
        canStart: false,
        payloadValid: false,
        newStatus: currentStatus,
        error: 'Task already completed or in progress'
      };
    }

    // 2. 验证 payload
    const validation = this.validateTaskPayload(payload);
    if (!validation.isValid) {
      return {
        canStart: true,
        payloadValid: false,
        newStatus: 'failed',
        error: validation.error
      };
    }

    // 3. 特殊处理每日签到
    if (taskType === 'DAILY_CHECKIN') {
      const checkinDate = payload.testDate || new Date().toISOString().split('T')[0];
      const result = this.calculateConsecutiveDays(
        progress?.lastCheckinDate,
        checkinDate
      );

      if (!result.isContinuous) {
        // 判断是重复签到还是断签
        const isDuplicateCheckin = progress?.lastCheckinDate === checkinDate;
        return {
          canStart: true,
          payloadValid: true,
          newStatus: 'failed',
          error: isDuplicateCheckin ? 'Already checked in today' : 'Streak broken',
          updatedProgress: {
            ...progress,
            consecutiveDays: 1, // 重置为1
            lastCheckinDate: checkinDate,
            checkinHistory: [checkinDate]
          }
        };
      }

      const newConsecutiveDays = (progress?.consecutiveDays || 0) + 1;
      return {
        canStart: true,
        payloadValid: true,
        newStatus: newConsecutiveDays >= 7 ? 'completed' : 'initial', // 7天完成任务
        updatedProgress: {
          ...progress,
          consecutiveDays: newConsecutiveDays,
          lastCheckinDate: checkinDate,
          checkinHistory: [...(progress?.checkinHistory || []), checkinDate]
        }
      };
    }

    // 4. 确定验证后的状态
    const newStatus = this.determineVerificationStatus(taskType, true);

    return {
      canStart: true,
      payloadValid: true,
      newStatus,
      updatedProgress: progress
    };
  }
}

describe('任务验证逻辑 - 核心业务逻辑', () => {
  describe('URL 验证规则', () => {
    test('有效的 HTTP/HTTPS URL 应该通过验证', () => {
      const validUrls = [
        'http://example.com',
        'https://example.com/page',
        'https://example.com/page?param=value',
        'https://sub.example.com/path/to/page',
      ];

      validUrls.forEach(url => {
        expect(TaskVerificationLogic.isValidUrl(url)).toBe(true);
      });
    });

    test('无效的 URL 应该被拒绝', () => {
      const invalidUrls = [
        'ftp://example.com',           // 非 HTTP/HTTPS
        'https://example.com/image.jpg', // 图片文件
        'https://example.com/doc.pdf',   // PDF 文件
        'not-a-url',                    // 非 URL 格式
        '',                             // 空字符串
      ];

      invalidUrls.forEach(url => {
        expect(TaskVerificationLogic.isValidUrl(url)).toBe(false);
      });
    });
  });

  describe('任务状态流转规则', () => {
    test('initial 状态可以开始验证', () => {
      expect(TaskVerificationLogic.canStartVerification('initial')).toBe(true);
    });

    test('failed 状态可以重新验证', () => {
      expect(TaskVerificationLogic.canStartVerification('failed')).toBe(true);
    });

    test('completed 状态不能重复验证', () => {
      expect(TaskVerificationLogic.canStartVerification('completed')).toBe(false);
    });

    test('in_progress 状态不能重复验证', () => {
      expect(TaskVerificationLogic.canStartVerification('in_progress')).toBe(false);
    });

    test('processing 状态不能重复验证', () => {
      expect(TaskVerificationLogic.canStartVerification('processing')).toBe(false);
    });
  });

  describe('验证后状态决策', () => {
    test('DAILY_CHECKIN 验证通过后直接完成', () => {
      const status = TaskVerificationLogic.determineVerificationStatus('DAILY_CHECKIN', true);
      expect(status).toBe('completed');
    });

    test('URL_SUBMISSION 验证通过后进入审核状态', () => {
      const status = TaskVerificationLogic.determineVerificationStatus('URL_SUBMISSION', true);
      expect(status).toBe('in_progress');
    });

    test('BOUNTY_HUNTER 验证通过后进入审核状态', () => {
      const status = TaskVerificationLogic.determineVerificationStatus('BOUNTY_HUNTER', true);
      expect(status).toBe('in_progress');
    });

    test('PROJECT_REVIEW 验证通过后进入审核状态', () => {
      const status = TaskVerificationLogic.determineVerificationStatus('PROJECT_REVIEW', true);
      expect(status).toBe('in_progress');
    });

    test('验证失败统一返回 failed 状态', () => {
      const taskTypes: TaskType[] = ['DAILY_CHECKIN', 'URL_SUBMISSION', 'BOUNTY_HUNTER'];
      taskTypes.forEach(type => {
        const status = TaskVerificationLogic.determineVerificationStatus(type, false);
        expect(status).toBe('failed');
      });
    });
  });

  describe('Payload 验证规则', () => {
    test('CONTENT_SUBMISSION 必须包含有效 URL', () => {
      // 缺少 URL
      const result1 = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'CONTENT_SUBMISSION'
      });
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('URL is required');

      // 无效 URL
      const result2 = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'CONTENT_SUBMISSION',
        url: 'not-a-url'
      });
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Invalid URL format');

      // 有效 URL
      const result3 = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'CONTENT_SUBMISSION',
        url: 'https://example.com'
      });
      expect(result3.isValid).toBe(true);
    });

    test('URL_SUBMISSION 必须包含 URL 和 caption', () => {
      // 缺少 caption
      const result1 = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'URL_SUBMISSION',
        url: 'https://example.com'
      });
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('URL and caption are required');

      // 缺少 URL
      const result2 = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'URL_SUBMISSION',
        caption: 'My submission'
      });
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('URL and caption are required');

      // 完整提交
      const result3 = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'URL_SUBMISSION',
        url: 'https://example.com',
        caption: 'My submission'
      });
      expect(result3.isValid).toBe(true);
    });

    test('BOUNTY_HUNTER 必须包含 title 和 content', () => {
      const result = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'BOUNTY_HUNTER',
        title: 'Bug found',
        content: 'Description of the bug'
      });
      expect(result.isValid).toBe(true);
    });

    test('PROJECT_REVIEW 必须包含 content 和 projectId', () => {
      const result = TaskVerificationLogic.validateTaskPayload({
        taskId: 'task-1',
        taskType: 'PROJECT_REVIEW',
        content: 'Great project!',
        projectId: 'proj_123'
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('每日签到连续性计算', () => {
    test('第一次签到返回 1 天', () => {
      const result = TaskVerificationLogic.calculateConsecutiveDays(
        undefined,
        '2025-06-01'
      );
      expect(result.consecutive).toBe(1);
      expect(result.isContinuous).toBe(true);
    });

    test('连续签到增加天数', () => {
      const result = TaskVerificationLogic.calculateConsecutiveDays(
        '2025-06-01',
        '2025-06-02'
      );
      expect(result.consecutive).toBe(1);
      expect(result.isContinuous).toBe(true);
    });

    test('同一天重复签到被拒绝', () => {
      const result = TaskVerificationLogic.calculateConsecutiveDays(
        '2025-06-01',
        '2025-06-01'
      );
      expect(result.consecutive).toBe(0);
      expect(result.isContinuous).toBe(false);
    });

    test('断签重置连续天数', () => {
      const result = TaskVerificationLogic.calculateConsecutiveDays(
        '2025-06-01',
        '2025-06-03' // 跳过了一天
      );
      expect(result.consecutive).toBe(0);
      expect(result.isContinuous).toBe(false);
    });
  });

  describe('完整验证流程模拟', () => {
    test('每日签到成功流程', () => {
      // 第一天签到
      const day1 = TaskVerificationLogic.simulateVerification(
        'DAILY_CHECKIN',
        'initial',
        { taskId: 'task-1', taskType: 'DAILY_CHECKIN', testDate: '2025-06-01' }
      );
      expect(day1.canStart).toBe(true);
      expect(day1.payloadValid).toBe(true);
      expect(day1.newStatus).toBe('initial'); // 还未完成7天
      expect(day1.updatedProgress?.consecutiveDays).toBe(1);

      // 第7天签到完成任务
      const day7Progress = { consecutiveDays: 6, lastCheckinDate: '2025-06-06' };
      const day7 = TaskVerificationLogic.simulateVerification(
        'DAILY_CHECKIN',
        'initial',
        { taskId: 'task-1', taskType: 'DAILY_CHECKIN', testDate: '2025-06-07' },
        day7Progress
      );
      expect(day7.newStatus).toBe('completed');
      expect(day7.updatedProgress?.consecutiveDays).toBe(7);
    });

    test('每日签到断签失败流程', () => {
      const progress = { consecutiveDays: 3, lastCheckinDate: '2025-06-03' };
      const result = TaskVerificationLogic.simulateVerification(
        'DAILY_CHECKIN',
        'initial',
        { taskId: 'task-1', taskType: 'DAILY_CHECKIN', testDate: '2025-06-05' }, // 断了一天
        progress
      );
      expect(result.canStart).toBe(true);
      expect(result.payloadValid).toBe(true);
      expect(result.newStatus).toBe('failed');
      expect(result.error).toBe('Streak broken');
      expect(result.updatedProgress?.consecutiveDays).toBe(1); // 重置为1
    });

    test('URL 提交需要审核', () => {
      const result = TaskVerificationLogic.simulateVerification(
        'URL_SUBMISSION',
        'initial',
        {
          taskId: 'task-1',
          taskType: 'URL_SUBMISSION',
          url: 'https://example.com',
          caption: 'My creative content'
        }
      );
      expect(result.canStart).toBe(true);
      expect(result.payloadValid).toBe(true);
      expect(result.newStatus).toBe('in_progress'); // 等待审核
      expect(result.error).toBeUndefined();
    });

    test('已完成任务不能重复验证', () => {
      const result = TaskVerificationLogic.simulateVerification(
        'CONTENT_SUBMISSION',
        'completed',
        {
          taskId: 'task-1',
          taskType: 'CONTENT_SUBMISSION',
          url: 'https://example.com'
        }
      );
      expect(result.canStart).toBe(false);
      expect(result.newStatus).toBe('completed');
      expect(result.error).toBe('Task already completed or in progress');
    });

    test('无效 payload 导致验证失败', () => {
      const result = TaskVerificationLogic.simulateVerification(
        'CONTENT_SUBMISSION',
        'initial',
        {
          taskId: 'task-1',
          taskType: 'CONTENT_SUBMISSION',
          url: 'invalid-url'
        }
      );
      expect(result.canStart).toBe(true);
      expect(result.payloadValid).toBe(false);
      expect(result.newStatus).toBe('failed');
      expect(result.error).toBe('Invalid URL format');
    });
  });
});
// src/lib/api/services/taskVerificationService.ts

import { apiPost } from '../apiConfig';

// 后端统一响应格式
export interface TaskVerificationResponse {
  success: boolean;
  statusCode: number;
  data: any;  // 不同任务返回不同的数据结构
  error: null | string;
}

/**
 * 任务验证服务 - 使用统一验证接口
 */
export const taskVerificationService = {
  /**
   * 验证任务 - 统一入口
   * @param taskType 任务类型
   * @param payload 验证所需的参数对象
   * @returns 统一格式的响应
   */
  verifyTask: (taskType: string, payload: Record<string, unknown>): Promise<TaskVerificationResponse> => {
    return apiPost<TaskVerificationResponse>('/tasks/verify', {
      taskType,
      payload
    });
  }
};

export default taskVerificationService;
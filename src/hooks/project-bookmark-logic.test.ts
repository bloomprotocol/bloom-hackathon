/**
 * 项目收藏逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. 未登录用户点击收藏触发登录流程
 * 2. 登录后自动执行之前的收藏操作（待处理机制）
 * 3. 收藏/取消收藏使用乐观更新
 * 4. API 失败时回滚状态
 * 5. 防止重复点击（debounce）
 * 6. 收藏状态跨页面同步
 */

// 模拟收藏相关的业务逻辑
interface User {
  uid: number;
  wallet: string;
}

interface BookmarkState {
  isSaved: boolean;
  saveCount: number;
  isProcessing: boolean;
}

interface PendingAction {
  type: 'bookmark' | 'unbookmark';
  projectId: string;
  timestamp: number;
}

class ProjectBookmarkLogic {
  // 业务规则：检查是否可以执行收藏操作
  static canExecuteBookmark(
    isAuthenticated: boolean,
    isProcessing: boolean
  ): {
    canExecute: boolean;
    reason?: string;
  } {
    if (!isAuthenticated) {
      return { canExecute: false, reason: 'authentication_required' };
    }
    
    if (isProcessing) {
      return { canExecute: false, reason: 'operation_in_progress' };
    }
    
    return { canExecute: true };
  }

  // 业务规则：创建待处理的收藏操作
  static createPendingBookmark(
    projectId: string,
    isCurrentlySaved: boolean
  ): PendingAction {
    return {
      type: isCurrentlySaved ? 'unbookmark' : 'bookmark',
      projectId,
      timestamp: Date.now()
    };
  }

  // 业务规则：验证待处理操作是否有效（5分钟内）
  static isPendingActionValid(
    pendingAction: PendingAction | null,
    currentTime: number = Date.now()
  ): boolean {
    if (!pendingAction) return false;
    
    const FIVE_MINUTES = 5 * 60 * 1000;
    return currentTime - pendingAction.timestamp <= FIVE_MINUTES;
  }

  // 业务规则：计算乐观更新后的状态
  static calculateOptimisticState(
    currentState: BookmarkState,
    action: 'bookmark' | 'unbookmark'
  ): BookmarkState {
    if (action === 'bookmark') {
      return {
        isSaved: true,
        saveCount: currentState.saveCount + 1,
        isProcessing: true
      };
    } else {
      return {
        isSaved: false,
        saveCount: Math.max(0, currentState.saveCount - 1),
        isProcessing: true
      };
    }
  }

  // 业务规则：处理 API 响应
  static handleApiResponse(
    optimisticState: BookmarkState,
    success: boolean,
    actualSaveCount?: number
  ): BookmarkState {
    if (success) {
      // 使用服务器返回的实际数量
      return {
        ...optimisticState,
        saveCount: actualSaveCount ?? optimisticState.saveCount,
        isProcessing: false
      };
    } else {
      // 失败时回滚
      return {
        isSaved: !optimisticState.isSaved,
        saveCount: optimisticState.isSaved
          ? Math.max(0, optimisticState.saveCount - 1)
          : optimisticState.saveCount + 1,
        isProcessing: false
      };
    }
  }

  // 业务规则：构建收藏 API 请求
  static buildBookmarkRequest(
    projectId: string,
    userId: number,
    action: 'save' | 'unsave'
  ): {
    endpoint: string;
    method: string;
    body: any;
  } {
    return {
      endpoint: `/projects/${action}`,
      method: 'POST',
      body: {
        projectId,
        userId
      }
    };
  }

  // 业务规则：防抖检查
  static shouldDebounce(
    lastClickTime: number,
    currentTime: number = Date.now(),
    debounceMs: number = 500
  ): boolean {
    return currentTime - lastClickTime < debounceMs;
  }

  // 业务规则：跨页面同步收藏状态
  static createSyncEvent(
    projectId: string,
    newState: BookmarkState
  ): {
    type: string;
    detail: {
      projectId: string;
      isSaved: boolean;
      saveCount: number;
    };
  } {
    return {
      type: 'project-bookmark-sync',
      detail: {
        projectId,
        isSaved: newState.isSaved,
        saveCount: newState.saveCount
      }
    };
  }

  // 业务规则：合并多个收藏状态更新
  static mergeBookmarkUpdates(
    projectsMap: Map<string, BookmarkState>,
    updates: Array<{ projectId: string; state: BookmarkState }>
  ): Map<string, BookmarkState> {
    const newMap = new Map(projectsMap);
    
    updates.forEach(({ projectId, state }) => {
      newMap.set(projectId, state);
    });
    
    return newMap;
  }

  // 业务规则：批量收藏操作验证
  static validateBatchBookmark(
    projectIds: string[],
    maxBatchSize: number = 10
  ): {
    isValid: boolean;
    error?: string;
  } {
    if (projectIds.length === 0) {
      return { isValid: false, error: 'empty_selection' };
    }
    
    if (projectIds.length > maxBatchSize) {
      return { isValid: false, error: `exceeds_max_batch_size_${maxBatchSize}` };
    }
    
    // 检查重复
    const uniqueIds = new Set(projectIds);
    if (uniqueIds.size !== projectIds.length) {
      return { isValid: false, error: 'duplicate_project_ids' };
    }
    
    return { isValid: true };
  }
}

describe('项目收藏逻辑 - 核心业务逻辑', () => {
  describe('收藏操作权限检查', () => {
    test('未登录用户不能收藏', () => {
      const result = ProjectBookmarkLogic.canExecuteBookmark(false, false);
      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe('authentication_required');
    });

    test('正在处理中不能重复操作', () => {
      const result = ProjectBookmarkLogic.canExecuteBookmark(true, true);
      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe('operation_in_progress');
    });

    test('已登录且未处理中可以操作', () => {
      const result = ProjectBookmarkLogic.canExecuteBookmark(true, false);
      expect(result.canExecute).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('待处理操作创建', () => {
    test('未收藏状态创建收藏操作', () => {
      const pending = ProjectBookmarkLogic.createPendingBookmark('proj_123', false);
      expect(pending.type).toBe('bookmark');
      expect(pending.projectId).toBe('proj_123');
      expect(pending.timestamp).toBeGreaterThan(0);
    });

    test('已收藏状态创建取消收藏操作', () => {
      const pending = ProjectBookmarkLogic.createPendingBookmark('proj_123', true);
      expect(pending.type).toBe('unbookmark');
      expect(pending.projectId).toBe('proj_123');
    });
  });

  describe('待处理操作有效性验证', () => {
    test('5分钟内的操作有效', () => {
      const pending: PendingAction = {
        type: 'bookmark',
        projectId: 'proj_123',
        timestamp: Date.now() - 4 * 60 * 1000 // 4分钟前
      };
      
      expect(ProjectBookmarkLogic.isPendingActionValid(pending)).toBe(true);
    });

    test('超过5分钟的操作无效', () => {
      const pending: PendingAction = {
        type: 'bookmark',
        projectId: 'proj_123',
        timestamp: Date.now() - 6 * 60 * 1000 // 6分钟前
      };
      
      expect(ProjectBookmarkLogic.isPendingActionValid(pending)).toBe(false);
    });

    test('空操作无效', () => {
      expect(ProjectBookmarkLogic.isPendingActionValid(null)).toBe(false);
    });
  });

  describe('乐观更新计算', () => {
    test('收藏操作增加计数', () => {
      const currentState: BookmarkState = {
        isSaved: false,
        saveCount: 10,
        isProcessing: false
      };
      
      const newState = ProjectBookmarkLogic.calculateOptimisticState(currentState, 'bookmark');
      expect(newState.isSaved).toBe(true);
      expect(newState.saveCount).toBe(11);
      expect(newState.isProcessing).toBe(true);
    });

    test('取消收藏减少计数', () => {
      const currentState: BookmarkState = {
        isSaved: true,
        saveCount: 10,
        isProcessing: false
      };
      
      const newState = ProjectBookmarkLogic.calculateOptimisticState(currentState, 'unbookmark');
      expect(newState.isSaved).toBe(false);
      expect(newState.saveCount).toBe(9);
      expect(newState.isProcessing).toBe(true);
    });

    test('计数不会变成负数', () => {
      const currentState: BookmarkState = {
        isSaved: true,
        saveCount: 0,
        isProcessing: false
      };
      
      const newState = ProjectBookmarkLogic.calculateOptimisticState(currentState, 'unbookmark');
      expect(newState.saveCount).toBe(0);
    });
  });

  describe('API 响应处理', () => {
    test('成功响应保持乐观状态', () => {
      const optimisticState: BookmarkState = {
        isSaved: true,
        saveCount: 11,
        isProcessing: true
      };
      
      const finalState = ProjectBookmarkLogic.handleApiResponse(optimisticState, true, 11);
      expect(finalState.isSaved).toBe(true);
      expect(finalState.saveCount).toBe(11);
      expect(finalState.isProcessing).toBe(false);
    });

    test('成功响应使用服务器返回的实际数量', () => {
      const optimisticState: BookmarkState = {
        isSaved: true,
        saveCount: 11,
        isProcessing: true
      };
      
      const finalState = ProjectBookmarkLogic.handleApiResponse(optimisticState, true, 15);
      expect(finalState.saveCount).toBe(15); // 使用服务器的数据
    });

    test('失败响应回滚状态', () => {
      const optimisticState: BookmarkState = {
        isSaved: true,
        saveCount: 11,
        isProcessing: true
      };
      
      const finalState = ProjectBookmarkLogic.handleApiResponse(optimisticState, false);
      expect(finalState.isSaved).toBe(false);
      expect(finalState.saveCount).toBe(10);
      expect(finalState.isProcessing).toBe(false);
    });
  });

  describe('API 请求构建', () => {
    test('构建收藏请求', () => {
      const request = ProjectBookmarkLogic.buildBookmarkRequest('proj_123', 456, 'save');
      expect(request.endpoint).toBe('/projects/save');
      expect(request.method).toBe('POST');
      expect(request.body).toEqual({
        projectId: 'proj_123',
        userId: 456
      });
    });

    test('构建取消收藏请求', () => {
      const request = ProjectBookmarkLogic.buildBookmarkRequest('proj_123', 456, 'unsave');
      expect(request.endpoint).toBe('/projects/unsave');
      expect(request.method).toBe('POST');
    });
  });

  describe('防抖检查', () => {
    test('500ms内的点击应该被防抖', () => {
      const lastClick = Date.now() - 300; // 300ms前
      expect(ProjectBookmarkLogic.shouldDebounce(lastClick)).toBe(true);
    });

    test('超过500ms的点击不被防抖', () => {
      const lastClick = Date.now() - 600; // 600ms前
      expect(ProjectBookmarkLogic.shouldDebounce(lastClick)).toBe(false);
    });

    test('自定义防抖时间', () => {
      const lastClick = Date.now() - 150; // 150ms前
      expect(ProjectBookmarkLogic.shouldDebounce(lastClick, Date.now(), 200)).toBe(true);
      expect(ProjectBookmarkLogic.shouldDebounce(lastClick, Date.now(), 100)).toBe(false);
    });
  });

  describe('跨页面同步事件', () => {
    test('创建同步事件', () => {
      const state: BookmarkState = {
        isSaved: true,
        saveCount: 10,
        isProcessing: false
      };
      
      const event = ProjectBookmarkLogic.createSyncEvent('proj_123', state);
      expect(event.type).toBe('project-bookmark-sync');
      expect(event.detail).toEqual({
        projectId: 'proj_123',
        isSaved: true,
        saveCount: 10
      });
    });
  });

  describe('批量状态更新', () => {
    test('合并多个收藏状态', () => {
      const initialMap = new Map<string, BookmarkState>([
        ['proj_1', { isSaved: false, saveCount: 5, isProcessing: false }],
        ['proj_2', { isSaved: true, saveCount: 10, isProcessing: false }]
      ]);
      
      const updates = [
        { projectId: 'proj_1', state: { isSaved: true, saveCount: 6, isProcessing: false } as BookmarkState },
        { projectId: 'proj_3', state: { isSaved: false, saveCount: 0, isProcessing: false } as BookmarkState }
      ];
      
      const merged = ProjectBookmarkLogic.mergeBookmarkUpdates(initialMap, updates);
      
      expect(merged.get('proj_1')?.isSaved).toBe(true);
      expect(merged.get('proj_1')?.saveCount).toBe(6);
      expect(merged.get('proj_2')?.saveCount).toBe(10); // 未改变
      expect(merged.get('proj_3')?.isSaved).toBe(false);
    });

    test('不修改原始 Map', () => {
      const originalMap = new Map<string, BookmarkState>();
      const updates = [
        { projectId: 'proj_1', state: { isSaved: true, saveCount: 1, isProcessing: false } as BookmarkState }
      ];
      
      ProjectBookmarkLogic.mergeBookmarkUpdates(originalMap, updates);
      expect(originalMap.size).toBe(0);
    });
  });

  describe('批量收藏验证', () => {
    test('有效的批量收藏', () => {
      const result = ProjectBookmarkLogic.validateBatchBookmark(['proj_1', 'proj_2', 'proj_3']);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('空选择无效', () => {
      const result = ProjectBookmarkLogic.validateBatchBookmark([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('empty_selection');
    });

    test('超过最大数量限制', () => {
      const projectIds = Array(11).fill(0).map((_, i) => `proj_${i}`);
      const result = ProjectBookmarkLogic.validateBatchBookmark(projectIds);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('exceeds_max_batch_size_10');
    });

    test('包含重复ID无效', () => {
      const result = ProjectBookmarkLogic.validateBatchBookmark(['proj_1', 'proj_2', 'proj_1']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('duplicate_project_ids');
    });

    test('自定义批量大小限制', () => {
      const projectIds = ['proj_1', 'proj_2', 'proj_3'];
      const result = ProjectBookmarkLogic.validateBatchBookmark(projectIds, 2);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('exceeds_max_batch_size_2');
    });
  });
});
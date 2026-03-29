/**
 * 任务奖励计算逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. 任务组（Mission）必须全部完成才能领取奖励
 * 2. 奖励只能领取一次（防重复领取）
 * 3. 不同奖励类型有不同的处理方式（积分立即发放，NFT/Token 异步）
 * 4. 奖励金额从 reward_type 表获取
 * 5. 领取奖励后任务状态变为 CLAIMED
 */

// 模拟奖励计算的业务逻辑
type RewardType = 'POINTS' | 'NFT' | 'TOKEN';
type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'CLAIMED';

interface Reward {
  id: string;
  type: RewardType;
  amount: number;
  name: string;
}

interface Task {
  id: string;
  status: 'initial' | 'in_progress' | 'completed' | 'failed';
  missionId: string;
}

interface Mission {
  id: string;
  name: string;
  status: MissionStatus;
  tasks: Task[];
  reward_type_ids: string; // 逗号分隔的奖励 ID
  rewards: Reward[];
  claimed: boolean;
  claimed_at?: string;
  start_time?: string;
  end_time?: string;
}

interface ClaimResult {
  success: boolean;
  immediateRewards: { type: RewardType; amount: number }[];
  asyncRewards: { type: RewardType; amount: number }[];
  userPointsIncrement: number;
  error?: string;
}

class RewardCalculationLogic {
  // 业务规则：计算任务完成进度
  static calculateMissionProgress(tasks: Task[]): {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    isCompleted: boolean;
  } {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isCompleted = totalTasks > 0 && completedTasks === totalTasks;

    return {
      totalTasks,
      completedTasks,
      progressPercentage,
      isCompleted
    };
  }

  // 业务规则：检查任务组是否可以领奖
  static canClaimReward(mission: Mission, currentTime: Date = new Date()): {
    canClaim: boolean;
    reason?: string;
  } {
    // 1. 检查是否已领取
    if (mission.claimed || mission.status === 'CLAIMED') {
      return { canClaim: false, reason: 'Reward already claimed' };
    }

    // 2. 检查任务是否全部完成
    const progress = this.calculateMissionProgress(mission.tasks);
    if (!progress.isCompleted) {
      return { 
        canClaim: false, 
        reason: `Only ${progress.completedTasks}/${progress.totalTasks} tasks completed` 
      };
    }

    // 3. 检查时间限制
    if (mission.start_time) {
      const startTime = new Date(mission.start_time);
      if (currentTime < startTime) {
        return { canClaim: false, reason: 'Mission not started yet' };
      }
    }

    if (mission.end_time) {
      const endTime = new Date(mission.end_time);
      if (currentTime > endTime) {
        return { canClaim: false, reason: 'Mission expired' };
      }
    }

    return { canClaim: true };
  }

  // 业务规则：解析奖励 ID 字符串
  static parseRewardIds(rewardTypeIds: string): string[] {
    if (!rewardTypeIds || rewardTypeIds.trim() === '') {
      return [];
    }
    return rewardTypeIds.split(',').map(id => id.trim()).filter(id => id !== '');
  }

  // 业务规则：计算总奖励
  static calculateTotalRewards(
    rewardIds: string[],
    availableRewards: Reward[]
  ): {
    rewards: Reward[];
    totalPoints: number;
    totalNFTs: number;
    totalTokens: number;
  } {
    const rewards = rewardIds
      .map(id => availableRewards.find(r => r.id === id))
      .filter((r): r is Reward => r !== undefined);

    const totalPoints = rewards
      .filter(r => r.type === 'POINTS')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalNFTs = rewards
      .filter(r => r.type === 'NFT')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalTokens = rewards
      .filter(r => r.type === 'TOKEN')
      .reduce((sum, r) => sum + r.amount, 0);

    return { rewards, totalPoints, totalNFTs, totalTokens };
  }

  // 业务规则：分类奖励（立即发放 vs 异步处理）
  static categorizeRewards(rewards: Reward[]): {
    immediate: Reward[];
    async: Reward[];
  } {
    const immediate = rewards.filter(r => r.type === 'POINTS');
    const async = rewards.filter(r => r.type === 'NFT' || r.type === 'TOKEN');
    
    return { immediate, async };
  }

  // 业务规则：模拟完整的领奖流程
  static simulateClaimReward(
    mission: Mission,
    currentTime: Date = new Date()
  ): ClaimResult {
    // 1. 检查是否可以领奖
    const claimCheck = this.canClaimReward(mission, currentTime);
    if (!claimCheck.canClaim) {
      return {
        success: false,
        immediateRewards: [],
        asyncRewards: [],
        userPointsIncrement: 0,
        error: claimCheck.reason
      };
    }

    // 2. 解析奖励 ID
    const rewardIds = this.parseRewardIds(mission.reward_type_ids);
    if (rewardIds.length === 0) {
      return {
        success: false,
        immediateRewards: [],
        asyncRewards: [],
        userPointsIncrement: 0,
        error: 'No rewards configured for this mission'
      };
    }

    // 3. 计算奖励
    const rewardCalculation = this.calculateTotalRewards(rewardIds, mission.rewards);
    const { immediate, async } = this.categorizeRewards(rewardCalculation.rewards);

    // 4. 返回领奖结果
    return {
      success: true,
      immediateRewards: immediate.map(r => ({ type: r.type, amount: r.amount })),
      asyncRewards: async.map(r => ({ type: r.type, amount: r.amount })),
      userPointsIncrement: rewardCalculation.totalPoints
    };
  }

  // 业务规则：验证奖励防重复机制
  static isRewardClaimValid(
    missionId: string,
    claimedMissions: Set<string>,
    lockAcquired: boolean
  ): boolean {
    // 必须获得分布式锁
    if (!lockAcquired) {
      return false;
    }

    // 检查内存中的已领取记录（防重复）
    if (claimedMissions.has(missionId)) {
      return false;
    }

    return true;
  }
}

describe('任务奖励计算逻辑 - 核心业务逻辑', () => {
  // Mock 数据
  const mockRewards: Reward[] = [
    { id: 'reward_1', type: 'POINTS', amount: 100, name: '100 Points' },
    { id: 'reward_2', type: 'POINTS', amount: 50, name: '50 Points' },
    { id: 'reward_3', type: 'NFT', amount: 1, name: 'Special NFT' },
    { id: 'reward_4', type: 'TOKEN', amount: 10, name: '10 BLOOM' },
  ];

  const createMockMission = (overrides?: Partial<Mission>): Mission => ({
    id: 'mission_1',
    name: 'Test Mission',
    status: 'ACTIVE',
    tasks: [
      { id: 'task_1', status: 'completed', missionId: 'mission_1' },
      { id: 'task_2', status: 'completed', missionId: 'mission_1' },
    ],
    reward_type_ids: 'reward_1,reward_3',
    rewards: mockRewards,
    claimed: false,
    ...overrides
  });

  describe('任务进度计算', () => {
    test('全部完成的任务组', () => {
      const tasks: Task[] = [
        { id: 'task_1', status: 'completed', missionId: 'mission_1' },
        { id: 'task_2', status: 'completed', missionId: 'mission_1' },
        { id: 'task_3', status: 'completed', missionId: 'mission_1' },
      ];

      const progress = RewardCalculationLogic.calculateMissionProgress(tasks);
      
      expect(progress.totalTasks).toBe(3);
      expect(progress.completedTasks).toBe(3);
      expect(progress.progressPercentage).toBe(100);
      expect(progress.isCompleted).toBe(true);
    });

    test('部分完成的任务组', () => {
      const tasks: Task[] = [
        { id: 'task_1', status: 'completed', missionId: 'mission_1' },
        { id: 'task_2', status: 'in_progress', missionId: 'mission_1' },
        { id: 'task_3', status: 'initial', missionId: 'mission_1' },
      ];

      const progress = RewardCalculationLogic.calculateMissionProgress(tasks);
      
      expect(progress.totalTasks).toBe(3);
      expect(progress.completedTasks).toBe(1);
      expect(progress.progressPercentage).toBe(33);
      expect(progress.isCompleted).toBe(false);
    });

    test('空任务组', () => {
      const progress = RewardCalculationLogic.calculateMissionProgress([]);
      
      expect(progress.totalTasks).toBe(0);
      expect(progress.completedTasks).toBe(0);
      expect(progress.progressPercentage).toBe(0);
      expect(progress.isCompleted).toBe(false);
    });

    test('有失败任务的任务组', () => {
      const tasks: Task[] = [
        { id: 'task_1', status: 'completed', missionId: 'mission_1' },
        { id: 'task_2', status: 'failed', missionId: 'mission_1' },
      ];

      const progress = RewardCalculationLogic.calculateMissionProgress(tasks);
      
      expect(progress.completedTasks).toBe(1);
      expect(progress.isCompleted).toBe(false);
    });
  });

  describe('领奖条件检查', () => {
    test('已完成未领取的任务可以领奖', () => {
      const mission = createMockMission();
      const result = RewardCalculationLogic.canClaimReward(mission);
      
      expect(result.canClaim).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('已领取的任务不能重复领奖', () => {
      const mission = createMockMission({ claimed: true });
      const result = RewardCalculationLogic.canClaimReward(mission);
      
      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Reward already claimed');
    });

    test('状态为 CLAIMED 的任务不能重复领奖', () => {
      const mission = createMockMission({ status: 'CLAIMED' });
      const result = RewardCalculationLogic.canClaimReward(mission);
      
      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Reward already claimed');
    });

    test('未完成全部任务不能领奖', () => {
      const mission = createMockMission({
        tasks: [
          { id: 'task_1', status: 'completed', missionId: 'mission_1' },
          { id: 'task_2', status: 'in_progress', missionId: 'mission_1' },
        ]
      });
      const result = RewardCalculationLogic.canClaimReward(mission);
      
      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Only 1/2 tasks completed');
    });

    test('未开始的任务不能领奖', () => {
      const futureTime = new Date('2025-12-31');
      const mission = createMockMission({ start_time: futureTime.toISOString() });
      const currentTime = new Date('2025-06-24');
      
      const result = RewardCalculationLogic.canClaimReward(mission, currentTime);
      
      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Mission not started yet');
    });

    test('已过期的任务不能领奖', () => {
      const pastTime = new Date('2025-01-01');
      const mission = createMockMission({ end_time: pastTime.toISOString() });
      const currentTime = new Date('2025-06-24');
      
      const result = RewardCalculationLogic.canClaimReward(mission, currentTime);
      
      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Mission expired');
    });
  });

  describe('奖励 ID 解析', () => {
    test('正常的逗号分隔 ID', () => {
      const ids = RewardCalculationLogic.parseRewardIds('reward_1,reward_2,reward_3');
      expect(ids).toEqual(['reward_1', 'reward_2', 'reward_3']);
    });

    test('包含空格的 ID', () => {
      const ids = RewardCalculationLogic.parseRewardIds('reward_1, reward_2 , reward_3');
      expect(ids).toEqual(['reward_1', 'reward_2', 'reward_3']);
    });

    test('空字符串返回空数组', () => {
      expect(RewardCalculationLogic.parseRewardIds('')).toEqual([]);
      expect(RewardCalculationLogic.parseRewardIds('  ')).toEqual([]);
    });

    test('过滤空 ID', () => {
      const ids = RewardCalculationLogic.parseRewardIds('reward_1,,reward_2,');
      expect(ids).toEqual(['reward_1', 'reward_2']);
    });
  });

  describe('奖励计算', () => {
    test('计算多种类型奖励总和', () => {
      const rewardIds = ['reward_1', 'reward_2', 'reward_3', 'reward_4'];
      const result = RewardCalculationLogic.calculateTotalRewards(rewardIds, mockRewards);
      
      expect(result.totalPoints).toBe(150); // 100 + 50
      expect(result.totalNFTs).toBe(1);
      expect(result.totalTokens).toBe(10);
      expect(result.rewards).toHaveLength(4);
    });

    test('只计算存在的奖励', () => {
      const rewardIds = ['reward_1', 'reward_999']; // reward_999 不存在
      const result = RewardCalculationLogic.calculateTotalRewards(rewardIds, mockRewards);
      
      expect(result.rewards).toHaveLength(1);
      expect(result.totalPoints).toBe(100);
    });

    test('空奖励列表', () => {
      const result = RewardCalculationLogic.calculateTotalRewards([], mockRewards);
      
      expect(result.rewards).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
      expect(result.totalNFTs).toBe(0);
      expect(result.totalTokens).toBe(0);
    });
  });

  describe('奖励分类', () => {
    test('积分奖励归类为立即发放', () => {
      const rewards = mockRewards.filter(r => r.type === 'POINTS');
      const result = RewardCalculationLogic.categorizeRewards(rewards);
      
      expect(result.immediate).toHaveLength(2);
      expect(result.async).toHaveLength(0);
    });

    test('NFT 和 Token 归类为异步处理', () => {
      const rewards = mockRewards.filter(r => r.type === 'NFT' || r.type === 'TOKEN');
      const result = RewardCalculationLogic.categorizeRewards(rewards);
      
      expect(result.immediate).toHaveLength(0);
      expect(result.async).toHaveLength(2);
    });

    test('混合奖励正确分类', () => {
      const result = RewardCalculationLogic.categorizeRewards(mockRewards);
      
      expect(result.immediate).toHaveLength(2);
      expect(result.async).toHaveLength(2);
    });
  });

  describe('完整领奖流程', () => {
    test('成功领取积分和 NFT 奖励', () => {
      const mission = createMockMission();
      const result = RewardCalculationLogic.simulateClaimReward(mission);
      
      expect(result.success).toBe(true);
      expect(result.immediateRewards).toHaveLength(1);
      expect(result.immediateRewards[0]).toEqual({ type: 'POINTS', amount: 100 });
      expect(result.asyncRewards).toHaveLength(1);
      expect(result.asyncRewards[0]).toEqual({ type: 'NFT', amount: 1 });
      expect(result.userPointsIncrement).toBe(100);
      expect(result.error).toBeUndefined();
    });

    test('任务未完成无法领奖', () => {
      const mission = createMockMission({
        tasks: [
          { id: 'task_1', status: 'completed', missionId: 'mission_1' },
          { id: 'task_2', status: 'initial', missionId: 'mission_1' },
        ]
      });
      const result = RewardCalculationLogic.simulateClaimReward(mission);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Only 1/2 tasks completed');
      expect(result.userPointsIncrement).toBe(0);
    });

    test('已领取的任务返回错误', () => {
      const mission = createMockMission({ claimed: true });
      const result = RewardCalculationLogic.simulateClaimReward(mission);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Reward already claimed');
    });

    test('无奖励配置返回错误', () => {
      const mission = createMockMission({ reward_type_ids: '' });
      const result = RewardCalculationLogic.simulateClaimReward(mission);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No rewards configured for this mission');
    });

    test('只有积分奖励的任务', () => {
      const mission = createMockMission({ reward_type_ids: 'reward_1,reward_2' });
      const result = RewardCalculationLogic.simulateClaimReward(mission);
      
      expect(result.success).toBe(true);
      expect(result.immediateRewards).toHaveLength(2);
      expect(result.asyncRewards).toHaveLength(0);
      expect(result.userPointsIncrement).toBe(150);
    });
  });

  describe('防重复领奖机制', () => {
    test('获得锁且未领取过可以领奖', () => {
      const claimedMissions = new Set<string>();
      const isValid = RewardCalculationLogic.isRewardClaimValid(
        'mission_1',
        claimedMissions,
        true
      );
      
      expect(isValid).toBe(true);
    });

    test('未获得锁不能领奖', () => {
      const claimedMissions = new Set<string>();
      const isValid = RewardCalculationLogic.isRewardClaimValid(
        'mission_1',
        claimedMissions,
        false
      );
      
      expect(isValid).toBe(false);
    });

    test('已在内存中记录的任务不能重复领奖', () => {
      const claimedMissions = new Set(['mission_1']);
      const isValid = RewardCalculationLogic.isRewardClaimValid(
        'mission_1',
        claimedMissions,
        true
      );
      
      expect(isValid).toBe(false);
    });
  });
});
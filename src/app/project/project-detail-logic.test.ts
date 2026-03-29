/**
 * 项目详情页核心逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. Tab 切换和内容显示（Overview, Team, Roadmap, Tokenomics, Reviews）
 * 2. 评论系统：创建、回复、点赞（2层嵌套限制）
 * 3. 分享功能：包含推荐码
 * 4. 登录后自动执行待处理的评论/点赞
 * 5. 评论无限滚动加载
 * 6. 项目状态标签显示
 */

// 模拟项目详情页的业务逻辑
type TabType = 'overview' | 'team' | 'roadmap' | 'tokenomics' | 'reviews';
type ProjectStatus = 'vote' | 'proof' | 'pre_sale' | 'launch' | 'completed';

interface Review {
  id: string;
  content: string;
  userId: number;
  userName: string;
  createdAt: string;
  helpfulVotes: number;
  isHelpful?: boolean;
  parentId: string | null;
  level: number;
  replies?: Review[];
}

interface ProjectDetail {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  teamMembers: Array<{ name: string; role: string }>;
  roadmap: Array<{ phase: string; date: string; completed: boolean }>;
  tokenomics: { supply: string; distribution: any };
  reviewsCount: number;
}

interface PendingReviewAction {
  type: 'create_review' | 'vote_helpful';
  content?: string;
  parentId?: string;
  reviewId?: string;
  timestamp: number;
}

class ProjectDetailLogic {
  // 业务规则：验证 Tab 切换
  static isValidTab(tab: string): tab is TabType {
    const validTabs = ['overview', 'team', 'roadmap', 'tokenomics', 'reviews'];
    return validTabs.includes(tab);
  }

  // 业务规则：根据项目状态决定可用的 Tab
  static getAvailableTabs(status: ProjectStatus): TabType[] {
    const baseTabs: TabType[] = ['overview', 'reviews'];
    
    // 根据状态添加额外 tab
    if (status !== 'vote') {
      baseTabs.push('team');
    }
    
    if (status === 'pre_sale' || status === 'launch' || status === 'completed') {
      baseTabs.push('roadmap', 'tokenomics');
    }
    
    return baseTabs;
  }

  // 业务规则：验证评论嵌套层级（最多2层）
  static canReplyToReview(review: Review): boolean {
    return review.level < 2;
  }

  // 业务规则：构建评论树结构
  static buildReviewTree(flatReviews: Review[]): Review[] {
    const reviewMap = new Map<string, Review>();
    const rootReviews: Review[] = [];
    
    // 第一遍：创建映射
    flatReviews.forEach(review => {
      reviewMap.set(review.id, { ...review, replies: [] });
    });
    
    // 第二遍：构建树
    flatReviews.forEach(review => {
      const reviewNode = reviewMap.get(review.id)!;
      
      if (review.parentId && reviewMap.has(review.parentId)) {
        const parent = reviewMap.get(review.parentId)!;
        parent.replies!.push(reviewNode);
      } else if (!review.parentId) {
        rootReviews.push(reviewNode);
      }
    });
    
    return rootReviews;
  }

  // 业务规则：计算评论的显示层级
  static calculateReviewLevel(review: Review, allReviews: Review[]): number {
    let level = 0;
    let currentReview = review;
    
    while (currentReview.parentId && level < 2) {
      const parent = allReviews.find(r => r.id === currentReview.parentId);
      if (!parent) break;
      
      level++;
      currentReview = parent;
    }
    
    return Math.min(level, 2); // 最多2层
  }

  // 业务规则：创建待处理的评论操作
  static createPendingReviewAction(
    type: 'create_review',
    content: string,
    parentId?: string
  ): PendingReviewAction;
  static createPendingReviewAction(
    type: 'vote_helpful',
    content: undefined,
    reviewId: string
  ): PendingReviewAction;
  static createPendingReviewAction(
    type: 'create_review' | 'vote_helpful',
    content?: string,
    idParam?: string
  ): PendingReviewAction {
    if (type === 'create_review') {
      return {
        type,
        content,
        parentId: idParam,
        timestamp: Date.now()
      };
    } else {
      return {
        type,
        reviewId: idParam,
        timestamp: Date.now()
      };
    }
  }

  // 业务规则：生成分享链接（包含推荐码）
  static generateShareUrl(
    projectName: string,
    referralCode?: string,
    baseUrl: string = 'https://bloom-protocol.com'
  ): string {
    const encodedName = encodeURIComponent(projectName.toLowerCase().replace(/\s+/g, '-'));
    const projectUrl = `${baseUrl}/project/${encodedName}`;
    
    if (referralCode) {
      return `${projectUrl}?ref=${referralCode}`;
    }
    
    return projectUrl;
  }

  // 业务规则：评论内容验证
  static validateReviewContent(content: string): {
    isValid: boolean;
    error?: string;
  } {
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'content_required' };
    }
    
    if (trimmed.length < 10) {
      return { isValid: false, error: 'content_too_short' };
    }
    
    if (trimmed.length > 1000) {
      return { isValid: false, error: 'content_too_long' };
    }
    
    return { isValid: true };
  }

  // 业务规则：评论排序（最新优先，但回复保持在父评论下）
  static sortReviews(reviews: Review[]): Review[] {
    // 先按时间排序根评论
    const sorted = [...reviews]
      .filter(r => !r.parentId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    // 递归排序回复
    const sortReplies = (replies: Review[] | undefined): Review[] | undefined => {
      if (!replies || replies.length === 0) return replies;
      
      return [...replies].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() // 回复按时间正序
      );
    };
    
    return sorted.map(review => ({
      ...review,
      replies: sortReplies(review.replies)
    }));
  }

  // 业务规则：检查用户是否可以编辑/删除评论
  static canEditReview(
    review: Review,
    currentUserId: number | null,
    reviewAge: number = Date.now() - new Date(review.createdAt).getTime()
  ): boolean {
    if (!currentUserId) return false;
    if (review.userId !== currentUserId) return false;
    
    // 只能在5分钟内编辑
    const FIVE_MINUTES = 5 * 60 * 1000;
    return reviewAge <= FIVE_MINUTES;
  }

  // 业务规则：计算评论统计
  static calculateReviewStats(reviews: Review[]): {
    totalCount: number;
    userCount: number;
    averageLength: number;
    mostActiveUser: { userId: number; count: number } | null;
  } {
    if (reviews.length === 0) {
      return {
        totalCount: 0,
        userCount: 0,
        averageLength: 0,
        mostActiveUser: null
      };
    }
    
    const userReviewCount = new Map<number, number>();
    let totalLength = 0;
    
    const countReviews = (reviewList: Review[]) => {
      reviewList.forEach(review => {
        userReviewCount.set(
          review.userId,
          (userReviewCount.get(review.userId) || 0) + 1
        );
        totalLength += review.content.length;
        
        if (review.replies) {
          countReviews(review.replies);
        }
      });
    };
    
    countReviews(reviews);
    
    const totalCount = Array.from(userReviewCount.values()).reduce((a, b) => a + b, 0);
    const mostActiveEntry = Array.from(userReviewCount.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalCount,
      userCount: userReviewCount.size,
      averageLength: Math.round(totalLength / totalCount),
      mostActiveUser: mostActiveEntry 
        ? { userId: mostActiveEntry[0], count: mostActiveEntry[1] }
        : null
    };
  }

  // 业务规则：无限滚动分页
  static getReviewsPage(
    allReviews: Review[],
    page: number,
    pageSize: number = 10
  ): {
    reviews: Review[];
    hasMore: boolean;
    nextPage: number | null;
  } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageReviews = allReviews.slice(start, end);
    const hasMore = end < allReviews.length;
    
    return {
      reviews: pageReviews,
      hasMore,
      nextPage: hasMore ? page + 1 : null
    };
  }
}

describe('项目详情页核心逻辑', () => {
  // Mock 数据
  const mockReviews: Review[] = [
    {
      id: 'r1',
      content: 'Great project with solid fundamentals',
      userId: 1,
      userName: 'Alice',
      createdAt: '2025-06-20T10:00:00Z',
      helpfulVotes: 5,
      parentId: null,
      level: 0
    },
    {
      id: 'r2',
      content: 'I agree, the tokenomics look promising',
      userId: 2,
      userName: 'Bob',
      createdAt: '2025-06-20T11:00:00Z',
      helpfulVotes: 2,
      parentId: 'r1',
      level: 1
    },
    {
      id: 'r3',
      content: 'Thanks for the detailed analysis',
      userId: 3,
      userName: 'Charlie',
      createdAt: '2025-06-20T12:00:00Z',
      helpfulVotes: 1,
      parentId: 'r2',
      level: 2
    },
    {
      id: 'r4',
      content: 'Another top-level review',
      userId: 1,
      userName: 'Alice',
      createdAt: '2025-06-21T10:00:00Z',
      helpfulVotes: 3,
      parentId: null,
      level: 0
    }
  ];

  describe('Tab 验证和可用性', () => {
    test('验证有效的 Tab', () => {
      expect(ProjectDetailLogic.isValidTab('overview')).toBe(true);
      expect(ProjectDetailLogic.isValidTab('team')).toBe(true);
      expect(ProjectDetailLogic.isValidTab('roadmap')).toBe(true);
      expect(ProjectDetailLogic.isValidTab('tokenomics')).toBe(true);
      expect(ProjectDetailLogic.isValidTab('reviews')).toBe(true);
    });

    test('验证无效的 Tab', () => {
      expect(ProjectDetailLogic.isValidTab('invalid')).toBe(false);
      expect(ProjectDetailLogic.isValidTab('')).toBe(false);
    });

    test('vote 状态只有基础 Tab', () => {
      const tabs = ProjectDetailLogic.getAvailableTabs('vote');
      expect(tabs).toEqual(['overview', 'reviews']);
    });

    test('proof 状态添加 team Tab', () => {
      const tabs = ProjectDetailLogic.getAvailableTabs('proof');
      expect(tabs).toContain('team');
      expect(tabs).not.toContain('roadmap');
      expect(tabs).not.toContain('tokenomics');
    });

    test('launch 状态有所有 Tab', () => {
      const tabs = ProjectDetailLogic.getAvailableTabs('launch');
      expect(tabs).toHaveLength(5);
      expect(tabs).toContain('overview');
      expect(tabs).toContain('team');
      expect(tabs).toContain('roadmap');
      expect(tabs).toContain('tokenomics');
      expect(tabs).toContain('reviews');
    });
  });

  describe('评论嵌套限制', () => {
    test('可以回复顶级评论', () => {
      const topLevel: Review = { ...mockReviews[0], level: 0 };
      expect(ProjectDetailLogic.canReplyToReview(topLevel)).toBe(true);
    });

    test('可以回复一级评论', () => {
      const firstLevel: Review = { ...mockReviews[1], level: 1 };
      expect(ProjectDetailLogic.canReplyToReview(firstLevel)).toBe(true);
    });

    test('不能回复二级评论', () => {
      const secondLevel: Review = { ...mockReviews[2], level: 2 };
      expect(ProjectDetailLogic.canReplyToReview(secondLevel)).toBe(false);
    });
  });

  describe('评论树构建', () => {
    test('正确构建评论树结构', () => {
      const tree = ProjectDetailLogic.buildReviewTree(mockReviews);
      
      expect(tree).toHaveLength(2); // 2个顶级评论
      expect(tree[0].id).toBe('r1');
      expect(tree[0].replies).toHaveLength(1);
      expect(tree[0].replies![0].id).toBe('r2');
      expect(tree[0].replies![0].replies).toHaveLength(1);
      expect(tree[0].replies![0].replies![0].id).toBe('r3');
    });

    test('空评论列表返回空树', () => {
      const tree = ProjectDetailLogic.buildReviewTree([]);
      expect(tree).toEqual([]);
    });

    test('孤立的回复不显示在树中', () => {
      const reviews = [
        { ...mockReviews[1], parentId: 'non-existent' }
      ];
      const tree = ProjectDetailLogic.buildReviewTree(reviews);
      expect(tree).toHaveLength(0);
    });
  });

  describe('评论层级计算', () => {
    test('顶级评论层级为0', () => {
      const level = ProjectDetailLogic.calculateReviewLevel(mockReviews[0], mockReviews);
      expect(level).toBe(0);
    });

    test('一级回复层级为1', () => {
      const level = ProjectDetailLogic.calculateReviewLevel(mockReviews[1], mockReviews);
      expect(level).toBe(1);
    });

    test('二级回复层级为2', () => {
      const level = ProjectDetailLogic.calculateReviewLevel(mockReviews[2], mockReviews);
      expect(level).toBe(2);
    });

    test('超过2层的回复仍返回2', () => {
      const deepReply: Review = {
        ...mockReviews[0],
        id: 'r5',
        parentId: 'r3'
      };
      const reviews = [...mockReviews, deepReply];
      const level = ProjectDetailLogic.calculateReviewLevel(deepReply, reviews);
      expect(level).toBe(2);
    });
  });

  describe('待处理评论操作', () => {
    test('创建评论操作', () => {
      const action = ProjectDetailLogic.createPendingReviewAction(
        'create_review',
        'This is my review'
      );
      
      expect(action.type).toBe('create_review');
      expect(action.content).toBe('This is my review');
      expect(action.parentId).toBeUndefined();
      expect(action.timestamp).toBeGreaterThan(0);
    });

    test('创建回复操作', () => {
      const action = ProjectDetailLogic.createPendingReviewAction(
        'create_review',
        'This is my reply',
        'r1'
      );
      
      expect(action.parentId).toBe('r1');
    });

    test('创建点赞操作', () => {
      const action = ProjectDetailLogic.createPendingReviewAction(
        'vote_helpful',
        undefined,
        'r1'
      );
      
      expect(action.type).toBe('vote_helpful');
      expect(action.reviewId).toBe('r1');
      expect(action.content).toBeUndefined();
    });
  });

  describe('分享链接生成', () => {
    test('生成基础分享链接', () => {
      const url = ProjectDetailLogic.generateShareUrl('DeFi Protocol');
      expect(url).toBe('https://bloom-protocol.com/project/defi-protocol');
    });

    test('生成带推荐码的分享链接', () => {
      const url = ProjectDetailLogic.generateShareUrl('DeFi Protocol', 'ABC123');
      expect(url).toBe('https://bloom-protocol.com/project/defi-protocol?ref=ABC123');
    });

    test('处理特殊字符的项目名', () => {
      const url = ProjectDetailLogic.generateShareUrl('Web3 & DeFi');
      expect(url).toBe('https://bloom-protocol.com/project/web3-%26-defi');
    });
  });

  describe('评论内容验证', () => {
    test('有效的评论内容', () => {
      const result = ProjectDetailLogic.validateReviewContent('This is a valid review content');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('空内容无效', () => {
      const result = ProjectDetailLogic.validateReviewContent('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('content_required');
    });

    test('内容太短', () => {
      const result = ProjectDetailLogic.validateReviewContent('Too short');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('content_too_short');
    });

    test('内容太长', () => {
      const longContent = 'a'.repeat(1001);
      const result = ProjectDetailLogic.validateReviewContent(longContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('content_too_long');
    });
  });

  describe('评论排序', () => {
    test('顶级评论按最新优先排序', () => {
      const sorted = ProjectDetailLogic.sortReviews(mockReviews);
      expect(sorted[0].id).toBe('r4'); // 最新的
      expect(sorted[1].id).toBe('r1'); // 较旧的
    });

    test('回复保持在父评论下且按时间正序', () => {
      const sorted = ProjectDetailLogic.sortReviews(
        ProjectDetailLogic.buildReviewTree(mockReviews)
      );
      
      const firstReview = sorted.find(r => r.id === 'r1');
      expect(firstReview?.replies?.[0].id).toBe('r2');
    });
  });

  describe('评论编辑权限', () => {
    test('作者可以在5分钟内编辑', () => {
      const fourMinutesAgo = 4 * 60 * 1000;
      const canEdit = ProjectDetailLogic.canEditReview(mockReviews[0], 1, fourMinutesAgo);
      expect(canEdit).toBe(true);
    });

    test('超过5分钟不能编辑', () => {
      const sixMinutesAgo = 6 * 60 * 1000;
      const canEdit = ProjectDetailLogic.canEditReview(mockReviews[0], 1, sixMinutesAgo);
      expect(canEdit).toBe(false);
    });

    test('非作者不能编辑', () => {
      const canEdit = ProjectDetailLogic.canEditReview(mockReviews[0], 2, 1000);
      expect(canEdit).toBe(false);
    });

    test('未登录不能编辑', () => {
      const canEdit = ProjectDetailLogic.canEditReview(mockReviews[0], null, 1000);
      expect(canEdit).toBe(false);
    });
  });

  describe('评论统计', () => {
    test('计算评论统计信息', () => {
      const tree = ProjectDetailLogic.buildReviewTree(mockReviews);
      const stats = ProjectDetailLogic.calculateReviewStats(tree);
      
      expect(stats.totalCount).toBe(4);
      expect(stats.userCount).toBe(3);
      expect(stats.averageLength).toBeGreaterThan(0);
      expect(stats.mostActiveUser).toEqual({ userId: 1, count: 2 });
    });

    test('空评论列表的统计', () => {
      const stats = ProjectDetailLogic.calculateReviewStats([]);
      expect(stats.totalCount).toBe(0);
      expect(stats.userCount).toBe(0);
      expect(stats.averageLength).toBe(0);
      expect(stats.mostActiveUser).toBeNull();
    });
  });

  describe('无限滚动分页', () => {
    test('获取第一页评论', () => {
      const page = ProjectDetailLogic.getReviewsPage(mockReviews, 1, 2);
      expect(page.reviews).toHaveLength(2);
      expect(page.reviews[0].id).toBe('r1');
      expect(page.hasMore).toBe(true);
      expect(page.nextPage).toBe(2);
    });

    test('获取最后一页评论', () => {
      const page = ProjectDetailLogic.getReviewsPage(mockReviews, 2, 2);
      expect(page.reviews).toHaveLength(2);
      expect(page.hasMore).toBe(false);
      expect(page.nextPage).toBeNull();
    });

    test('超出范围返回空数组', () => {
      const page = ProjectDetailLogic.getReviewsPage(mockReviews, 10, 2);
      expect(page.reviews).toHaveLength(0);
      expect(page.hasMore).toBe(false);
    });
  });
});
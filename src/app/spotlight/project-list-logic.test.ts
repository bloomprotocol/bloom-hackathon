/**
 * 项目列表页核心逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. 项目列表分页展示，每页 12 个项目
 * 2. 支持按状态筛选（All, Vote, Proof, Pre Sale, Launch）
 * 3. 未登录用户可以浏览但收藏需要登录
 * 4. 收藏数实时更新
 * 5. 点击项目卡片导航到详情页
 */

// 模拟项目列表的业务逻辑
type ProjectStatus = 'vote' | 'proof' | 'pre_sale' | 'launch' | 'completed';

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  saves: number;
  isSaved?: boolean;
  createdAt: string;
}

interface ProjectListFilter {
  status: 'all' | ProjectStatus;
  page: number;
  limit: number;
}

interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  totalPages: number;
}

class ProjectListLogic {
  // 业务规则：筛选项目列表
  static filterProjects(
    projects: Project[],
    filter: 'all' | ProjectStatus
  ): Project[] {
    if (filter === 'all') {
      return projects;
    }
    return projects.filter(p => p.status === filter);
  }

  // 业务规则：分页逻辑
  static paginateProjects(
    projects: Project[],
    page: number,
    limit: number = 12
  ): {
    items: Project[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = projects.slice(start, end);
    const totalPages = Math.ceil(projects.length / limit);

    return {
      items,
      total: projects.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  // 业务规则：构建项目详情页 URL
  static buildProjectDetailUrl(projectName: string): string {
    // 项目名称需要 URL 编码
    const encodedName = encodeURIComponent(projectName.toLowerCase().replace(/\s+/g, '-'));
    return `/project/${encodedName}`;
  }

  // 业务规则：处理收藏操作（未登录用户）
  static handleUnauthenticatedBookmark(): {
    shouldShowLoginModal: boolean;
    pendingAction: string;
  } {
    return {
      shouldShowLoginModal: true,
      pendingAction: 'bookmark_project'
    };
  }

  // 业务规则：更新项目收藏状态（乐观更新）
  static updateProjectSaveStatus(
    projects: Project[],
    projectId: string,
    isSaved: boolean
  ): Project[] {
    return projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          isSaved,
          saves: isSaved ? project.saves + 1 : Math.max(0, project.saves - 1)
        };
      }
      return project;
    });
  }

  // 业务规则：验证筛选选项
  static isValidFilter(filter: string): filter is 'all' | ProjectStatus {
    const validFilters = ['all', 'vote', 'proof', 'pre_sale', 'launch'];
    return validFilters.includes(filter);
  }

  // 业务规则：计算页面导航信息
  static calculatePaginationInfo(
    currentPage: number,
    totalPages: number,
    maxVisiblePages: number = 5
  ): {
    pages: number[];
    showLeftEllipsis: boolean;
    showRightEllipsis: boolean;
  } {
    const pages: number[] = [];
    let showLeftEllipsis = false;
    let showRightEllipsis = false;

    if (totalPages <= maxVisiblePages) {
      // 显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 需要省略号
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfVisible + 1) {
        // 靠近开始
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pages.push(i);
        }
        showRightEllipsis = true;
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        // 靠近结尾
        pages.push(1);
        showLeftEllipsis = true;
        for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 在中间
        pages.push(1);
        showLeftEllipsis = true;
        
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          pages.push(i);
        }
        
        showRightEllipsis = true;
        pages.push(totalPages);
      }
    }

    return { pages, showLeftEllipsis, showRightEllipsis };
  }

  // 业务规则：排序项目（最新优先）
  static sortProjectsByDate(projects: Project[]): Project[] {
    return [...projects].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

describe('项目列表页核心逻辑', () => {
  // Mock 数据
  const mockProjects: Project[] = [
    { id: '1', name: 'DeFi Protocol', status: 'vote', saves: 10, createdAt: '2025-06-01' },
    { id: '2', name: 'NFT Marketplace', status: 'proof', saves: 25, createdAt: '2025-06-02' },
    { id: '3', name: 'GameFi Platform', status: 'pre_sale', saves: 50, createdAt: '2025-06-03' },
    { id: '4', name: 'DAO Tools', status: 'launch', saves: 100, createdAt: '2025-06-04' },
    { id: '5', name: 'DeFi 2.0', status: 'vote', saves: 5, createdAt: '2025-06-05' },
    { id: '6', name: 'Metaverse', status: 'proof', saves: 30, createdAt: '2025-06-06' },
    { id: '7', name: 'SocialFi', status: 'pre_sale', saves: 40, createdAt: '2025-06-07' },
    { id: '8', name: 'Web3 Infra', status: 'launch', saves: 80, createdAt: '2025-06-08' },
    { id: '9', name: 'Layer2', status: 'vote', saves: 15, createdAt: '2025-06-09' },
    { id: '10', name: 'Cross-chain', status: 'proof', saves: 20, createdAt: '2025-06-10' },
    { id: '11', name: 'Privacy', status: 'pre_sale', saves: 35, createdAt: '2025-06-11' },
    { id: '12', name: 'Oracle', status: 'launch', saves: 90, createdAt: '2025-06-12' },
    { id: '13', name: 'DEX', status: 'vote', saves: 12, createdAt: '2025-06-13' },
  ];

  describe('项目筛选', () => {
    test('显示所有项目', () => {
      const filtered = ProjectListLogic.filterProjects(mockProjects, 'all');
      expect(filtered).toHaveLength(13);
      expect(filtered).toEqual(mockProjects);
    });

    test('按 vote 状态筛选', () => {
      const filtered = ProjectListLogic.filterProjects(mockProjects, 'vote');
      expect(filtered).toHaveLength(4);
      expect(filtered.every(p => p.status === 'vote')).toBe(true);
    });

    test('按 proof 状态筛选', () => {
      const filtered = ProjectListLogic.filterProjects(mockProjects, 'proof');
      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.status === 'proof')).toBe(true);
    });

    test('按 pre_sale 状态筛选', () => {
      const filtered = ProjectListLogic.filterProjects(mockProjects, 'pre_sale');
      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.status === 'pre_sale')).toBe(true);
    });

    test('按 launch 状态筛选', () => {
      const filtered = ProjectListLogic.filterProjects(mockProjects, 'launch');
      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.status === 'launch')).toBe(true);
    });

    test('空列表筛选返回空数组', () => {
      const filtered = ProjectListLogic.filterProjects([], 'vote');
      expect(filtered).toEqual([]);
    });
  });

  describe('分页逻辑', () => {
    test('第一页显示前12个项目', () => {
      const result = ProjectListLogic.paginateProjects(mockProjects, 1);
      expect(result.items).toHaveLength(12);
      expect(result.items[0].id).toBe('1');
      expect(result.items[11].id).toBe('12');
      expect(result.total).toBe(13);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });

    test('第二页显示剩余项目', () => {
      const result = ProjectListLogic.paginateProjects(mockProjects, 2);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('13');
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
    });

    test('自定义每页数量', () => {
      const result = ProjectListLogic.paginateProjects(mockProjects, 1, 5);
      expect(result.items).toHaveLength(5);
      expect(result.totalPages).toBe(3);
    });

    test('超出范围的页码返回空数组', () => {
      const result = ProjectListLogic.paginateProjects(mockProjects, 10);
      expect(result.items).toHaveLength(0);
    });

    test('空列表分页', () => {
      const result = ProjectListLogic.paginateProjects([], 1);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });
  });

  describe('项目详情页 URL 生成', () => {
    test('普通项目名称', () => {
      const url = ProjectListLogic.buildProjectDetailUrl('DeFi Protocol');
      expect(url).toBe('/project/defi-protocol');
    });

    test('包含特殊字符的项目名称', () => {
      const url = ProjectListLogic.buildProjectDetailUrl('DeFi 2.0 & NFT');
      expect(url).toBe('/project/defi-2.0-%26-nft');
    });

    test('多个空格转换为单个连字符', () => {
      const url = ProjectListLogic.buildProjectDetailUrl('Web3   Social   Platform');
      expect(url).toBe('/project/web3-social-platform');
    });
  });

  describe('未登录用户收藏处理', () => {
    test('触发登录弹窗并记录待处理操作', () => {
      const result = ProjectListLogic.handleUnauthenticatedBookmark();
      expect(result.shouldShowLoginModal).toBe(true);
      expect(result.pendingAction).toBe('bookmark_project');
    });
  });

  describe('收藏状态更新（乐观更新）', () => {
    test('收藏项目增加收藏数', () => {
      const projects = [
        { id: '1', name: 'Test', status: 'vote' as ProjectStatus, saves: 10, isSaved: false, createdAt: '2025-06-01' }
      ];
      
      const updated = ProjectListLogic.updateProjectSaveStatus(projects, '1', true);
      expect(updated[0].isSaved).toBe(true);
      expect(updated[0].saves).toBe(11);
    });

    test('取消收藏减少收藏数', () => {
      const projects = [
        { id: '1', name: 'Test', status: 'vote' as ProjectStatus, saves: 10, isSaved: true, createdAt: '2025-06-01' }
      ];
      
      const updated = ProjectListLogic.updateProjectSaveStatus(projects, '1', false);
      expect(updated[0].isSaved).toBe(false);
      expect(updated[0].saves).toBe(9);
    });

    test('收藏数不会变成负数', () => {
      const projects = [
        { id: '1', name: 'Test', status: 'vote' as ProjectStatus, saves: 0, isSaved: true, createdAt: '2025-06-01' }
      ];
      
      const updated = ProjectListLogic.updateProjectSaveStatus(projects, '1', false);
      expect(updated[0].saves).toBe(0);
    });

    test('只更新目标项目', () => {
      const projects = [
        { id: '1', name: 'Test1', status: 'vote' as ProjectStatus, saves: 10, createdAt: '2025-06-01' },
        { id: '2', name: 'Test2', status: 'vote' as ProjectStatus, saves: 20, createdAt: '2025-06-02' }
      ];
      
      const updated = ProjectListLogic.updateProjectSaveStatus(projects, '1', true);
      expect(updated[0].saves).toBe(11);
      expect(updated[1].saves).toBe(20); // 不变
    });
  });

  describe('筛选选项验证', () => {
    test('有效的筛选选项', () => {
      expect(ProjectListLogic.isValidFilter('all')).toBe(true);
      expect(ProjectListLogic.isValidFilter('vote')).toBe(true);
      expect(ProjectListLogic.isValidFilter('proof')).toBe(true);
      expect(ProjectListLogic.isValidFilter('pre_sale')).toBe(true);
      expect(ProjectListLogic.isValidFilter('launch')).toBe(true);
    });

    test('无效的筛选选项', () => {
      expect(ProjectListLogic.isValidFilter('invalid')).toBe(false);
      expect(ProjectListLogic.isValidFilter('')).toBe(false);
      expect(ProjectListLogic.isValidFilter('completed')).toBe(false);
    });
  });

  describe('分页导航计算', () => {
    test('总页数少于最大显示数', () => {
      const result = ProjectListLogic.calculatePaginationInfo(2, 4, 5);
      expect(result.pages).toEqual([1, 2, 3, 4]);
      expect(result.showLeftEllipsis).toBe(false);
      expect(result.showRightEllipsis).toBe(false);
    });

    test('当前页靠近开始', () => {
      const result = ProjectListLogic.calculatePaginationInfo(2, 10, 5);
      expect(result.pages).toEqual([1, 2, 3, 4, 10]);
      expect(result.showLeftEllipsis).toBe(false);
      expect(result.showRightEllipsis).toBe(true);
    });

    test('当前页靠近结尾', () => {
      const result = ProjectListLogic.calculatePaginationInfo(9, 10, 5);
      expect(result.pages).toEqual([1, 7, 8, 9, 10]);
      expect(result.showLeftEllipsis).toBe(true);
      expect(result.showRightEllipsis).toBe(false);
    });

    test('当前页在中间', () => {
      const result = ProjectListLogic.calculatePaginationInfo(5, 10, 5);
      expect(result.pages).toEqual([1, 4, 5, 6, 10]);
      expect(result.showLeftEllipsis).toBe(true);
      expect(result.showRightEllipsis).toBe(true);
    });
  });

  describe('项目排序', () => {
    test('按创建时间降序排序', () => {
      const unsorted = [
        { id: '1', name: 'Old', status: 'vote' as ProjectStatus, saves: 0, createdAt: '2025-06-01' },
        { id: '2', name: 'New', status: 'vote' as ProjectStatus, saves: 0, createdAt: '2025-06-10' },
        { id: '3', name: 'Middle', status: 'vote' as ProjectStatus, saves: 0, createdAt: '2025-06-05' }
      ];
      
      const sorted = ProjectListLogic.sortProjectsByDate(unsorted);
      expect(sorted[0].id).toBe('2'); // 最新
      expect(sorted[1].id).toBe('3'); // 中间
      expect(sorted[2].id).toBe('1'); // 最旧
    });

    test('不修改原数组', () => {
      const original = [...mockProjects];
      ProjectListLogic.sortProjectsByDate(mockProjects);
      expect(mockProjects).toEqual(original);
    });
  });
});
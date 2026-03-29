/**
 * ProfileModal 推薦碼生成測試 - 簡化版
 * 
 * 測試基本功能：
 * 1. 顯示 Generate 按鈕
 * 2. 點擊後調用 API
 * 3. 已有推薦碼時不顯示按鈕
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all dependencies first
jest.mock('../../lib/api/services/projectService', () => ({
  ProjectStatus: {
    DRAFT: 'draft',
    VOTE_IN_PROGRESS: 'vote_in_progress', 
    ACTIVE: 'active',
    PRE_SALE: 'pre_sale',
    LAUNCH: 'launch',
    COMPLETED: 'completed'
  },
  default: { getMyProjects: jest.fn().mockResolvedValue([]) }
}));

jest.mock('../../lib/api/services/referralService', () => ({
  referralService: { getMyReferralCode: jest.fn() }
}));

jest.mock('../../lib/api/services/authService', () => ({
  switchToBuilder: jest.fn()
}));

jest.mock('../../lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/dashboard'
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: null }),
  useQueryClient: () => ({ invalidateQueries: jest.fn(), setQueryData: jest.fn() })
}));

// Mock context and hooks
const mockDashboardData = {
  userInfo: {
    role: 'USER',
    referralCode: null,
    walletAddress: '0x123...'
  },
  statistics: { totalPoints: 1000 },
  missions: []
};

jest.mock('../../lib/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 123, walletAddress: '0x1234567890abcdef' },
    isAuthenticated: true,
    loading: false,
    logout: jest.fn(),
    refreshToken: jest.fn(),
    hasRole: () => true
  })
}));

jest.mock('../../app/(protected)/dashboard/contexts/user-profile-context', () => ({
  useUserProfileContext: () => ({
    dashboardData: mockDashboardData,
    selectedMissionId: null,
    setSelectedMissionId: jest.fn(),
    selectedMission: null,
    isProcessing: false,
    currentTaskId: '',
    failedTaskId: '',
    handleTaskAction: jest.fn(),
    claimReward: jest.fn(),
    isUnclaimedMission: jest.fn(),
    isOverviewView: false,
    isBuilderDashboardView: false
  })
}));

jest.mock('../../lib/hooks/useProfileInitialData', () => ({
  useProfileInitialData: () => ({
    dashboardData: mockDashboardData,
    refetch: jest.fn()
  })
}));

jest.mock('../../lib/hooks/useTaskActions', () => ({
  useTaskActions: () => ({
    isProcessing: false,
    currentTaskId: '',
    failedTaskId: '',
    handleTaskAction: jest.fn()
  })
}));

jest.mock('../../lib/api/services/profileService', () => ({
  profileService: {
    getMissionDetail: jest.fn(),
    claimReward: jest.fn()
  }
}));

// Import component after mocks
import ProfileModal from './ProfileModal';
import { referralService } from '../../lib/api/services/referralService';

const mockGetMyReferralCode = referralService.getMyReferralCode as jest.Mock;

describe('ProfileModal 推薦碼生成測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDashboardData.userInfo.referralCode = null;
  });

  test('顯示 Generate 按鈕當用戶沒有推薦碼', async () => {
    render(<ProfileModal isOpen={true} onClose={jest.fn()} />);
    
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Not generated')).toBeInTheDocument();
  });

  test('點擊 Generate 按鈕調用 API', async () => {
    mockGetMyReferralCode.mockResolvedValueOnce({
      code: 'REF123456',
      isNewlyGenerated: true
    });

    render(<ProfileModal isOpen={true} onClose={jest.fn()} />);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGetMyReferralCode).toHaveBeenCalled();
    });
  });

  test('已有推薦碼時不顯示 Generate 按鈕', () => {
    mockDashboardData.userInfo.referralCode = 'EXISTING123';
    
    render(<ProfileModal isOpen={true} onClose={jest.fn()} />);
    
    expect(screen.queryByText('Generate')).not.toBeInTheDocument();
    expect(screen.getByText('EXISTING123')).toBeInTheDocument();
  });
});
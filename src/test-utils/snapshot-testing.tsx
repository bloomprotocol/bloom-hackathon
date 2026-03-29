import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@/lib/context/AuthContext';
import { MenuProvider } from '@/lib/context/menu/MenuContext';
import { ModalProvider } from '@/lib/context/ModalContext';
import { UserProfileProvider } from '@/app/(protected)/dashboard/contexts/user-profile-context';

// Mock providers that wrap components during testing
interface AllTheProvidersProps {
  children: React.ReactNode;
}

export function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <MenuProvider>
          <ModalProvider>
            <UserProfileProvider initialMissionId={undefined}>
              {children}
            </UserProfileProvider>
          </ModalProvider>
        </MenuProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

// Custom render function that includes all providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Helper function to create consistent snapshot tests
export function createSnapshotTest(
  componentName: string,
  component: React.ReactElement,
  options?: {
    skipRender?: boolean;
    customWrapper?: React.ComponentType<{ children: React.ReactNode }>;
  }
) {
  return () => {
    if (options?.skipRender) {
      expect(component).toMatchSnapshot();
    } else {
      const { container } = renderWithProviders(component);
      expect(container).toMatchSnapshot();
    }
  };
}

// Mock data generators for consistent snapshots
export const mockData = {
  user: {
    uid: 1,
    username: 'testuser',
    email: 'test@example.com',
    walletAddresses: ['0x1234567890abcdef'],
    role: 'USER',
  },
  project: {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test project description',
    status: 'active',
    category: 'DeFi',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  mission: {
    id: 1,
    name: 'Test Mission',
    description: 'Test mission description',
    slug: 'test-mission',
    status: 'active',
    type: 'DAILY_CHECKIN',
  },
};

// Helper to create page snapshot tests with consistent mocking
export function createPageSnapshotTest(pagePath: string, PageComponent: React.ComponentType<any>, props?: any) {
  return () => {
    // Mock usePathname for pages that use it
    const usePathname = jest.spyOn(require('next/navigation'), 'usePathname');
    usePathname.mockReturnValue(pagePath);

    const { container } = renderWithProviders(<PageComponent {...props} />);
    expect(container).toMatchSnapshot();
    
    usePathname.mockRestore();
  };
}
/**
 * Custom render function that includes all necessary providers
 */

import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@/lib/context/AuthContext';
import { ModalProvider } from '@/lib/context/ModalContext';
// import { MobileMenuProvider } from '@/lib/context/MobileMenuContext';

// Create a custom render function
function render(ui: React.ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './tanstack-query-utils';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/ui/toast';

/**
 * Base test provider that wraps components with common providers
 */
const TestProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MemoryRouter>
          <ToastProvider>
            {children}
          </ToastProvider>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Render a component with all necessary providers for testing
 * @param ui The component to render
 * @param options Additional render options
 * @returns Render result
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, {
    wrapper: TestProviders,
    ...options
  });
};

/**
 * Create a custom renderer with specific providers
 * @param providers Custom providers to wrap the component
 * @returns Render function with custom providers
 */
export const createCustomRenderer = (providers: React.ComponentType<{ children: ReactNode }>) => {
  return (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
    const CustomWrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders>
        <providers>
          {children}
        </providers>
      </TestProviders>
    );

    return render(ui, {
      wrapper: CustomWrapper,
      ...options
    });
  };
};

/**
 * Mock console.error to suppress React 18+ act() warnings in tests
 */
export const suppressConsoleErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  beforeEach(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });
};

/**
 * Utility for finding elements by test ID
 * @param container HTMLElement
 * @param testId Test ID
 * @returns Found element or null
 */
export const findByTestId = (container: HTMLElement, testId: string): HTMLElement | null => {
  return container.querySelector(`[data-testid="${testId}"]`);
};

/**
 * Utility for finding all elements by test ID
 * @param container HTMLElement
 * @param testId Test ID
 * @returns Array of found elements
 */
export const findAllByTestId = (container: HTMLElement, testId: string): HTMLElement[] => {
  return Array.from(container.querySelectorAll(`[data-testid="${testId}"]`));
};
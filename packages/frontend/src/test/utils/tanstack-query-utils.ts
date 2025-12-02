import { QueryClient } from '@tanstack/react-query';
import { render, renderHook, RenderHookOptions, RenderHookResult, RenderOptions, RenderResult } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';

/**
 * Create a test wrapper for TanStack Query components
 * @param ui The component to render
 * @param options Additional render options
 * @returns Render result with QueryClientProvider wrapper
 */
export const renderWithQueryClient = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Create a test wrapper for TanStack Query hooks
 * @param hook The hook to test
 * @param options Hook render options
 * @returns Rendered hook result with QueryClientProvider wrapper
 */
export const renderHookWithQueryClient = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
): RenderHookResult<TResult> => {
  const queryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(hook, { wrapper, ...options });
};

/**
 * Create a test QueryClient with custom configuration
 * @returns Configured QueryClient for testing
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
        staleTime: Infinity,
        throwOnError: true,
      },
      mutations: {
        retry: false,
        throwOnError: true,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {
        // Suppress query client errors in tests
      },
    },
  });
};

/**
 * Create a test wrapper for async components that use TanStack Query
 * @param ui The component to render
 * @param options Additional render options
 * @returns Render result with QueryClientProvider wrapper
 */
export const renderWithAsyncQueryClient = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): Promise<RenderResult> => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  let renderResult: RenderResult;

  await act(async () => {
    renderResult = render(ui, { wrapper: Wrapper, ...options });
  });

  return renderResult!;
};

/**
 * Create a mock query function for testing
 * @param data Mock data to return
 * @param delay Delay in milliseconds
 * @returns Mock query function
 */
export const createMockQueryFn = <TData>(data: TData, delay: number = 0): (() => Promise<TData>) => {
  return async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return Promise.resolve(data);
  };
};

/**
 * Create a mock query function that throws an error
 * @param error Error to throw
 * @param delay Delay in milliseconds
 * @returns Mock query function that throws
 */
export const createMockErrorQueryFn = (error: Error, delay: number = 0): (() => Promise<never>) => {
  return async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return Promise.reject(error);
  };
};

/**
 * Type guard for checking if a value is an Error
 * @param value Value to check
 * @returns True if the value is an Error
 */
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};
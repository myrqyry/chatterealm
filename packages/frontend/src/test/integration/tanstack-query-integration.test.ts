import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHookWithQueryClient, createMockQueryFn, createMockErrorQueryFn } from '@/test/utils';
import { QueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { act } from 'react';

describe('TanStack Query Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useQuery Hook Tests', () => {
    it('should successfully fetch data with useQuery', async () => {
      const mockData = { id: '1', name: 'Test Data' };
      const queryFn = createMockQueryFn(mockData);

      const { result } = renderHookWithQueryClient(() =>
        useQuery({
          queryKey: ['test-data'],
          queryFn: queryFn,
        })
      );

      await act(async () => {
        // Wait for query to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should handle query errors gracefully', async () => {
      const mockError = new Error('Failed to fetch');
      const queryFn = createMockErrorQueryFn(mockError);

      const { result } = renderHookWithQueryClient(() =>
        useQuery({
          queryKey: ['error-data'],
          queryFn: queryFn,
          retry: false,
        })
      );

      await act(async () => {
        // Wait for query to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.isError).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should handle query loading states', () => {
      const slowQueryFn = createMockQueryFn({ data: 'slow' }, 200);

      const { result } = renderHookWithQueryClient(() =>
        useQuery({
          queryKey: ['slow-data'],
          queryFn: slowQueryFn,
        })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useMutation Hook Tests', () => {
    it('should successfully execute mutations', async () => {
      const mockMutationFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHookWithQueryClient(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      await act(async () => {
        await result.current.mutateAsync({ test: 'data' });
      });

      expect(mockMutationFn).toHaveBeenCalledWith({ test: 'data' });
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.isPending).toBe(false);
    });

    it('should handle mutation errors', async () => {
      const mockError = new Error('Mutation failed');
      const mockMutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHookWithQueryClient(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({ test: 'data' });
        } catch (error) {
          // Error is expected
        }
      });

      expect(mockMutationFn).toHaveBeenCalledWith({ test: 'data' });
      expect(result.current.isError).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Query Client Behavior Tests', () => {
    it('should use custom query client configuration', () => {
      const { result } = renderHookWithQueryClient(() => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              retry: 3,
              cacheTime: 1000 * 60 * 5, // 5 minutes
            },
          },
        });

        return queryClient;
      });

      expect(result.current.getDefaultOptions().queries?.retry).toBe(3);
      expect(result.current.getDefaultOptions().queries?.cacheTime).toBe(1000 * 60 * 5);
    });

    it('should handle query cancellation', async () => {
      const slowQueryFn = createMockQueryFn({ data: 'slow' }, 500);
      const queryKey = ['cancellable-data'];

      const { result, unmount } = renderHookWithQueryClient(() =>
        useQuery({
          queryKey,
          queryFn: slowQueryFn,
        })
      );

      // Start the query
      expect(result.current.isLoading).toBe(true);

      // Cancel before it completes
      unmount();

      // Query should be cancelled and not complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    });
  });

  describe('Query Retry Behavior', () => {
    it('should retry failed queries according to configuration', async () => {
      let attemptCount = 0;
      const mockQueryFn = vi.fn().mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Failed attempt');
        }
        return { success: true };
      });

      const { result } = renderHookWithQueryClient(() =>
        useQuery({
          queryKey: ['retry-test'],
          queryFn: mockQueryFn,
          retry: 2,
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual({ success: true });
    });
  });

  describe('Query Dependencies and Invalidations', () => {
    it('should handle query dependencies correctly', async () => {
      const mockData1 = { id: 1, value: 'first' };
      const mockData2 = { id: 2, value: 'second' };

      const queryFn1 = createMockQueryFn(mockData1);
      const queryFn2 = createMockQueryFn(mockData2);

      const { result } = renderHookWithQueryClient(() => {
        const query1 = useQuery({
          queryKey: ['dependent-1'],
          queryFn: queryFn1,
        });

        const query2 = useQuery({
          queryKey: ['dependent-2'],
          queryFn: queryFn2,
          enabled: query1.data !== undefined,
        });

        return { query1, query2 };
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(result.current.query1.data).toEqual(mockData1);
      expect(result.current.query2.data).toEqual(mockData2);
    });
  });

  describe('Query Options and Configuration', () => {
    it('should handle stale time and cache time correctly', async () => {
      const mockData = { value: 'cached' };
      const queryFn = createMockQueryFn(mockData);

      const { result } = renderHookWithQueryClient(() =>
        useQuery({
          queryKey: ['cache-test'],
          queryFn: queryFn,
          staleTime: 1000 * 60, // 1 minute
          cacheTime: 1000 * 60 * 5, // 5 minutes
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isStale).toBe(false);
    });
  });
});
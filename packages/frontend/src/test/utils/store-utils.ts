import { act } from 'react';
import { RenderHookOptions, renderHook } from '@testing-library/react';
import { createTestQueryClient } from './tanstack-query-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a test wrapper for Zustand store hooks
 * @param useStore The Zustand store hook to test
 * @param options Render hook options
 * @returns Rendered hook result with QueryClientProvider wrapper
 */
export const renderStoreHook = <TStore, TProps extends any[]>(
  useStore: (...args: TProps) => TStore,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) => {
  const queryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(() => useStore(), {
    wrapper,
    ...options
  });
};

/**
 * Create a mock Zustand store for testing
 * @param initialState Initial state
 * @returns Mock store with getState, setState, and subscribe methods
 */
export const createMockStore = <TState extends object>(initialState: TState) => {
  let state = { ...initialState };
  const listeners: Array<(state: TState) => void> = [];

  const getState = () => state;

  const setState = (partial: Partial<TState> | ((state: TState) => Partial<TState>), replace?: boolean) => {
    const newState = typeof partial === 'function'
      ? (partial as (state: TState) => Partial<TState>)(state)
      : partial;

    state = replace ? (newState as TState) : { ...state, ...newState };

    listeners.forEach(listener => listener(state));
  };

  const subscribe = (listener: (state: TState) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  };

  const destroy = () => {
    listeners.length = 0;
  };

  return {
    getState,
    setState,
    subscribe,
    destroy,
    useStore: () => ({ ...state })
  };
};

/**
 * Utility for testing Zustand store actions
 * @param store Mock store
 * @param action Function that modifies store state
 * @returns Updated state after action
 */
export const testStoreAction = async <TState extends object>(
  store: ReturnType<typeof createMockStore<TState>>,
  action: (api: { getState: () => TState; setState: (partial: Partial<TState> | ((state: TState) => Partial<TState>), replace?: boolean) => void }) => void | Promise<void>
): Promise<TState> => {
  await act(async () => {
    await action({
      getState: store.getState,
      setState: store.setState
    });
  });

  return store.getState();
};

/**
 * Create a Zustand store with async initialization for testing
 * @param createState Function that creates initial state
 * @returns Mock store with async initialization
 */
export const createAsyncStore = async <TState extends object>(
  createState: () => Promise<TState>
): Promise<ReturnType<typeof createMockStore<TState>>> => {
  const initialState = await createState();
  return createMockStore(initialState);
};
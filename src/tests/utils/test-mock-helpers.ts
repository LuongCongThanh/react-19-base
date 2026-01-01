/**
 * Type-safe mock helpers for common testing patterns
 */

import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

/**
 * Create a type-safe mock mutation result
 * Useful for mocking React Query mutations
 */
export const createMockMutationResult = <TData = unknown, TError = Error, TVariables = unknown>(
  overrides?: Partial<UseMutationResult<TData, TError, TVariables, unknown>> | Record<string, unknown>
): UseMutationResult<TData, TError, TVariables, unknown> => {
  const baseResult: Partial<UseMutationResult<TData, TError, TVariables, unknown>> = {
    mutate: jest.fn() as any,
    mutateAsync: jest.fn() as any,
    reset: jest.fn(),
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isIdle: true,
    isPaused: false,
    status: 'idle' as const,
    submittedAt: 0,
    variables: undefined,
    isError: false,
    isPending: false,
    isSuccess: false,
  };

  // Merge overrides
  const result = {
    ...baseResult,
    ...overrides,
  };

  return result as UseMutationResult<TData, TError, TVariables, unknown>;
};

/**
 * Create a mock mutation function that calls onSuccess callback
 */
export const createMockMutateWithSuccess = <TData = unknown>(data: TData): jest.Mock => {
  return jest.fn((_variables: unknown, options: { onSuccess?: (data: TData) => void }) => {
    if (options?.onSuccess) {
      options.onSuccess(data);
    }
  });
};

/**
 * Create a mock mutation function that calls onError callback
 */
export const createMockMutateWithError = <TError = Error>(error: TError): jest.Mock => {
  return jest.fn((_variables: unknown, options: { onError?: (error: TError) => void }) => {
    if (options?.onError) {
      options.onError(error);
    }
  });
};

/**
 * Type-safe wrapper for jest.mocked with proper typing
 */
export const createTypedMock = <T extends (...args: any[]) => any>(): jest.MockedFunction<T> => {
  return jest.fn() as unknown as jest.MockedFunction<T>;
};

/**
 * Create a mock API response
 */
export const createMockApiResponse = <T = unknown>(data: T, success = true) => {
  return {
    success,
    data,
    message: success ? 'Success' : 'Error',
  };
};

/**
 * Create a mock API error
 */
export const createMockApiError = (message: string, status = 400) => {
  const error = new Error(message) as Error & { status?: number; response?: unknown };
  error.status = status;
  error.response = { message };
  return error;
};

/**
 * Type-safe mutation options for React Query mutations
 */
export interface MockMutationOptions<TData = unknown, TError = Error> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

/**
 * Create a type-safe mock mutate function
 */
export const createMockMutate = <TData = unknown, TError = Error, TVariables = unknown>(): jest.Mock<
  void,
  [TVariables, MockMutationOptions<TData, TError>?]
> => {
  return jest.fn();
};

/**
 * Create a type-safe mock query result
 * Useful for mocking React Query queries
 */
export const createMockQueryResult = <TData = unknown, TError = Error>(
  overrides?: Partial<UseQueryResult<TData, TError>>
): UseQueryResult<TData, TError> => {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    isRefetching: false,
    isLoadingError: false,
    isRefetchError: false,
    isPaused: false,
    isSuccess: false,
    status: 'pending',
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'fetching',
    isFetched: false,
    isFetchedAfterMount: false,
    isInitialLoading: false,
    isPlaceholderData: false,
    isStale: false,
    refetch: jest.fn(),
    ...overrides,
  } as UseQueryResult<TData, TError>;
};

/**
 * Create a mock query result with data (success state)
 */
export const createMockQueryResultWithData = <TData = unknown>(data: TData): UseQueryResult<TData, Error> => {
  return createMockQueryResult<TData, Error>({
    data,
    isSuccess: true,
    isFetched: true,
    isFetchedAfterMount: true,
    status: 'success',
    fetchStatus: 'idle',
    isLoading: false,
    isFetching: false,
  });
};

/**
 * Create a mock query result with error (error state)
 */
export const createMockQueryResultWithError = <TError = Error>(error: TError): UseQueryResult<unknown, TError> => {
  return createMockQueryResult<unknown, TError>({
    error,
    isError: true,
    isFetched: true,
    isFetchedAfterMount: true,
    isLoadingError: true,
    status: 'error',
    fetchStatus: 'idle',
    isLoading: false,
    isFetching: false,
  });
};

/**
 * Create a mock query result in loading state
 */
export const createMockQueryResultLoading = <TData = unknown>(): UseQueryResult<TData, Error> => {
  return createMockQueryResult<TData, Error>({
    isLoading: true,
    isFetching: true,
    isInitialLoading: true,
    status: 'pending',
    fetchStatus: 'fetching',
    isFetched: false,
    isFetchedAfterMount: false,
  });
};

/**
 * Create a mock query result in idle state
 */
export const createMockQueryResultIdle = <TData = unknown>(): UseQueryResult<TData, Error> => {
  return createMockQueryResult<TData, Error>({
    status: 'pending',
    fetchStatus: 'idle',
    isFetched: false,
    isFetchedAfterMount: false,
    isLoading: false,
  });
};

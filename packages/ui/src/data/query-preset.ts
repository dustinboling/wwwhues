import { QueryClient } from '@tanstack/react-query';
import type { DefaultOptions, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

/**
 * Stack-wide data layer preset (Data #2.1): one TanStack Query setup with
 * written defaults, identical across properties. Nadia's per-surface refresh
 * table implements on these defaults, not as ad-hoc fetch calls.
 */

export type DataClass = 'account' | 'session' | 'public' | 'catalog';

/** staleTime per data class: account/session 30s, public/catalog reads 5min. */
export const STALE_TIME: Record<DataClass, number> = {
  account: 30_000,
  session: 30_000,
  public: 300_000,
  catalog: 300_000,
};

export const HUES_DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    // Cached data serves immediately with background refetch; stale queries
    // refetch on mount, window focus, and reconnect; one request per key.
    staleTime: STALE_TIME.public,
    gcTime: 300_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    structuralSharing: true,
  },
  mutations: {
    retry: 0,
  },
};

export function createHuesQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: HUES_DEFAULT_OPTIONS });
}

/** Query options pinned to a data class stale window. */
export function queryOptionsFor<TData>(dataClass: DataClass, options: UseQueryOptions<TData> = {}): UseQueryOptions<TData> {
  return { staleTime: STALE_TIME[dataClass], ...options };
}

/**
 * Mutation with its invalidation list (Data #2.1): every mutation names the
 * query keys it invalidates, and success invalidates them through the client.
 */
export interface HuesMutationOptions<TData, TError, TVariables>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'onSuccess'> {
  invalidates?: ReadonlyArray<ReadonlyArray<string>>;
  onInvalidated?: () => void;
}

export function mutationOptionsFor<TData, TError, TVariables>(
  client: QueryClient,
  options: HuesMutationOptions<TData, TError, TVariables>,
): UseMutationOptions<TData, TError, TVariables> {
  const { invalidates = [], onInvalidated, ...rest } = options;
  return {
    ...rest,
    onSuccess: () => {
      for (const key of invalidates) void client.invalidateQueries({ queryKey: [...key] });
      onInvalidated?.();
    },
  };
}

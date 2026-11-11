import { useCallback, useEffect, useState } from 'react';

interface QueryState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePortfolioQuery<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  enabled = true,
): QueryState<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load section data.',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      void load();
    },
  };
}


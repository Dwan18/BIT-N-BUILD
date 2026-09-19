import { useCallback, useEffect, useState } from 'react';

// Small data-fetching hook: { data, loading, error, refetch }.
// Pass a stable fetcher (define it outside the component or wrap in useCallback).
export default function useApi(fetcher) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(
    (signal) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      return fetcher(signal)
        .then((data) => setState({ data, loading: false, error: null }))
        .catch((error) => {
          if (error.name !== 'AbortError') setState({ data: null, loading: false, error });
        });
    },
    [fetcher]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { ...state, refetch: () => load() };
}

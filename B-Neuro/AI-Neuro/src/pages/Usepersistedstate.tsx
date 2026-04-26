import { useState, useEffect } from 'react';

/**
 * Like useState, but persists the value in sessionStorage.
 * When the user navigates back, the previous page's data is restored.
 */
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // sessionStorage full or unavailable
    }
  }, [key, state]);

  const clearState = () => {
    sessionStorage.removeItem(key);
    setState(defaultValue);
  };

  return [state, setState, clearState] as const;
}
import { useCallback, useState } from 'react';

type Validator<T> = (raw: unknown) => T | null;

/**
 * Persistenter State in localStorage.
 * `validate` prüft gespeicherte Daten beim Laden – beschädigte oder manipulierte
 * Werte fallen auf `initialValue` zurück, statt die App zum Absturz zu bringen.
 */
export function useLocalStorage<T>(key: string, initialValue: T, validate?: Validator<T>) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed: unknown = JSON.parse(item);
      if (validate) {
        const ok = validate(parsed);
        return ok === null ? initialValue : ok;
      }
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  // Funktionale Updates laufen über den aktuellen React-State, nicht über einen
  // eingefrorenen Closure-Wert – mehrere Updates im selben Tick gehen nicht verloren.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (error) {
        console.error('localStorage nicht verfügbar:', error);
      }
      return next;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}

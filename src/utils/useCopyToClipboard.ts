import {useState, useCallback} from 'react';

/**
 * Custom hook for copying text to clipboard.
 * Returns [copy, { copied, error }]
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API not supported'));
      setCopied(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      setError(err as Error);
      setCopied(false);
    }
  }, []);

  return [copy, {copied, error}] as const;
}

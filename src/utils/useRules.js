import { useState, useEffect } from 'react';
import { fetchRules, saveRules } from './rulesApi';

export default function useRules() {
  const [rules, setRules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load rules from server on mount
  useEffect(() => {
    let isMounted = true;

    async function loadRules() {
      setIsLoading(true);
      const loadedRules = await fetchRules();
      if (isMounted) {
        setRules(loadedRules);
        setIsLoading(false);
      }
    }

    loadRules();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save rules to server whenever they change
  useEffect(() => {
    if (isLoading) {
      return; // Don't save on initial load
    }

    let timeoutId;
    setIsSaving(true);

    // Debounce saves to avoid too many API calls
    timeoutId = setTimeout(async () => {
      await saveRules(rules);
      setIsSaving(false);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [rules, isLoading]);

  return [rules, setRules];
}

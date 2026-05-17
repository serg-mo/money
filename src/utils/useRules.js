import { useState, useEffect } from 'react';
import { fetchRules, saveRules } from './rulesApi';

export default function useRules() {
  const [rules, setRules] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // fetch rules from server on mount
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

  // save rules when they change
  useEffect(() => {
    if (!Object.values(rules).length) {
      return; // don't save when there are no rules
    }

    // debounce avoids too many API calls
    let timeoutId = setTimeout(async () => {
      await saveRules(rules);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [rules]);

  return [rules, setRules];
}

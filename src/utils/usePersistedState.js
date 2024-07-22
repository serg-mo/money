import { useState, useEffect } from 'react';

const persist = (values, itemKey) => {
  if (values && Object.values(values).length) {
    localStorage.setItem(itemKey, JSON.stringify(values));
  }
};

export default function (defaultValue, key) {
  const storedValue = localStorage.getItem(key);
  const initial = storedValue ? JSON.parse(storedValue) : defaultValue;

  const [state, setState] = useState(initial);

  useEffect(() => {
    persist(state, key);
  }, [state, key]);

  return [state, setState];
}

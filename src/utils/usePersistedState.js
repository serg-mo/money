import { useState, useEffect } from "react";

const persist = (values, itemKey) => {
  if (values && Object.values(values).length) {
    localStorage.setItem(itemKey, JSON.stringify(values));
  }
};

export default function (defaultValue, key) {
  // Retrieve the initial state from local storage if it exists, otherwise use the default value
  const value = localStorage.getItem(key);
  const initial = value ? JSON.parse(value) : defaultValue;

  const [state, setState] = useState(initial);

  useEffect(() => {
    persist(state, key);
  }, [state, key]);

  return [state, setState];
}

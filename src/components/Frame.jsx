import { useEffect, useState } from 'react';

export default function Frame({
  transactions,
  children,
  initialSize,
  minSize = 3,
}) {
  // don't sort, just start at the end
  const [size, setSize] = useState(initialSize);
  const [left, setLeft] = useState(transactions.length - initialSize);

  const handleKeyPress = (event) => {
    // NOTE: all of these must be closures
    if (event.key === 'ArrowLeft') {
      setLeft((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'ArrowRight') {
      setLeft((prev) =>
        Math.min(prev + 1, transactions.length - Math.min(size, 2))
      ); // 2..size
    } else if (event.key === 'ArrowUp') {
      setSize((prev) => {
        const newSize = Math.min(prev + 1, transactions.length);
        // move left edge if we're expanding all the way on the right
        if (left + newSize > transactions.length) {
          setLeft(transactions.length - newSize);
        }
        return newSize;
      });
    } else if (event.key === 'ArrowDown') {
      setSize((prev) => Math.max(prev - 1, minSize));
    }
    event.preventDefault();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // TODO: consider having a timeout that plays one second per month and just loops through the whole thing
  const slice = transactions.slice(left, left + size);
  //console.log(`[${left},${size}] ${slice.length}/${transactions.length}`);

  return children(slice);
}

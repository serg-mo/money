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

  // NOTE: keyboard arrows effectively control both edges of the timeline
  // NOTE: stateless because it's easy to navigate back to where you just were
  const handleKeyPress = (event) => {
    // NOTE: I really like this kind of navigation
    // NOTE: all of these must be closures
    if (event.key === 'ArrowLeft') {
      setLeft((prev) => Math.max(prev - 1, 0));
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      setLeft((prev) =>
        Math.min(prev + 1, transactions.length - Math.min(size, 2))
      ); // 2..size
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      setSize((prev) => {
        const newSize = Math.min(prev + 1, transactions.length);
        // move left edge if we're expanding all the way on the right
        if (left + newSize > transactions.length) {
          setLeft(transactions.length - newSize);
        }
        return newSize;
      });
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      setSize((prev) => Math.max(prev - 1, minSize));
      event.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const slice = transactions.slice(left, left + size);
  //console.log(`[${left},${size}] ${slice.length}/${transactions.length}`);

  return children(slice);
}

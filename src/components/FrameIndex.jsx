import { useEffect, useState } from 'react';

function useFrameIndex(totalSize, initialSize, minSize = 3) {
  // don't sort, just start at the end
  const [size, setSize] = useState(initialSize);
  const [left, setLeft] = useState(totalSize - initialSize);

  // NOTE: keyboard arrows effectively control both edges of the timeline
  // NOTE: stateless because it's easy to navigate back to where you just were
  const handleKeyPress = (event) => {
    // NOTE: I really like this kind of navigation
    // NOTE: all of these must be closures
    if (event.key === 'ArrowLeft') {
      setLeft((prev) => Math.max(prev - 1, 0));
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      const maxLeft = totalSize - Math.min(size, 2)
      setLeft((prev) => Math.min(prev + 1, maxLeft)); // 2..size
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      setSize((prev) => {
        const newSize = Math.min(prev + 1, totalSize);
        // move left edge if we're expanding all the way on the right
        if (left + newSize > totalSize) {
          setLeft(totalSize - newSize);
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

  //console.log({left, size, totalSize, initialSize, minSize});

  return [left, size]
}

export default function FrameIndex({
  transactions,
  children,
  initialSize,
}) {
  const [left, size] = useFrameIndex(transactions.length, initialSize)
  const slice = transactions.slice(left, left + size);
  return children(slice);
}

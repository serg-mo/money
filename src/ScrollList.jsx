import React, { useState } from 'react';

// TODO: consider passing the items as a prop
export default function ScrollList() {
  const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // scrolling up
      setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.deltaY > 0) {
      // scrolling down
      setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, items.length - 1));
    }
  };

  return (
    <div onWheel={handleScroll} style={{ overflow: 'hidden' }}>
      <div>{items[currentIndex]}</div>
    </div>
  );
};
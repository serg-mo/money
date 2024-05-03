import { set } from "lodash";
import React, { useState, useEffect } from "react";

export default function Frame({ transactions, render }) {
  // don't sort, just start at the end
  const [MIN_SIZE, MAX_SIZE] = [3, transactions.length];
  const [size, setSize] = useState(12); // 1 year
  const [left, setLeft] = useState(transactions.length - 12);

  const handleKeyPress = (event) => {
    // NOTE: all of these must be closures
    if (event.key === "ArrowLeft") {
      setLeft((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "ArrowRight") {
      setLeft((prev) => Math.min(prev + 1, transactions.length - size));
    } else if (event.key === "ArrowUp") {
      setSize((prev) => {
        const newSize = Math.min(prev + 1, MAX_SIZE);
        // move left edge if we're expanding all the way on the right
        if (left + newSize > transactions.length) {
          setLeft(transactions.length - newSize);
        }
        return newSize;
      });
    } else if (event.key === "ArrowDown") {
      setSize((prev) => Math.max(prev - 1, MIN_SIZE)); // min size 1
    }
    event.preventDefault();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // TODO: consider having a timeout that plays one second per month and just loops through the whole thing
  const slice = transactions.slice(left, left + size);
  //console.log(`[${left},${size}] ${slice.length}/${transactions.length}`);

  return render(slice);
}

import React, { useState, useEffect } from "react";

export default function Frame({ render }) {
  const [size, setSize] = useState(10);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(100);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowLeft") {
        // move both edges to the left
        setLeft((prev) => Math.max(prev - 1, 0));
        setRight((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "ArrowRight") {
        // move both edges to the right
        setRight((prev) => Math.max(prev + 1, 0));
        setLeft((prev) => Math.max(prev + 1, 0));
      } else if (event.key === "ArrowUp") {
        // more data, zoom out
        setSize((prev) => Math.max(prev + 1, 0));
      } else if (event.key === "ArrowDown") {
        // less data, zoom in
        setSize((prev) => Math.max(prev - 1, 0));
      }
      event.preventDefault();
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div>
      <h1>{`${left}-${right} x ${size}`}</h1>
      <div>{render(left, right)}</div>
    </div>
  );
}

import React from "react";
import {
  BsReception0,
  BsReception1,
  BsReception2,
  BsReception3,
  BsReception4,
} from "react-icons/bs";

export default function ProgressIcon({ value = 0 }) {
  const icons = [
    <BsReception0 />,
    <BsReception1 />,
    <BsReception2 />,
    <BsReception3 />,
    <BsReception4 />,
  ];

  // 0..1 => 0..last index
  const scaled = Math.floor(value * (icons.length - 1));
  const index = Math.min(icons.length - 1, Math.max(scaled, 0));

  return icons[index];
}

import React from "react";

export default function Target({ children, onClick }) {
  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center">
      <div
        className="w-96 h-96 flex flex-col justify-center items-center text-center text-5xl border-2 rounded-xl cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
}

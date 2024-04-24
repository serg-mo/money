import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

export default function Layout() {
  return (
    <div className="w-full h-screen flex flex-row justify-start items-center text-gray-800">
      <div className="w-32 p-4">
        <Navigation />
      </div>
      <div className="w-full flex flex-col justify-center items-center text-center">
        <Outlet />
      </div>
    </div>
  );
}

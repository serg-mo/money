import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="text-gray-800">
      <Outlet />
    </div>
  );
}

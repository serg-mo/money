import React from "react";
import { Link, useLocation } from "react-router-dom";

export const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/dividends", label: "Dividends" },
  { path: "/brokerage", label: "Brokerage" },
  { path: "/credit", label: "Credit" },
];

function NavEdge({ children }) {
  return (
    <div className="font-bold bg-gray-300 flex items-center px-4 py-2">
      {children}
    </div>
  );
}

function NavLink({ path, label }) {
  const location = useLocation();
  const style = `w-full leading-10 text-lg ${location.pathname === path ? "font-bold" : ""}`;

  return (
    <li key={path} className="w-full px-3 hover:bg-white">
      <Link to={path} className={style}>
        {label}
      </Link>
    </li>
  );
}

export default function Navigation() {
  return (
    <nav className="flex flex-col min-w-max bg-gray-200 rounded-lg overflow-hidden">
      <NavEdge>Money Charts</NavEdge>
      <ul>{NAV_LINKS.map(NavLink)}</ul>
      <NavEdge>
        <img
          src="/profile.jpg"
          alt="Profile"
          className="rounded-full w-10 h-10 mr-2"
        />
        <div>Sergey</div>
      </NavEdge>
    </nav>
  );
}

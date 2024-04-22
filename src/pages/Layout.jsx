import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/dividends", label: "Dividends" },
  { path: "/brokerage", label: "Brokerage" },
  { path: "/credit", label: "Credit" },
];

export default function Layout() {
  const location = useLocation();

  const style =
    "m-2 p-3 rounded-lg transition-all duration-300 transform hover:scale-110";

  const activeStyle =
    "m-2 p-3 rounded-lg transition-all duration-300 transform hover:scale-110 underline";

  return (
    <>
      <nav className="bg-gray-400 text-gray-800 py-2">
        <ul className="flex justify-center divide-x divide-gray-200">
          {NAV_LINKS.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={location.pathname === path ? activeStyle : style}
              >
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </>
  );
}

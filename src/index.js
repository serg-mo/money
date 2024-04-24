import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Dividends from "./pages/Dividends";
import Brokerage from "./pages/Brokerage";
import Credit from "./pages/Credit";
import Home from "./pages/Home";
import Layout from "./pages/Layout";

import "../styles/tailwind.css";

// NOTE: Github pages do not support BrowserRouter, hence HashRouter
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dividends" element={<Dividends />} />
          <Route path="brokerage" element={<Brokerage />} />
          <Route path="credit" element={<Credit />} />
        </Route>
      </Routes>
    </Router>
  );
}

// https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dividends from "./pages/Dividends";
import Brokerage from "./pages/Brokerage";
import Credit from "./pages/Credit";
import Home from "./pages/Home";
import Layout from "./pages/Layout";

import "../styles/tailwind.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dividends" element={<Dividends />} />
          <Route path="brokerage" element={<Brokerage />} />
          <Route path="credit" element={<Credit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);

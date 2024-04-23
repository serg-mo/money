import React from "react";
import ReactDOM from "react-dom";
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

ReactDOM.render(<App />, document.getElementById("root"));

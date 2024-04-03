import React from "react";
import { createRoot } from "react-dom/client";

import "../styles/tailwind.css";
// import App from "./App";
import AppDividends from "./AppDividends";

const root = createRoot(document.getElementById("root")).render(
  <AppDividends />,
);

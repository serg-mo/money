import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";

// TODO: drop multiple files and set context for both brokerage and credit
export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <Navigation />
    </div>
  );
}

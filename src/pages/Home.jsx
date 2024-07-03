import React, { useState, useEffect } from "react";
import DragAndDrop from "../components/DragAndDrop";

export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <DragAndDrop />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Credit from "./Credit";
import Brokerage from "./Brokerage";

export default function Home() {
  return <div>Welcome</div>;
}

/*
export default function Home({ files }) {
  // TODO: parse more than one file
  // TODO: determine schema by looking at it, brokerage vs credit type Dashboard
  const file = files[0];
  const TypedDashboard = true ? Credit : Brokerage;

  return (
    <div className="w-4xl max-w-4xl m-auto">
      <TypedDashboard file={file} />
    </div>
  );
}
*/

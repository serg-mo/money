import React, { useState, useEffect } from "react";
import DashboardCredit from "./DashboardCredit";
import DashboardBrokerage from "./DashboardBrokerage";

export default function Dashboard({ files }) {
  // TODO: parse more than one file
  const file = files[0];
  // TODO: determine schema by looking at it, brokerage vs credit type Dashboard
  const TypedDashboard = true ? DashboardCredit : DashboardBrokerage;

  return (
    <div className="w-4xl max-w-4xl m-auto">
      <TypedDashboard file={file} />
    </div>
  );
}

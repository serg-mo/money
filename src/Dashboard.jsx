import React, { useState, useEffect } from "react";
import DashboardCredit from "./DashboardCredit";
import DashboardBrokerage from "./DashboardBrokerage";

export default function Dashboard({ files }) {
  // TODO: parse more than one file
  const file = files[0];
  // TODO: determine schema by looking at it, brokerage vs credit type Dashboard
  const isCredit = true;

  if (isCredit) {
    return <DashboardCredit file={file} />;
  }

  return <DashboardBrokerage file={file} />;
}

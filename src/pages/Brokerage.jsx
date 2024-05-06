import React, { useState, useEffect } from "react";
import BalanceChart from "../components/brokerage/BalanceChart";
import CashFlowChart from "../components/brokerage/CashFlowChart";
import DragAndDrop from "../components/DragAndDrop";
import { parseBrokerageFile } from "../utils/brokerage";
import Frame from "../components/Frame";

// TODO: add arrow key handlers to zoom in/out and shift left/right
function Brokerage({ files }) {
  const [transactions, setTransactions] = useState([]);

  if (!transactions.length) {
    let reader = new FileReader();
    reader.onload = (e) => {
      setTransactions(parseBrokerageFile(e.target.result));
    };
    reader.readAsText(files[0]); // first file
  }

  if (!transactions.length) {
    return <div className="h-dvh w-3/4">Loading...</div>;
  }

  // same columns for brokerage and checking
  const titles = [
    // "month",
    "beginning balance",
    "market change minus fees",
    "dividends & interest",
    "deposits",
    "withdrawals",
    "ending balance",
  ];

  // TODO: BalanceChart can stack both start and ending balances
  // charts use canvas, the size of which can't be easily set with tailwind
  const render = (slice) => {
    return (
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-3/5">
          <BalanceChart transactions={slice} column={"ending balance"} />
        </div>
        <div className="w-3/5">
          <CashFlowChart transactions={slice} title="cash flow" />
        </div>
      </div>
    );
  };

  return <Frame transactions={transactions} render={render} />;
}

export default () => (
  <DragAndDrop render={(files) => <Brokerage files={files} />} />
);

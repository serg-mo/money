import React, { useEffect, useState } from "react";
import BalanceChart from "../components/brokerage/BalanceChart";
import CashFlowChart from "../components/brokerage/CashFlowChart";
import Frame from "../components/Frame";
import { parseBrokerageFile } from "../utils/brokerage";

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function Brokerage({ txt }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (txt && !transactions.length) {
      setTransactions(parseBrokerageFile(txt));
    }
  }, [transactions, txt]);

  if (!transactions.length) {
    return;
  }

  // same columns for brokerage and checking
  // TODO: brokerage and checking download the same file, chart them both

  // TODO: BalanceChart can stack both start and ending balances
  // TODO: charts use canvas, the size of which can't be easily set with tailwind
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

  return <Frame transactions={transactions} render={render} initialSize={12} />;
}

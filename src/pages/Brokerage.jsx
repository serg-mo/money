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
      const rows = parseBrokerageFile(e.target.result);
      setTransactions(rows);
    };
    reader.readAsText(files[0]); // first file
  }

  // TODO: what I want is a double chart of balance + color coded changes, e.g., intetrest, dividends, deposits, withdrawals
  // TODO: then add ability to show/hide certain changes
  return (
    <div className="w-3/4 flex flex-col justify-center">
      <Frame
        render={(left, right) => {
          const filtered = transactions.slice(left, right);
          return (
            <>
              <BalanceChart transactions={filtered} />
              <CashFlowChart transactions={filtered} />
            </>
          );
        }}
      />
    </div>
  );
}

export default () => (
  <DragAndDrop render={(files) => <Brokerage files={files} />} />
);

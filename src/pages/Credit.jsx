import React, { useState, useEffect } from "react";
import CreditChart from "../components/credit/CreditChart";
import CreditTransactionsTab from "../components/credit/CreditTransactionsTab";
import { parseCreditFile } from "../utils/credit";
import DragAndDrop from "../components/DragAndDrop";
import CreditClassifier from "../components/credit/CreditClassifier";
import { CreditContext } from "../utils/credit";

import "@tensorflow/tfjs-backend-webgl"; // this is important
import usePersisedState from "../utils/usePersistedState";

function Credit({ files }) {
  const [context, setContext] = useState({});

  const [transactions, setTransactions] = useState([]);
  const [manualCategories, setManualCategories] = usePersisedState(
    {},
    "manualCategories",
  );

  // TODO: remember which transactions are classified manually and assert model guesses the same
  const onCategorize = (transaction, category) => {
    const key = JSON.stringify(transaction["vector"]); // must be unique, for unserialized vector access
    // console.log({ key, category });

    setManualCategories({ ...manualCategories, [key]: category });
  };

  useEffect(() => {
    let reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCreditFile(e.target.result).filter(
        (row) => row["transaction"] === "DEBIT",
      );

      setTransactions(rows);
    };
    reader.readAsText(files[0]); // just the first file
  }, []);

  useEffect(() => {
    if (transactions.length) {
      setContext({
        transactions,
        setTransactions,
        manualCategories,
        onCategorize,
      });
    }
  }, [transactions, manualCategories]);

  if (!Object.values(context).length) {
    return;
  }

  // TODO: optimize neighborhood size by evaluating accuracy of predictions given manual classifications
  // TODO: sort by max confidence
  // TODO: add an undo button for the wrong classification
  // TODO: drag and drop a transaction on top of a tab to reclassify
  return (
    <CreditContext.Provider value={context}>
      <div className="font-mono text-xs">
        <CreditClassifier />
        <CreditChart />
        <CreditTransactionsTab />
      </div>
    </CreditContext.Provider>
  );
}

export default () => (
  <DragAndDrop render={(files) => <Credit files={files} />} />
);

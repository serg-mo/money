import React, { useState, useEffect } from "react";
import CreditTransactionsTab from "../components/credit/CreditTransactionsTab";
import { parseCreditFile } from "../utils/credit";
import DragAndDrop from "../components/DragAndDrop";
import CreditClassifier from "../components/credit/CreditClassifier";
import { CreditContext } from "../utils/credit";
import moment from "moment";
import usePersisedState from "../utils/usePersistedState";

function Credit({ files }) {
  const [context, setContext] = useState({});

  const [tab, setTab] = useState(undefined); // TODO: type CATEGORIES,
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
      // TODO: maybe I should figure out todays date and only show 12 months worth
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
        setManualCategories,
        onCategorize,
        tab,
        setTab,
      });
    }
  }, [transactions, manualCategories, tab]);

  if (!Object.values(context).length) {
    return;
  }

  return (
    <CreditContext.Provider value={context}>
      <div className="font-mono text-xs">
        <CreditClassifier />
        <CreditTransactionsTab />
      </div>
    </CreditContext.Provider>
  );
}

export default () => (
  <DragAndDrop render={(files) => <Credit files={files} />} />
);

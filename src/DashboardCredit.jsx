import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import CreditTransactions from "./credit/CreditTransactions";
import { CATEGORIES, parseCreditFile } from "./utils";

import * as tf from "@tensorflow/tfjs";
import * as KNNClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-webgl"; // this is important

// TODO: add arrow key handlers to zoom in/out and shift left/right
// TODO: add count to tab names
export default function DashboardCredit({ file }) {
  const [transactions, setTransactions] = useState([]);
  const [debits, setDebits] = useState([]);
  const [classifier, setClassifier] = useState(null);
  const [tab, setTab] = useState(CATEGORIES.UNCLASSIFIED); // TODO: type CATEGORIES,
  const [isUpdated, setIsUpdated] = useState(false);
  const [neighborhoodSize, setNeighborhoodSize] = useState(2);
  const [manualCategories, setManualCategories] = useState({}); // TODO: consider making it an array of transactions

  const MAX_NEIGHBORHOOD_SIZE = 3;
  const MIN_EXAMPLES = Object.values(CATEGORIES).length; // at least one per category
  const MIN_CONFIDENCE = 0.8;

  useEffect(() => {
    // load transactions from a file into component state
    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader
      const rows = parseCreditFile(lines);
      setTransactions(rows.filter((row) => row["transaction"] === "DEBIT"));
    };
    reader.readAsText(file);

    // https://www.npmjs.com/package/@tensorflow-models/knn-classifier
    setClassifier(KNNClassifier.create());
  }, []); // run once on mount

  // TODO: consider saving the classifier state manually
  /*
  // load existing classifier from local storage, which persists across sessions
  const data = JSON.parse(localStorage.getItem("classifierDataset"));
  if (data && data.length) {
    const unserialized = Object.fromEntries(
      data.map(([label, data, shape]) => [label, tf.tensor(data, shape)]),
    );

    console.log("Restoring classifierDataset");
    classifier.setClassifierDataset(unserialized);
    setIsUpdated(true);
  }


  // console.log(`Add ${key} ${category}`, classifier.getClassExampleCount());
  let serialized = Object.entries(classifier.getClassifierDataset()).map(
    ([label, data]) => [label, Array.from(data.dataSync()), data.shape],
  );
  localStorage.setItem("classifierDataset", JSON.stringify(serialized));
  */

  useEffect(() => {
    const manuals = JSON.parse(localStorage.getItem("manualCategories"));
    if (manuals && Object.values(manuals).length) {
      console.log("Restoring manualCategories");
      setManualCategories(manuals);
    }
  }, []);

  const persistState = () => {
    if (manualCategories && Object.values(manualCategories).length) {
      console.log("Persisting manualCategories");
      localStorage.setItem(
        "manualCategories",
        JSON.stringify(manualCategories),
      );
    }
  };

  const resetState = () => {
    classifier.clearAllClasses();
    localStorage.removeItem("manualCategories");
    setManualCategories({});

    setIsUpdated(true);
  };

  // NOTE: the curse of dimentionality, more dimensions => very tighly distributed distances among vectors
  const predictOne = async (transaction) => {
    // NOTE: must be a tensor + string label
    const tensor = tf.tensor(transaction["vector"]);
    const { label, confidences } = await classifier.predictClass(
      tensor,
      neighborhoodSize,
    );

    let category = label; // label predicted, t.category original
    const maxConfidence = confidences[label];

    // TODO: do not replace anything unless it's above a minimum confidence
    for (const [cat, confidence] of Object.entries(confidences)) {
      if (confidence >= MIN_CONFIDENCE) {
        category = cat;
      }
    }

    return {
      ...t,
      category,
      confidences,
      maxConfidence, // TODO: sort by this
    };
  };

  const getClassifierStats = () => {
    // TODO: it would be nice to see a progress icon for this
    const counts = classifier.getClassExampleCount();
    const examples = Object.values(counts).reduce((a, c) => a + c, 0);
    const classes = Object.values(counts).length;

    return [classes, examples];
  };

  const predictAll = async () => {
    // re-categorize when classifier and transactions are loaded, but not categorized
    if (!transactions.length) {
      console.log(`No categorize, because no transactions`);
      return;
    }

    if (!classifier.getNumClasses()) {
      console.log(`No categorize because no classes`);
      return;
    }

    // TODO: it would be nice to see a progress icon for this
    const [classes, examples] = getClassifierStats();
    if (examples < MIN_EXAMPLES) {
      console.log(`No categorize because not enough examples`);
      return;
    }

    console.log(
      `Categorize ${classes} classes of ${examples} examples at ${neighborhoodSize} neighborhoood size`,
    );

    const newTransactions = await Promise.all(transactions.map(predictOne));
    setTransactions(newTransactions);
  };

  const getErrorRate = () => {
    const total = Object.values(manualCategories).length;

    // TODO: loop through manualCategories, reconstruct the dataset, pick a neighborhood size
    Object.entries(manualCategories).map(([key, category]) => {
      // NOTE: must be a tensor + string label
      const tensor = tf.tensor(transactions[key]["vector"]);
      classifier.addExample(tensor, category);

      console.log(`Learning that transaction ${key} is ${category}`);
    });

    const [classes, examples] = getClassifierStats();
    console.log(`${classes} classes and ${examples} examples`);

    // TODO: loop through manualCategories, predictOne, compare to actual
  };

  // debits change when transactions change, but that only happens once per session
  useEffect(() => {
    if (transactions.length) {
      setDebits(transactions.filter((row) => row["transaction"] === "DEBIT"));
    }
  }, [transactions]);

  // TODO: remember which transactions are classified manually and assert model guesses the same
  const onCategorize = (transaction, category) => {
    setManualCategories({
      ...manualCategories,
      [transaction["key"]]: category,
    });

    persistState();
  };

  if (!debits.length) {
    return;
  }

  const [classes, examples] = getClassifierStats();
  // TODO: do not classify until a minimum number of examples

  let tabTransactions = transactions; // default to ALL

  if (tab === "ACTUALS") {
    // TODO: make actuals
  } else if (tab === "GUESSES") {
    // TODO: make guesses
  } else {
    tabTransactions = transactions.filter((t) => t["category"] === tab);
  }

  /*
  if (Object.values(manualCategories).length) {
    tabTransactions = tabTransactions.map((transaction) => {
      return {
        ...transaction,
        category:
          manualCategories[transaction["key"]] ?? transaction["category"],
      };
    });
    console.log(tabTransactions);
  }
  */

  const buttonClass =
    "m-1 p-2 text-xl text-white bg-blue-400 hover:bg-blue-500 rounded-xl";
  const tabClass = "p-1 font-medium bg-gray-200 hover:bg-gray-400";
  const activeTabClass = "bg-gray-400";

  // TODO: optimize neighborhood size by evaluating accuracy of predictions given manual classifications
  // TODO: sort by max confidence
  // TODO: add an undo button for the wrong classification
  // TODO: use context to access transactions
  // TODO: these should be tabs + a tab for each category
  // TODO: I can drag and drop a transaction on top of a tab to reclassify
  // TODO: consider showing the example counts in each category tab
  return (
    <div className="font-mono text-xs">
      <div className="flex flex-row justify-center">
        <button
          className={buttonClass}
          onClick={() => (tabTransactions = transactions)}
        >
          ALL
        </button>
        <button
          className={buttonClass}
          onClick={() => (tabTransactions = transactions)}
        >
          Actuals (TODO)
        </button>
        <button
          className={buttonClass}
          onClick={() => (tabTransactions = transactions)}
        >
          Guesses (TODO)
        </button>
        <button className={buttonClass} onClick={predictAll}>
          Categorize
        </button>
        <button
          className={buttonClass}
          onClick={() => confirm("Are you sure?") && resetState()}
        >
          Reset
        </button>
        <button className={buttonClass} onClick={getErrorRate}>
          Errors
        </button>
      </div>
      <div className="text-center">
        <div>{`${classes}/${Object.values(CATEGORIES).length} classes`}</div>
        <div>{`${examples}/${MIN_EXAMPLES} examples`}</div>
        <div>{`${Object.values(manualCategories).length}/${MIN_EXAMPLES} manual`}</div>
        <select
          value={neighborhoodSize}
          onChange={(e) => setNeighborhoodSize(e.target.value)}
        >
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      {false && <RecurringCharges transactions={debits} />}
      {false && (
        <CreditTransactions
          title="ALL"
          transactions={debits}
          onCategorize={onCategorize}
        />
      )}

      <CreditChart transactions={debits} />

      <div className="text-sm divide-x-1 divide-blue-400 divide-solid">
        {Object.values(CATEGORIES).map((category, key) => (
          <button
            className={`${tabClass} ${category === tab ? activeTabClass : ""}`}
            key={key}
            onClick={() => setTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <CreditTransactions
        title={tab}
        transactions={tabTransactions}
        onCategorize={onCategorize}
      />
    </div>
  );
}

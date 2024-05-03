import React, { useState, useEffect } from "react";
import CreditChart from "../components/credit/CreditChart";
import RecurringCharges from "../components/credit/RecurringCharges";
import CreditTransactions from "../components/credit/CreditTransactions";
import CreditTransactionsCategory from "../components/credit/CreditTransactionsCategory";
import { CATEGORIES, parseCreditFile } from "../utils/credit";
import DragAndDrop from "../components/DragAndDrop";
import CreditClassifier from "../components/credit/CreditClassifier";

import { tensor } from "@tensorflow/tfjs";
import * as KNNClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-webgl"; // this is important

// TODO: add arrow key handlers to zoom in/out and shift left/right
// TODO: add counts to tab names

function Credit({ files }) {
  const [transactions, setTransactions] = useState([]);

  const [classifier, setClassifier] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [neighborhoodSize, setNeighborhoodSize] = useState(2);
  const [manualCategories, setManualCategories] = useState({}); // TODO: consider making it an array of transactions

  const MAX_NEIGHBORHOOD_SIZE = 3;
  const MIN_EXAMPLES = Object.values(CATEGORIES).length; // at least one per category
  const MIN_CONFIDENCE = 0.8;

  useEffect(() => {
    let reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCreditFile(e.target.result);
      setTransactions(rows.filter((row) => row["transaction"] === "DEBIT"));
    };
    reader.readAsText(files[0]);

    // https://www.npmjs.com/package/@tensorflow-models/knn-classifier
    setClassifier(KNNClassifier.create());
  }, []); // run once on mount

  // TODO: consider saving the classifier state manually
  // // load existing classifier from local storage, which persists across sessions
  // const data = JSON.parse(localStorage.getItem("classifierDataset"));
  // if (data && data.length) {
  //   const unserialized = Object.fromEntries(
  //     data.map(([label, data, shape]) => [label, tf.tensor(data, shape)]),
  //   );
  //   console.log("Restoring classifierDataset");
  //   classifier.setClassifierDataset(unserialized);
  //   setIsUpdated(true);
  // }
  // // console.log(`Add ${key} ${category}`, classifier.getClassExampleCount());
  // let serialized = Object.entries(classifier.getClassifierDataset()).map(
  //   ([label, data]) => [label, Array.from(data.dataSync()), data.shape],
  // );
  // localStorage.setItem("classifierDataset", JSON.stringify(serialized));

  const initializeManualCategories = () => {
    const manuals = JSON.parse(localStorage.getItem("manualCategories"));
    if (manuals && Object.values(manuals).length) {
      console.log("Restoring manualCategories");
      setManualCategories(manuals);
    }
  };
  useEffect(initializeManualCategories, []);

  const persistManualCategories = () => {
    if (manualCategories && Object.values(manualCategories).length) {
      console.log("Persisting manualCategories");
      localStorage.setItem(
        "manualCategories",
        JSON.stringify(manualCategories),
      );
    }
  };

  // NOTE: the curse of dimentionality, more dimensions => very tighly distributed distances among vectors
  const predictOne = async (transaction) => {
    // NOTE: must be a tensor + string label
    const tensor = tensor(transaction["vector"]);
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

  // TODO: remember which transactions are classified manually and assert model guesses the same
  const onCategorize = (transaction, category) => {
    setManualCategories({
      ...manualCategories,
      [transaction["key"]]: category,
    });

    persistManualCategories();
  };

  if (!transactions.length) {
    return;
  }
  // TODO: do not classify until a minimum number of examples
  // TODO: optimize neighborhood size by evaluating accuracy of predictions given manual classifications
  // TODO: sort by max confidence
  // TODO: add an undo button for the wrong classification
  // TODO: use context to access transactions and classifier
  // TODO: drag and drop a transaction on top of a tab to reclassify
  return (
    <div className="font-mono text-xs">
      <CreditClassifier classifier={classifier} />
      <CreditChart transactions={transactions} />
      <CreditTransactionsCategory {...{ transactions, onCategorize }} />
    </div>
  );
}

export default () => (
  <DragAndDrop render={(files) => <Credit files={files} />} />
);

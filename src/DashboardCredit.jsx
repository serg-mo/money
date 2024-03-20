import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import CreditTransactions from "./credit/CreditTransactions";
import { CATEGORIES, parseCreditFile, normalizeName } from "./utils";

import * as tf from "@tensorflow/tfjs";
import * as KNNClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-webgl"; // this is important
import * as use from "@tensorflow-models/universal-sentence-encoder";

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function DashboardCredit({ file }) {
  const [embeddings, setEmbeddings] = useState([]); // transaction names converted to numbers
  const [transactions, setTransactions] = useState([]);
  const [debits, setDebits] = useState([]);
  const [isCategorized, setIsCategorized] = useState(false);

  const [tokenizerModel, setTokenizerModel] = useState(null);
  const [classifier, setClassifier] = useState(null);

  useEffect(() => {
    // load transactions from a file into component state
    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader
      setTransactions(parseCreditFile(lines));
    };
    reader.readAsText(file);

    // https://www.npmjs.com/package/@tensorflow-models/universal-sentence-encoder
    use.load().then(setTokenizerModel);

    // https://www.npmjs.com/package/@tensorflow-models/knn-classifier
    setClassifier(KNNClassifier.create());
  }, []); // run once on mount

  useEffect(() => {
    // load existing classifier from local storage, which persists across sessions
    const str = JSON.parse(localStorage.getItem("classifierDataset"));
    if (classifier && str && str.length) {
      const unserialized = Object.fromEntries(
        str.map(([label, data, shape]) => [label, tf.tensor(data, shape)]),
      );

      classifier.setClassifierDataset(unserialized);
    }
  }, [classifier]);

  // TODO: apply this function to every transaction
  const predict = async (t, key) => {
    // NOTE: must be a tensor + string label
    const tensor = tf.tensor(embeddings[key]);
    const { label, confidences } = await classifier.predictClass(tensor, 3); // neighborhood size

    // TODO: do not replace anything unless it's above a minimum confidence
    const minConfidence = 0.8;
    let category = t.category; // original category

    for (const [cat, confidence] of Object.entries(confidences)) {
      if (confidence >= minConfidence) {
        category = cat;
      }
    }

    return {
      ...t,
      category,
      confidences,
    };
  };

  useEffect(() => {
    // NOTE: model and transactions are loaded asynchronously
    if (!tokenizerModel || !transactions.length || embeddings.length) {
      return;
    }

    const names = transactions.map((t) => normalizeName(t["name"]));
    tokenizerModel.embed(names).then((tensor) => {
      tensor.array().then(setEmbeddings); // numeric vector of 512 values
    });
  }, [tokenizerModel, transactions, embeddings]);

  const categorize = async () => {
    // re-categorize when classifier and transactions are loaded, but not categorized
    if (!embeddings.length) {
      console.log(`No categorize, because no embeddings`);
      return;
    }

    if (!classifier.getNumClasses()) {
      console.log(`No categorize because no classes`);
      return;
    }

    console.log(`Categorize with ${classifier.getNumClasses()} classes`);
    console.log(classifier.getClassExampleCount());

    const newTransactions = await Promise.all(transactions.map(predict));
    console.log(
      newTransactions.map(({ name, category, confidences }) => {
        return { name, category, confidences };
      }),
    );

    setTransactions(newTransactions);
  };

  // debits change when transactions change, but that only happens once per session
  useEffect(() => {
    if (transactions.length) {
      setDebits(transactions.filter((row) => row["transaction"] === "DEBIT"));
    }
  }, [transactions]);

  const onCategorize = (key, category) => {
    // NOTE: it takes a while for these to load, so ignore clicks for now
    if (!embeddings.length) {
      console.log("Embeddings are empty");
      return;
    }

    // NOTE: must be a tensor + string label
    const tensor = tf.tensor(embeddings[key]);
    classifier.addExample(tensor, category);

    // console.log(`Add ${key} ${category}`, classifier.getClassExampleCount());
    let serialized = Object.entries(classifier.getClassifierDataset()).map(
      ([label, data]) => [label, Array.from(data.dataSync()), data.shape],
    );

    localStorage.setItem("classifierDataset", JSON.stringify(serialized));
  };

  if (!debits.length) {
    return;
  }

  const unclassified = debits.filter(
    (t) => t["category"] === CATEGORIES.UNCLASSIFIED,
  );

  // TODO: use context to access debits
  // TODO: these should be tabs + a tab for each category
  // TODO: I can drag and drop a transaction on top of a tab to reclassify
  return (
    <div className="font-mono text-xs">
      <div className="text-center">
        {isCategorized ? "is Categorized" : "is not Categorized"} &nbsp;
        {Object.keys(embeddings).length} embeddings
      </div>

      <button onClick={categorize}>Categorize</button>

      <CreditChart transactions={debits} />
      <RecurringCharges transactions={debits} />
      <CreditTransactions
        title="ALL"
        transactions={debits}
        onCategorize={onCategorize}
      />
      <CreditTransactions
        title={CATEGORIES.UNCLASSIFIED}
        transactions={unclassified}
        onCategorize={onCategorize}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import CreditTransactions from "./credit/CreditTransactions";
import { CATEGORIES, parseCreditFile } from "./utils";

import * as tf from "@tensorflow/tfjs";
import * as KNNClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-webgl"; // this is important
import * as use from "@tensorflow-models/universal-sentence-encoder";

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function DashboardCredit({ file }) {
  const [embeddings, setEmbeddings] = useState([]); // transaction names converted to numbers
  const [transactions, setTransactions] = useState([]);
  const [debits, setDebits] = useState([]);
  const [isTokenized, setIsTokenized] = useState(false);
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
    const data = JSON.parse(localStorage.getItem("classifierDataset"));
    if (classifier && data && Object.keys(data).length) {
      console.log("setting classifier data");
      console.log(data);
      classifier.setClassifierDataset(data);
    }
  }, [classifier]);

  // TODO: apply this function to every transaction
  const predict = async (t, key) => {
    // NOTE: must be a tensor + string label
    const tensor = tf.tensor(embeddings[key]);
    const prediction = await classifier.predictClass(tensor, 1); // neighborhood size

    return {
      ...t,
      category: prediction.label,
      confidences: prediction.confidences,
    };
  };

  useEffect(() => {
    if (isTokenized) {
      return;
    }

    // NOTE: model and transactions are loaded asynchronously
    if (!tokenizerModel || !transactions.length) {
      return;
    }

    const names = transactions.map((t) => t["name"]);
    tokenizerModel.embed(names).then((tensor) => {
      tensor
        .array()
        .then(setEmbeddings) // numeric vector of 512 values
        .then(() => {
          setIsTokenized(true);
        });
    });
  }, [tokenizerModel, transactions]);

  const categorize = () => {
    console.log(`Reclassifiying with ${classifier.getNumClasses()} classes`);
    // console.log(classifier.getClassExampleCount());

    /*
    predict(transactions[0], 0).then((v) =>
      console.log(`${v.name} ${v.category}`),
    );
    */

    // setTransactions((existing) => existing.map(predict));
    setIsCategorized(true); // stop infinite re-categorization
  };

  useEffect(() => {
    // re-categorize when classifier and transactions are loaded, but not categorized
    if (!isTokenized) {
      console.log(`No categorize, because not tokenized`);
      return;
    }

    if (isCategorized) {
      console.log(`No categorize, because already categorized`);
      return;
    }

    if (!classifier.getNumClasses()) {
      console.log(`No categorize because no classes`);
      return;
    }

    categorize();
  }, [isTokenized, isCategorized]);

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
    localStorage.setItem(
      "classifierDataset",
      JSON.stringify(classifier.getClassifierDataset()),
    );

    categorize();
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
        {isTokenized ? "is Tokenized" : "is not Tokenized"} &nbsp;
        {isCategorized ? "is Categorized" : "is not Categorized"} &nbsp;
        {Object.keys(embeddings).length} embeddings
      </div>

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

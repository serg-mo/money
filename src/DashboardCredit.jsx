import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import CreditTransactions from "./credit/CreditTransactions";
import {
  CATEGORIES,
  parseCreditFile,
  getCategory,
  normalizeName,
} from "./utils";

// import * as KNNClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-webgl"; // this is important
import * as use from "@tensorflow-models/universal-sentence-encoder";

/*
// Load the model.
use.loadTokenizer().then((tokenizer) => {
  // Embed an array of sentences.
  console.log(tokenizer);

  console.log(tokenizer.encode("Hello, how are you?")); // [341, 4125, 8, 140, 31, 19, 54]

  return tokenizer.encode(str); // [341, 4125, 8, 140, 31, 19, 54]
});

/*
async function vectorize(str) {
  // https://www.npmjs.com/package/@tensorflow-models/universal-sentence-encoder
  const tokenizer = await loadTokenizer();
  console.log(tokenizer);

  console.log(tokenizer.encode("Hello, how are you?")); // [341, 4125, 8, 140, 31, 19, 54]

  return tokenizer.encode(str); // [341, 4125, 8, 140, 31, 19, 54]
}
*/

/*
function knn() {
  // https://www.npmjs.com/package/@tensorflow-models/knn-classifier
  const classifier = KNNClassifier.create();

  // TODO: category is my classification, can be string
  classifier.addExample(embeddings, 0);
  classifier.addExample(embeddings, 1);

  // console.log("Predictions:");
  // console.log(classifier.predictClass(xlogits));
}
*/

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function DashboardCredit({ file }) {
  const [transactions, setTransactions] = useState([]);
  const [debits, setDebits] = useState([]);
  const [rules, setRules] = useState({});
  const [isCategorized, setIsCategorized] = useState(true);
  const [tokenizerModel, setTokenizerModel] = useState(null);

  useEffect(() => {
    // load existing rules from local storage, which persists across sessions
    const existingRules = JSON.parse(localStorage.getItem("rules"));
    if (existingRules && Object.keys(existingRules).length) {
      setRules(existingRules);
    }

    // load transactions from a file into component state
    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader
      setTransactions(parseCreditFile(lines));
      setIsCategorized(false); // trigger re-categorization
    };
    reader.readAsText(file);
  }, []);

  useEffect(() => {
    use.load().then((model) => {
      setTokenizerModel(model);
    });
  }, []); // run once on mount

  useEffect(() => {
    if (tokenizerModel) {
      // TODO: transaction memos converted to numbers
      const sentences = ["Hello.", "How are you?"];
      tokenizerModel.embed(sentences).then((embeddings) => {
        // `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence.
        // So in this example `embeddings` has the shape [2, 512].
        embeddings.array().then((array) => console.log(array));
        // Returns the flattened data that backs the tensor.
        embeddings.data().then((data) => console.log(data));

        console.log(embeddings);
        console.log(embeddings.values);
      });
    }
  }, [tokenizerModel]);

  // when rules change, persist them
  useEffect(() => {
    if (Object.keys(rules).length) {
      localStorage.setItem("rules", JSON.stringify(rules));
    }
  }, [rules]);

  useEffect(() => {
    // NOTE: rules and transactions are loaded asynchronously
    // re-categorize when rules and transactions are loaded, but not categorized (initial state)
    if (Object.keys(rules).length && transactions.length && !isCategorized) {
      setTransactions((existing) =>
        existing.map((t) => {
          return { ...t, category: getCategory(t["name"], rules) };
        }),
      );

      setIsCategorized(true); // stop infinite re-categorization
    }
  }, [rules, isCategorized]);

  // debits change when transactions change, but that only happens once per session
  useEffect(() => {
    if (transactions.length) {
      setDebits(transactions.filter((row) => row["transaction"] === "DEBIT"));
    }
  }, [transactions]);

  const onCategorize = (name, category) => {
    // prune/normalize the name to remove any unique identifiers
    name = normalizeName(name);

    // overwrite any existing rules for that name
    setRules((existing) => {
      return { ...existing, [name]: category };
    });
    setIsCategorized(false); // trigger re-categorization
  };

  if (!debits.length) {
    return;
  }

  const unclassified = debits.filter(
    (t) => t["category"] === CATEGORIES.UNCLASSIFIED,
  );

  // TODO: pruning rules would be a good place to apply getLongestCommonPrefix
  // group by category, find a prefix, replace them all with a single rule

  // TODO: use context to access debits
  // TODO: these should be tabs + a tab for each category
  return (
    <div className="font-mono text-xs">
      <div className="text-center">{Object.keys(rules).length} rules</div>

      <CreditChart transactions={debits} />
      <RecurringCharges transactions={debits} />
      <CreditTransactions
        title={CATEGORIES.UNCLASSIFIED}
        transactions={unclassified}
        onCategorize={onCategorize}
      />
    </div>
  );
}

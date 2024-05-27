import React, { useState, useContext, useEffect } from "react";
import { CreditContext } from "../../utils/credit";
import { CATEGORIES } from "../../utils/credit";
import { tensor } from "@tensorflow/tfjs";
import usePersistedState from "../../utils/usePersistedState";
import * as KNNClassifier from "@tensorflow-models/knn-classifier";

export default function CreditClassifier() {
  const { transactions, setTransactions, manualCategories, setTab } =
    useContext(CreditContext);
  const [classifier, setClassifier] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // [classifierState, setClassifierState] = usePersistedState({}, "classifier");

  // TODO: do not classify until a minimum number of examples
  // TODO: optimize neighborhood size by evaluating accuracy of predictions given manual classifications
  // TODO: sort by max confidence
  // TODO: add an undo button for the wrong classification
  // TODO: use context to access transactions and classifier
  // TODO: drag and drop a transaction on top of a tab to reclassify
  const MAX_NEIGHBORHOOD_SIZE = 3;
  const MIN_EXAMPLES = Object.values(CATEGORIES).length; // at least one per category
  const MIN_CONFIDENCE = 0.8;

  const [neighborhoodSize, setNeighborhoodSize] = useState(2);

  useEffect(() => {
    if (classifier) {
      return;
    }
    // https://www.npmjs.com/package/@tensorflow-models/knn-classifier
    setClassifier(KNNClassifier.create());
  }, [classifier]);

  // TODO: consider saving the classifier state manually
  // load existing classifier from local storage, which persists across sessions
  useEffect(() => {
    if (!classifier) {
      return;
    }

    if (!Object.values(manualCategories).length) {
      return;
    }

    classifier.clearAllClasses();

    // TODO: loop through manualCategories, reconstruct the dataset, pick a neighborhood size
    Object.entries(manualCategories).map(([serialized, category]) => {
      const parsed = JSON.parse(serialized);
      classifier.addExample(tensor(parsed), category); // must be a tensor + string label
    });

    predictAll();
    setIsLoaded(true);

    // if (classifierState && classifierState.length) {
    //   const dataset = Object.fromEntries(
    //     classifierState.map(([label, data, shape]) => [label, tensor(data, shape)]),
    //   );
    //   console.log("Restoring classifierDataset");
    //   classifier.setClassifierDataset(dataset);
    // }
    // else {
    //   // console.log(`Add ${key} ${category}`, classifier.getClassExampleCount());
    //   let serialized = Object.entries(classifier.getClassifierDataset()).map(
    //     ([label, data]) => [label, Array.from(data.dataSync()), data.shape],
    //   );
    //   localStorage.setItem("classifierDataset", JSON.stringify(serialized));
    // }
  }, [classifier, manualCategories]);

  // TODO: consider making a chart for this
  const getClassifierStats = () => {
    const counts = classifier.getClassExampleCount();
    const examples = Object.values(counts).reduce((a, c) => a + c, 0);
    const classes = Object.values(counts).length;

    return { classes, examples };
  };

  // NOTE: the curse of dimentionality, more dimensions => very tighly distributed distances among vectors
  const predictOne = async (transaction) => {
    // NOTE: must be a tensor + string label
    const { label: category, confidences } = await classifier.predictClass(
      tensor(transaction["vector"]),
      neighborhoodSize,
    );

    // category is predicted label to replace the existing one
    const maxConfidence = confidences[category];

    // TODO: do not replace anything unless it's above a minimum confidence
    // for (const [cat, confidence] of Object.entries(confidences)) {
    //   if (confidence >= MIN_CONFIDENCE) {
    //     category = cat;
    //   }
    // }

    return {
      ...transaction,
      category,
      confidences,
      maxConfidence, // TODO: sort by this
    };
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
    const { classes, examples } = getClassifierStats();
    if (examples < MIN_EXAMPLES) {
      console.log(`Not enough examples, ${examples} < ${MIN_EXAMPLES}`);
      return;
    }
    console.log(
      `Categorize ${classes} classes of ${examples} examples at ${neighborhoodSize} neighborhoood size`,
    );

    await Promise.all(transactions.map(predictOne)).then(setTransactions);
  };

  const resetState = () => {
    classifier.clearAllClasses();
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // TODO: it would be nice to see a progress icon for this
  const { classes, examples } = getClassifierStats();

  const buttonClass =
    "m-2 py-1 px-2 text-l text-slate bg-blue-300 hover:bg-blue-600 rounded-xl";

  return (
    <>
      <div className="flex flex-row justify-center">
        <button className={buttonClass} onClick={() => setTab(undefined)}>
          ALL
        </button>
        <button
          className={buttonClass}
          onClick={() => console.log("tabTransactions = transactions")}
        >
          Actuals (TODO)
        </button>
        <button
          className={buttonClass}
          onClick={() => console.log("tabTransactions = transactions")}
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
      </div>
      <div className="text-center">
        <div>{`${classes}/${Object.values(CATEGORIES).length} classes`}</div>
        <div>{`${examples}/${MIN_EXAMPLES} examples`}</div>
        <div>{`${Object.values(manualCategories).length}/${MIN_EXAMPLES} min manual`}</div>
        <div>{`neighborhood size ${neighborhoodSize}`}</div>
        {/* <select
          value={neighborhoodSize}
          onChange={(e) => setNeighborhoodSize(e.target.value)}
        >
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <div>neighborhood</div> */}
      </div>
    </>
  );
}

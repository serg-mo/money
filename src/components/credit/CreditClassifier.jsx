import * as KNNClassifier from '@tensorflow-models/knn-classifier';
import { tensor } from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl'; // this is important
import React, { useContext, useEffect, useState } from 'react';
import { COLORS, CreditContext } from '../../utils/credit';

function cosineSimilarity(arr1, arr2) {
  const dotProduct = arr1.reduce(
    (acc, val, index) => acc + val * arr2[index],
    0
  );
  const magnitude1 = Math.sqrt(arr1.reduce((acc, val) => acc + val ** 2, 0));
  const magnitude2 = Math.sqrt(arr2.reduce((acc, val) => acc + val ** 2, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

function knnLabelDistribution(data, active, k = 30) {
  // data is vector => label
  const similarities = Object.keys(data).map((key) => {
    const vector = JSON.parse(key);
    return cosineSimilarity(vector, active['vector']);
  });

  const sortedNeighbors = similarities
    .map((similarity, index) => ({ index, similarity }))
    .sort((a, b) => b.similarity - a.similarity) // desc
    .slice(0, k)
    .map((item) => data[item.index]); // label

  const labelCounts = sortedNeighbors.reduce((acc, label) => {
    acc[label] = acc[label] ? acc[label] + 1 : 1;
    return acc;
  }, {});

  const totalNeighbors = sortedNeighbors.length;
  const confidences = Object.keys(labelCounts).reduce((acc, label) => {
    acc[label] = labelCounts[label] / totalNeighbors;
    return acc;
  }, {});

  let maxConfidenceLabel = null;
  let maxConfidence = -1;
  Object.entries(confidences).forEach(([label, confidence]) => {
    if (confidence > maxConfidence) {
      maxConfidence = confidence;
      maxConfidenceLabel = label;
    }
  });

  return { label: maxConfidenceLabel, confidences };
}

export default function CreditClassifier() {
  const {
    transactions,
    setTransactions,
    manualCategories,
    setManualCategories,
  } = useContext(CreditContext);
  const [classifier, setClassifier] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0.6);

  // [classifierState, setClassifierState] = usePersistedState({}, "classifier");

  // TODO: add an undo button for the wrong classification
  // TODO: do not classify until a minimum number of examples
  // TODO: drag and drop a transaction on top of a tab to reclassify
  // TODO: optimize neighborhood size by evaluating accuracy of predictions given manual classifications
  // TODO: sort by max confidence
  // TODO: use context to access transactions and classifier
  const MIN_EXAMPLES = Object.keys(COLORS).length; // at least one per category

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
    if (!classifier || !Object.values(manualCategories).length) {
      return;
    }

    classifier.clearAllClasses();

    Object.entries(manualCategories).map(([serialized, category]) => {
      const example = tensor(JSON.parse(serialized));
      classifier.addExample(example, category); // must be a tensor + string label
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

  // TODO: consider getting rid of classifier completely, it is nice at the beginning though
  // NOTE: the curse of dimentionality, more dimensions => very tighly distributed distances among vectors
  const predictOne = async (transaction) => {
    // NOTE: must be a tensor + string label
    const { label, confidences } = await classifier.predictClass(
      tensor(transaction['vector']),
      neighborhoodSize
    );

    // TODO: stick with the regular classifier for now
    // console.log("Regular classifier", { label, confidences });
    // console.log(
    //   "KNN classifier",
    //   knnLabelDistribution(manualCategories, transaction),
    // );

    // category is predicted label to replace the existing one, if over minConfidence
    const maxConfidence = confidences[label];
    const category = maxConfidence >= minConfidence ? label : transaction.category;
    const manual = manualCategories[JSON.stringify(transaction['vector'])] ?? null;

    return {
      ...transaction,
      category: manual ?? category,
      confidences,
      maxConfidence,
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
    console.log(JSON.stringify({ classes, examples, neighborhoodSize }));

    await Promise.all(transactions.map(predictOne)).then(setTransactions);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // TODO: it would be nice to see a progress icon for this
  const { classes, examples } = getClassifierStats();

  const resetState = () => {
    classifier.clearAllClasses();
    setManualCategories({});
  };

  // return <ProgressBar value={examples / MIN_EXAMPLES} />
  // return null;

  return (
    <div className="flex flex-row items-center justify-center text-center divide-x divide-slate-500">
      <div className="px-2">
        {classes}/{Object.keys(COLORS).length} categories
      </div>
      <div className="px-2">
        {examples} examples [{MIN_EXAMPLES} min]
      </div>
      <div className="px-2">
        {Object.values(manualCategories).length} manual
      </div>
      <div className="px-2">{neighborhoodSize} neighborhood</div>
      <div className="px-2">
        <a className="cursor-pointer" onClick={() => confirm('Are you sure?') && resetState()}>
          Reset
        </a>
      </div>
    </div>
  );
}

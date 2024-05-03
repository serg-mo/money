import React from "react";
import { CATEGORIES } from "../../utils/credit";

export default function CreditClassifier({ classifier }) {
  const predictAll = async () => {
    // // re-categorize when classifier and transactions are loaded, but not categorized
    // if (!transactions.length) {
    //   console.log(`No categorize, because no transactions`);
    //   return;
    // }
    // if (!classifier.getNumClasses()) {
    //   console.log(`No categorize because no classes`);
    //   return;
    // }
    // // TODO: it would be nice to see a progress icon for this
    // const [classes, examples] = getClassifierStats();
    // if (examples < MIN_EXAMPLES) {
    //   console.log(`No categorize because not enough examples`);
    //   return;
    // }
    // console.log(
    //   `Categorize ${classes} classes of ${examples} examples at ${neighborhoodSize} neighborhoood size`,
    // );
    // const newTransactions = await Promise.all(transactions.map(predictOne));
    // setTransactions(newTransactions);
  };

  const resetState = () => {
    // classifier.clearAllClasses();
    // localStorage.removeItem("manualCategories");
    // setManualCategories({});
    // setIsUpdated(true);
  };

  const getErrorRate = () => {
    // const total = Object.values(manualCategories).length;
    // // TODO: loop through manualCategories, reconstruct the dataset, pick a neighborhood size
    // Object.entries(manualCategories).map(([key, category]) => {
    //   // NOTE: must be a tensor + string label
    //   const tensor = tf.tensor(transactions[key]["vector"]);
    //   classifier.addExample(tensor, category);
    //   console.log(`Learning that transaction ${key} is ${category}`);
    // });
    // const [classes, examples] = getClassifierStats();
    // console.log(`${classes} classes and ${examples} examples`);
    // TODO: loop through manualCategories, predictOne, compare to actual
  };

  // TODO: it would be nice to see a progress icon for this
  const counts = classifier.getClassExampleCount();
  const examples = Object.values(counts).reduce((a, c) => a + c, 0);
  const classes = Object.values(counts).length;

  const buttonClass =
    "m-2 py-1 px-2 text-l text-slate bg-blue-300 hover:bg-blue-600 rounded-xl";

  return (
    <>
      <div className="flex flex-row justify-center">
        <button
          className={buttonClass}
          onClick={() => console.log("tabTransactions = transactions")}
        >
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
        <div>neighborhood</div>
      </div>
    </>
  );
}

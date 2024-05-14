import React, { useEffect, useState } from "react";
import { parseDividendFile, DividendContext } from "../utils/dividends";
import DividendDash from "../components/dividends/DividendDash";
import DragAndDrop from "../components/DragAndDrop";
import { loadFileContent } from "../utils/common";

// TODO: compute delta/buy/sell/total for a given candidate

// google sheets solver has been broken for a while, so this is my own evolutionary solver
function Dividends({ files }) {
  const [context, setContext] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    // first file only
    loadFileContent(files[0]).then(parseDividendFile).then(setContext);
    //.catch((e) => setError(e.message));
  }, [files]);

  if (error) {
    return <div className="text-red-300">{error}</div>;
  }

  if (!Object.keys(context).length) {
    return <div className="w-3/4">Loading...</div>;
  }

  return (
    <DividendContext.Provider value={context}>
      <div className="flex flex-col justify-center items-center">
        <DividendDash />
      </div>
    </DividendContext.Provider>
  );
}

export default () => (
  <DragAndDrop render={(files) => <Dividends files={files} />} />
);

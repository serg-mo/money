import React, { useEffect, useState } from "react";
import DividendDash from "../components/dividends/DividendDash";
import { DividendContext, parseDividendFile } from "../utils/dividends";

export default function Dividends({ txt }) {
  const [context, setContext] = useState(null);

  useEffect(() => {
    if (txt && !context) {
      parseDividendFile(txt).then(setContext); // this one is async
    }
  }, [context, txt]);

  if (!context) {
    return;
  }

  return (
    <DividendContext.Provider value={context}>
      <div className="flex flex-col justify-center items-center">
        <DividendDash />
      </div>
    </DividendContext.Provider>
  );
}

import React, { useState, useContext, useEffect } from "react";
import { parseDividendFile, DividendContext } from "../utils/dividends";
import { FilesContext } from "../utils/common";
import DividendDash from "../components/dividends/DividendDash";

export default function Dividends() {
  const files = useContext(FilesContext);
  const { txt } = files.find(({ type }) => type === "dividend") || {};

  const [context, setContext] = useState(null);

  useEffect(() => {
    if (txt && !context) {
      setContext(parseDividendFile(txt));
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

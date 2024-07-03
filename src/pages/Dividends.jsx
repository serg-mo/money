import React, { useState, useContext } from "react";
import { parseDividendFile, DividendContext } from "../utils/dividends";
import { FilesContext } from "../utils/common";
import DividendDash from "../components/dividends/DividendDash";

export default function Dividends() {
  const [context, setContext] = useState({});

  const files = useContext(FilesContext);
  const { txt } = files.find(({ type }) => type === "dividend")

  parseDividendFile(txt).then(setContext);

  if (!Object.keys(context).length) {
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

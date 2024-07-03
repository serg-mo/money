import React, { useState } from "react";
import Target from "./Target";
import { isMatchingFile } from "../utils/common";
import { REQUIRED_COLS as CREDIT_REQUIRED_COLS } from "../utils/credit";
import { REQUIRED_COLS as DIVIDEND_REQUIRED_COLS } from "../utils/dividends";
import { REQUIRED_COLS as BROKERAGE_REQUIRED_COLS } from "../utils/brokerage";
import { loadFileContent } from "../utils/common";
import Dividends from "../pages/Dividends";
import Credit from "../pages/Credit";
import Brokerage from "../pages/Brokerage";
import { FilesContext } from "../utils/common";

export default function DragAndDrop() {
  const [context, setContext] = useState([]);

  function handleChange(event) {
    const list = Array.from(event.target.files); // FileList to Array

    if (list.length === 0) {
      return;
    }

    const promises = list.map((file) => loadFileContent(file).then((txt) => {
      let type = null;
      if (isMatchingFile(txt, BROKERAGE_REQUIRED_COLS)) {
        type = "brokerage";
      } else if (isMatchingFile(txt, CREDIT_REQUIRED_COLS)) {
        type = "credit";
      } else if (isMatchingFile(txt, DIVIDEND_REQUIRED_COLS)) {
        type = "dividend";
      }

      return { txt, type, }
    }))

    Promise.all(promises).then(setContext);
  }

  if (Object.keys(context).length) {
    // TODO: set multiples contexts? one for each file or just put this in a single big context?
    // TODO: set the context on layout and navigate through it
    return (
      <FilesContext.Provider value={context}>
        {/* <Dividends /> */}
        <Credit />
      </FilesContext.Provider>
    );
  }


  return (
    <Target>
      <div className="relative z-0 w-full h-screen flex justify-center items-center">
        <input
          type="file"
          multiple
          onChange={handleChange}
          accept="text/csv"
          className="absolute inset-0 flex justify-center items-center z-10 w-full opacity-0 cursor-pointer"
        />
        <div className="text-5xl">Drag and Drop CSV</div>
      </div>
    </Target>
  );
}

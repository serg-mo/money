import React, { useState } from "react";
import Target from "./Target";
import { isMatchingFile } from "../utils/common";
import { REQUIRED_COLS as CREDIT_REQUIRED_COLS, HEADER_ROW_INDEX as CREDIT_HEADER_ROW_INDEX } from "../utils/credit";
import { REQUIRED_COLS as DIVIDEND_REQUIRED_COLS, HEADER_ROW_INDEX as DIVIDEND_HEADER_ROW_INDEX } from "../utils/dividends";
import { REQUIRED_COLS as BROKERAGE_REQUIRED_COLS, HEADER_ROW_INDEX as BROKERAGE_HEADER_ROW_INDEX } from "../utils/brokerage";
import { loadFileContent } from "../utils/common";
import Dividends from "../pages/Dividends";
import Credit from "../pages/Credit";
import Brokerage from "../pages/Brokerage";
import { FilesContext, FILE_TYPES } from "../utils/common";

export default function DragAndDrop() {
  const [context, setContext] = useState([]);

  async function handleChange(event) {
    const list = Array.from(event.target.files); // FileList to Array

    if (list.length === 0) {
      return;
    }

    // TODO: dedicated function in utils/common.js
    const promises = list.map((file) => loadFileContent(file).then((txt) => {
      let type = null;
      if (isMatchingFile(txt, BROKERAGE_REQUIRED_COLS, BROKERAGE_HEADER_ROW_INDEX)) {
        type = FILE_TYPES.brokerage;
      } else if (isMatchingFile(txt, CREDIT_REQUIRED_COLS, CREDIT_HEADER_ROW_INDEX)) {
        type = FILE_TYPES.credit;
      } else if (isMatchingFile(txt, DIVIDEND_REQUIRED_COLS, DIVIDEND_HEADER_ROW_INDEX)) {
        type = FILE_TYPES.dividend;
      }

      return { txt, type, }
    }))

    Promise.all(promises).then(setContext);
  }

  if (Object.keys(context).length) {
    // TODO: set multiples contexts? one for each file or just put this in a single big context?
    // TODO: set the context on layout and navigate through it
    // TODO: include them all and have each only render itself after matching against a type
    return (
      <FilesContext.Provider value={context}>
        <Dividends />
        <Credit />
        <Brokerage />
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

import React, { useState } from 'react';
import {
  HEADER_ROW_INDEX as BROKERAGE_HEADER_ROW_INDEX,
  REQUIRED_COLS as BROKERAGE_REQUIRED_COLS,
  getFileName,
} from '../utils/brokerage';
import {
  FILE_TYPES,
  FilesContext,
  isMatchingFile,
  loadFileContent,
} from '../utils/common';
import {
  HEADER_ROW_INDEX as CREDIT_HEADER_ROW_INDEX,
  REQUIRED_COLS as CREDIT_REQUIRED_COLS,
} from '../utils/credit';
import {
  HEADER_ROW_INDEX as DIVIDEND_HEADER_ROW_INDEX,
  REQUIRED_COLS as DIVIDEND_REQUIRED_COLS,
} from '../utils/dividends';
import Target from './Target';

export default function DragAndDrop({ children }) {
  const [context, setContext] = useState([]);

  async function handleChange(event) {
    const list = Array.from(event.target.files); // FileList to Array

    if (list.length === 0) {
      return;
    }

    // TODO: dedicated function in utils/common.js
    const promises = list.map((file) =>
      loadFileContent(file).then((txt) => {
        let type = null;
        let name = null;

        if (
          isMatchingFile(
            txt,
            BROKERAGE_REQUIRED_COLS,
            BROKERAGE_HEADER_ROW_INDEX
          )
        ) {
          type = FILE_TYPES.brokerage;
          name = getFileName(txt);
        } else if (
          isMatchingFile(txt, CREDIT_REQUIRED_COLS, CREDIT_HEADER_ROW_INDEX)
        ) {
          type = FILE_TYPES.credit;
          name = 'Credit';
        } else if (
          isMatchingFile(txt, DIVIDEND_REQUIRED_COLS, DIVIDEND_HEADER_ROW_INDEX)
        ) {
          type = FILE_TYPES.dividend;
          name = 'Dividends';
        }

        return { txt, type, name };
      })
    );

    Promise.all(promises).then(setContext);
  }

  if (Object.keys(context).length) {
    return (
      <FilesContext.Provider value={context}>{children}</FilesContext.Provider>
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

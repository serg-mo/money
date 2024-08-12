import React, { useContext, useState } from 'react';
import Brokerage from '../pages/Brokerage';
import Credit from '../pages/Credit';
import { FILE_TYPES, FilesContext } from '../utils/common';

// TODO: this belongs in the layout
export default function FilesMenu() {
  const files = useContext(FilesContext);
  const [fileIndex, setFileIndex] = useState(
    files.length === 1 ? 0 : undefined
  );

  // one button per file, so I can upload multiple brokerage files
  const pages = files.map(({ type, txt }, index) => {
    // brokerage and checking are the same type, key is important
    if (type === FILE_TYPES.credit) {
      return () => <Credit txt={txt} key={index} />;
    } else if (type === FILE_TYPES.brokerage) {
      return () => <Brokerage txt={txt} key={index} />;
    }
  });

  return (
    <>
      <div className="flex justify-center items-center">
        {files.length > 1 &&
          files.map(({ name }, index) => (
            <button
              key={index}
              onClick={() => setFileIndex(index)}
              className={`m-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none ${fileIndex === index ? 'bg-blue-800' : ''}`}
            >
              {name}
            </button>
          ))}
      </div>
      {pages.length > 0 && fileIndex !== undefined && pages[fileIndex]()}
    </>
  );
}

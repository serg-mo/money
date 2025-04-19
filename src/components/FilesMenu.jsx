import React, { useContext, useState } from 'react';
import Brokerage from '../pages/Brokerage';
import Credit from '../pages/Credit';
import { FilesContext } from '../utils/common';

// TODO: this belongs in the layout
export default function FilesMenu() {
  const files = useContext(FilesContext);
  const [fileIndex, setFileIndex] = useState(
    files.length === 1 ? 0 : undefined
  );

  // one button per file, so I can upload multiple brokerage files
  const pages = files.map(({ type, txt }, index) => {
    // brokerage and checking are the same type, key is important
    if (type === 'credit') {
      return () => <Credit txt={txt} key={index} />;
    } else if (type === 'brokerage') {
      return () => <Brokerage txt={txt} key={index} />;
    }
  });

  return pages.length > 0 && fileIndex !== undefined && pages[fileIndex]()
}

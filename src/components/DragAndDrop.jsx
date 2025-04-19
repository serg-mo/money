import React, { useState } from 'react';
import { loadFileContent } from '../utils/common';
import Target from './Target';

export default function DragAndDrop({ children }) {
  const [context, setContext] = useState([]); // txt of each file

  async function handleChange(event) {
    const list = Array.from(event.target.files); // FileList to Array

    if (list.length === 0) {
      return;
    }

    Promise.all(list.map(loadFileContent)).then(setContext);
  }

  if (Object.keys(context).length) {
    return children(context);
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

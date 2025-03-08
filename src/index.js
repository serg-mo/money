import React from 'react';
import { createRoot } from 'react-dom/client';
import DragAndDrop from './components/DragAndDrop';
import FilesMenu from './components/FilesMenu';

import '../styles/tailwind.css';

// NOTE: Github pages do not support BrowserRouter, hence HashRouter
export default function App() {
  return (
    <div className="flex flex-col justify-center items-center">
      <DragAndDrop>
        <FilesMenu />
      </DragAndDrop>
    </div>
  );
}

// https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

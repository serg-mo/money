import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tailwind.css';
import DragAndDrop from './components/DragAndDrop';
import Credit from './pages/Credit';

export default function App() {
  return (
    <div className="flex justify-center items-center">
      <DragAndDrop>{(txts) => <Credit txt={txts[0]} />}</DragAndDrop>
    </div>
  );
}

// https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

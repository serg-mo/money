import React from "react";
import DragAndDrop from "../components/DragAndDrop";
import FilesMenu from "../components/FilesMenu";

export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <DragAndDrop>
        <FilesMenu />
      </DragAndDrop>
    </div>
  );
}

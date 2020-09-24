import React, { useRef } from "react";
import { useMonacoEditor } from "../hooks/useMonacoEditor";

export type ReadonlyEditorProps = { source: string };

const ReadonlyEditor: React.FC<ReadonlyEditorProps> = ({ source }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useMonacoEditor(containerRef, {
    value: source ?? "",
    readOnly: true,
  });
  return <div ref={containerRef} className="w-full h-full" />;
};

export default ReadonlyEditor;

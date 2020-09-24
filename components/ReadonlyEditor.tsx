import React, { useEffect, useRef } from "react";
import { useMonacoEditor } from "../hooks/useMonacoEditor";

export type ReadonlyEditorProps = {
  width: number;
  height: number;
  source: string;
};

const ReadonlyEditor: React.FC<ReadonlyEditorProps> = ({
  width,
  height,
  source,
}) => {
  console.log("ReadonlyEditor is rendering...");
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useMonacoEditor(containerRef, {
    value: source ?? "",
    readOnly: true,
  });
  useEffect(() => {
    editorRef.current?.layout({
      width: Math.floor(width),
      height: Math.floor(height),
    });
  }, [width, height]);
  return <div ref={containerRef} className="w-full h-full" />;
};

export default ReadonlyEditor;

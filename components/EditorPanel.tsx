import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import defaultSpec from "../examples/bar-chart.json";
import FloatingButton from "../components/FloatingButton";
import noop from "../helpers/noop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type EditorPanelProps = { onVisualize?: (spec: string) => void };

const EditorPanel: React.FC<EditorPanelProps> = ({ onVisualize = noop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef(
    new ResizeObserver(() => {
      if (editorRef.current !== null) {
        editorRef.current.layout();
      }
    })
  );
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  useEffect(() => {
    if (containerRef.current !== null) {
      observerRef.current.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current !== null) {
        observerRef.current.unobserve(containerRef.current);
      }
    };
  }, [containerRef.current]);
  useEffect(() => {
    // Create the editor if not exists.
    if (containerRef.current !== null && editorRef.current === null) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: JSON.stringify(defaultSpec, undefined, 2),
        language: "json",
      });
    }
  });
  return (
    <>
      <div ref={containerRef} className="w-full h-full overflow-hidden"></div>
      <FloatingButton
        onClick={() => onVisualize(editorRef.current?.getValue() ?? "")}
      >
        <FontAwesomeIcon className="mr-1" icon="play-circle" fixedWidth />
        Visualize
      </FloatingButton>
    </>
  );
};

export default EditorPanel;

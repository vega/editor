import React, { useRef } from "react";
import defaultSpecObject from "../examples/bar-chart.json";
import FloatingButton from "../components/FloatingButton";
import noop from "../helpers/noop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMonacoEditor } from "../hooks/useMonacoEditor";

const defaultSpec = JSON.stringify(defaultSpecObject, undefined, 2);

export type EditorPanelProps = { onVisualize?: (spec: string) => void };

const EditorPanel: React.FC<EditorPanelProps> = ({ onVisualize = noop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editor = useMonacoEditor(containerRef, {
    value: defaultSpec,
    language: "json",
  });
  return (
    <>
      <div ref={containerRef} className="w-full h-full overflow-hidden"></div>
      <FloatingButton onClick={() => onVisualize(editor?.getValue() ?? "")}>
        <FontAwesomeIcon className="mr-1" icon="play-circle" fixedWidth />
        Visualize
      </FloatingButton>
    </>
  );
};

export default EditorPanel;

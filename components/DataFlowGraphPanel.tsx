import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useResizeObserver } from "../hooks/useResizeObserver";
import { Panel, PanelTitle, PanelContent, EmptyStatus } from "./common";
import GraphvizDisplay from "./GraphvizDisplay";
import ReadonlyEditor from "./ReadonlyEditor";

export type DataFlowGraphPanelProps = {
  source: string | null;
};

const DataFlowGraphPanel: React.FC<DataFlowGraphPanelProps> = ({ source }) => {
  const contentRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [showSource, setShowSource] = useState(false);
  const observer = useResizeObserver((entries) => {
    if (entries.length > 0) {
      const rect = entries[0].contentRect;
      setWidth(rect.width);
      setHeight(rect.height);
    }
  });
  useEffect(() => {
    if (contentRef.current !== null) {
      observer.observe(contentRef.current);
    }
    return () => {
      if (contentRef.current !== null) {
        observer.unobserve(contentRef.current);
      }
    };
  });
  return (
    <Panel className="border-l border-gray-400">
      <PanelTitle>
        Data Flow Graph
        <button
          className={
            "ml-auto px-1 border border-gray-800 rounded text-xs uppercase" +
            (showSource ? " bg-gray-700 text-white" : "")
          }
          onClick={() => setShowSource(!showSource)}
        >
          <FontAwesomeIcon className="mr-1" icon="code" fixedWidth />
          Show dot Source: {showSource ? "On" : "Off"}
        </button>
      </PanelTitle>
      <PanelContent ref={contentRef}>
        {source === null ? (
          <EmptyStatus>
            Click “Analyze” to extract data flow graph and display here
          </EmptyStatus>
        ) : showSource ? (
          <ReadonlyEditor source={source} />
        ) : (
          <GraphvizDisplay width={width} height={height} source={source} />
        )}
      </PanelContent>
    </Panel>
  );
};

export default DataFlowGraphPanel;

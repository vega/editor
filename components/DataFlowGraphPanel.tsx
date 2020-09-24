import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useResizeObserver } from "../hooks/useResizeObserver";
import {
  Panel,
  PanelHeader,
  PanelContent,
  EmptyStatus,
  PanelHeaderButton,
} from "./common";
import FloatingButton from "./FloatingButton";
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
  const [isFullScreen, setIsFullScreen] = useState(false);
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
      <PanelHeader>
        <div className="text-sm uppercase">Data Flow Graph</div>
        <PanelHeaderButton
          className="ml-auto mr-1"
          disabled={source === null}
          onClick={() => setIsFullScreen(!isFullScreen)}
        >
          <FontAwesomeIcon className="mr-1" icon="expand" fixedWidth />
          Fullscreen
        </PanelHeaderButton>
        <PanelHeaderButton
          toggled={showSource}
          onClick={() => setShowSource(!showSource)}
        >
          <FontAwesomeIcon className="mr-1" icon="code" fixedWidth />
          Show dot Source: {showSource ? "On" : "Off"}
        </PanelHeaderButton>
      </PanelHeader>
      <PanelContent fullscreen={isFullScreen} ref={contentRef}>
        {source === null ? (
          <EmptyStatus>
            Click “Analyze” to extract data flow graph and display here
          </EmptyStatus>
        ) : showSource ? (
          <ReadonlyEditor width={width} height={height} source={source} />
        ) : (
          <GraphvizDisplay width={width} height={height} source={source} />
        )}
      </PanelContent>
      {isFullScreen ? (
        <FloatingButton
          className="text-lg"
          onClick={() => setIsFullScreen(false)}
        >
          Exit
        </FloatingButton>
      ) : null}
    </Panel>
  );
};

export default DataFlowGraphPanel;

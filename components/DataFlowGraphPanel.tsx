import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import { useMonacoEditor } from "../hooks/useMonacoEditor";
import { Panel, PanelTitle, PanelContent, EmptyStatus } from "./common";
import GraphvizDisplay from "./GraphvizDisplay";
import ReadonlyEditor from "./ReadonlyEditor";

export type DataFlowGraphPanelProps = {
  source: string | null;
};

const DataFlowGraphPanel: React.FC<DataFlowGraphPanelProps> = ({ source }) => {
  const [showSource, setShowSource] = useState(false);
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
      <PanelContent className="overflow-scroll" padded>
        {source === null ? (
          <EmptyStatus>
            Click “Analyze” to extract data flow graph and display here
          </EmptyStatus>
        ) : showSource ? (
          <ReadonlyEditor source={source} />
        ) : (
          <GraphvizDisplay source={source} />
        )}
      </PanelContent>
    </Panel>
  );
};

export default DataFlowGraphPanel;

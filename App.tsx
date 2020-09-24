import React, { useState } from "react";
import { View } from "vega-typings";
import GraphvizDisplay from "./components/GraphvizDisplay";
import { exportScene } from "./helpers/scenegraph";
import { view2dot } from "./helpers/vega2dot";
import { VegaWrapper } from "./components/VegaWrapper";
import { SceneGraphInsepector } from "./components/SceneGraphInsepector";
import styled from "styled-components";
import EditorPanel from "./components/EditorPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import defaultSpec from "./examples/bar-chart.json";
import FloatingButton from "./components/FloatingButton";
import brandImage from "./images/favicon.png";

const AppHeader = styled.nav.attrs({ className: "bg-gray-900" })`
  grid-column: 1 / span 2;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  color: white;
`;

const AppFooter = styled.footer.attrs({ className: "bg-gray-900" })`
  grid-column: 1 / span 2;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
`;

const PanelContent = styled.main<{ padded?: boolean }>`
  padding: ${({ padded = false }): string => (padded ? "0.5rem" : "0")};
  height: calc(100% - 24px);
`;

const PanelTitle = styled.header.attrs({
  className: "font-bold text-sm bg-gray-300 text-gray-700",
})`
  width: 100%;
  height: 24px;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyStatus = styled.div.attrs({
  className: "w-full h-full text-gray-500",
})`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AppLayout = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: 3rem minmax(0, 1fr) minmax(0, 1fr) 1.5rem;
`;

const App: React.FC = () => {
  const [view, setView] = useState<View | null>(null);
  const [sceneGraph, setSceneGraph] = useState<object | null>(null);
  const [dataFlow, setDataFlow] = useState<string | null>(null);
  const [spec, setSpec] = useState(JSON.stringify(defaultSpec, undefined, 2));
  // Reference: https://sung.codes/blog/2018/09/29/resetting-error-boundary-error-state/
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  const updateDisplay = (): void => {
    if (view !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internalSceneGraph = (view as any)["_scenegraph"];
      setDataFlow(view2dot(view));
      setSceneGraph(exportScene(internalSceneGraph.root));
    }
  };

  return (
    <AppLayout>
      <AppHeader>
        <img className="mr-2 h-6 w-6" src={brandImage} alt="Vega Inspector" />
        <span className="text-xl font-bold">Vega Inspector</span>
      </AppHeader>
      <Panel>
        <PanelTitle>Source Code</PanelTitle>
        <PanelContent className="relative">
          <EditorPanel
            onVisualize={(source) => {
              setSpec(source);
              setErrorBoundaryKey(errorBoundaryKey + 1);
            }}
          />
        </PanelContent>
      </Panel>
      <Panel className="relative border-l border-gray-400">
        <PanelTitle>Visualization</PanelTitle>
        <PanelContent className="flex justify-center items-center bg-gray-200 overflow-auto">
          <ErrorBoundary key={errorBoundaryKey}>
            <VegaWrapper
              spec={spec}
              onNewView={(view): void => {
                console.log("A new view was created");
                setView(view);
              }}
            />
          </ErrorBoundary>
        </PanelContent>
        <FloatingButton onClick={updateDisplay}>Analyze</FloatingButton>
      </Panel>
      <Panel>
        <PanelTitle>Scene Graph</PanelTitle>
        <PanelContent padded>
          {sceneGraph === null ? (
            <EmptyStatus>
              Click “Analyze” to extract scene graph and display here
            </EmptyStatus>
          ) : (
            <SceneGraphInsepector sceneGraph={sceneGraph} expandLevel={2} />
          )}
        </PanelContent>
      </Panel>
      <Panel className="border-l border-gray-400">
        <PanelTitle>Data Flow Graph</PanelTitle>
        <PanelContent className="overflow-scroll" padded>
          {dataFlow === null ? (
            <EmptyStatus>
              Click “Analyze” to extract data flow graph and display here
            </EmptyStatus>
          ) : (
            <GraphvizDisplay source={dataFlow} />
          )}
        </PanelContent>
      </Panel>
      <AppFooter />
    </AppLayout>
  );
};

export default App;

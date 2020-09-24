import React, { useState } from "react";
import { View } from "vega-typings";
import GraphvizDisplay from "./components/GraphvizDisplay";
import { exportScene } from "./helpers/scenegraph";
import { view2dot } from "./helpers/vega2dot";
import { VegaWrapper } from "./components/VegaWrapper";
import { SceneGraphInsepector } from "./components/SceneGraphInsepector";
import styled from "styled-components";

const appNavHeight = 50;

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

const AppHeader = styled.nav`
  height: ${appNavHeight}px;
  background: #2b2b2b;
  width: 100%;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  color: white;
  box-sizing: border-box;
`;

const AppContent = styled.main`
  width: 100%;
  height: calc(100vh - ${appNavHeight}px - 24px);
  display: flex;
  flex-direction: row;
`;

const AppFooter = styled.footer`
  width: 100%;
  background: #2b2b2b;
  height: 24px;
`;

const Panel = styled.div`
  height: 50%;
  display: flex;
  flex-direction: column;
`;

const PanelContent = styled.main<{ padded?: boolean }>`
  box-sizing: border-box;
  padding: ${({ padded = false }): string => (padded ? "0.5rem" : "0")};
  height: calc(100% - 24px);
  overflow-y: scroll;
`;

const PanelTitle = styled.header`
  width: 100%;
  height: 24px;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Vertical = styled.div`
  display: flex;
  flex-direction: column;
`;

const AppContentLeft = styled(Vertical)`
  width: 50%;
`;

const AppContentRight = styled(AppContentLeft)`
  border-left: 2px solid rgba(0, 0, 0, 0.1);
`;

const EmptyStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #bdbdbd;
`;

const Button = styled.button`
  display: inline-block;
  border: none;
  padding: 0.5rem 0.5rem;
  margin: 0;
  text-decoration: none;
  background: #2f80ed;
  color: #ffffff;
  font-family: sans-serif;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  transition: background 250ms ease-in-out, transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [view, setView] = useState<View | null>(null);
  const [sceneGraph, setSceneGraph] = useState<object | null>(null);
  const [dataFlow, setDataFlow] = useState<string | null>(null);

  const updateDisplay = (): void => {
    if (view !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internalSceneGraph = (view as any)["_scenegraph"];
      setDataFlow(view2dot(view));
      setSceneGraph(exportScene(internalSceneGraph.root));
    }
  };

  return (
    <AppContainer>
      <AppHeader>
        <span className="text-xl font-bold">Vega Inspector</span>
        <Button style={{ width: "100px" }} onClick={updateDisplay}>
          Visualize
        </Button>
      </AppHeader>
      <AppContent>
        <AppContentLeft>
          <Panel>
            <PanelTitle>Scene Graph Inspector</PanelTitle>
            <PanelContent padded>
              {sceneGraph === null ? (
                <EmptyStatus>
                  Click Visualize to intercept scene graph here
                </EmptyStatus>
              ) : (
                <SceneGraphInsepector sceneGraph={sceneGraph} expandLevel={2} />
              )}
            </PanelContent>
          </Panel>
          <Panel>
            <PanelTitle>Data Flow Viewer</PanelTitle>
            <PanelContent padded>
              {dataFlow === null ? (
                <EmptyStatus>
                  Click Visualize to intercept data flow graph here
                </EmptyStatus>
              ) : (
                <GraphvizDisplay source={dataFlow} />
              )}
            </PanelContent>
          </Panel>
        </AppContentLeft>
        <AppContentRight>
          <PanelTitle>Renderer Output</PanelTitle>
          <PanelContent>
            <VegaWrapper
              onNewView={(view): void => {
                console.log("A new view was created");
                setView(view);
              }}
            />
          </PanelContent>
        </AppContentRight>
      </AppContent>
      <AppFooter />
    </AppContainer>
  );
};

export default App;

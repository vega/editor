import * as React from 'react';
import {useCallback, useEffect, useMemo} from 'react';
import {LAYOUT, Mode, SIDEPANE} from '../../constants/index.js';
import {useAppContext} from '../../context/app-context.js';
import ConfigEditor from '../config-editor/index.js';
import CompiledSpecDisplay from './compiled-spec-display/index.js';
import CompiledSpecHeader from './compiled-spec-header/index.js';
import './index.css';
import '../split.css';
import SpecEditor from './spec-editor/index.js';
import SpecEditorHeader from './spec-editor-header/index.js';
import Split from 'react-split';

const InputPanel: React.FC = () => {
  const {state, setState} = useAppContext();

  const {compiledVegaPaneSize, compiledVegaSpec, mode, sidePaneItem} = state;

  const handleChange = useCallback(
    (sizes: number[]) => {
      const size = (sizes[1] / 100) * window.innerHeight;
      const tolerance = 5;
      const shouldBeOpen = size > LAYOUT.MinPaneSize + tolerance;

      setState((s) => {
        const newState = {...s, compiledVegaPaneSize: size};

        if (shouldBeOpen !== !!s.compiledVegaSpec) {
          newState.compiledVegaSpec = !s.compiledVegaSpec;
        }

        return newState;
      });
    },
    [setState],
  );

  useEffect(() => {
    if (mode === Mode.VegaLite && compiledVegaPaneSize === LAYOUT.MinPaneSize) {
      setState((s) => ({...s, compiledVegaPaneSize: (window.innerHeight - LAYOUT.HeaderHeight) * 0.3}));
    }
  }, [mode, compiledVegaPaneSize, setState]);

  const editorPane = useMemo(
    () => (
      <div className="full-height-wrapper">
        <SpecEditorHeader />
        <div
          style={{
            height: 'calc(100% - 30px)',
            display: sidePaneItem === SIDEPANE.Editor ? '' : 'none',
          }}
        >
          <SpecEditor />
        </div>
        <div
          style={{
            height: 'calc(100% - 30px)',
            display: sidePaneItem === SIDEPANE.Config ? '' : 'none',
          }}
        >
          <ConfigEditor />
        </div>
      </div>
    ),
    [sidePaneItem],
  );

  const compiledPane = useMemo(
    () => <div className="compiled-pane">{compiledVegaSpec ? <CompiledSpecDisplay /> : <CompiledSpecHeader />}</div>,
    [compiledVegaSpec],
  );

  const getInitialSizes = useCallback(() => {
    const compiledPaneSize = compiledVegaSpec
      ? Math.max(compiledVegaPaneSize || (window.innerHeight - LAYOUT.HeaderHeight) * 0.3, LAYOUT.MinPaneSize)
      : LAYOUT.MinPaneSize;

    const totalHeight = window.innerHeight;
    const compiledPanePercentage = (compiledPaneSize / totalHeight) * 100;

    const minPercentage = (LAYOUT.MinPaneSize / totalHeight) * 100;
    const finalCompiledPercentage = Math.max(compiledPanePercentage, minPercentage);
    const finalEditorPercentage = 100 - finalCompiledPercentage;

    return [finalEditorPercentage, finalCompiledPercentage];
  }, [compiledVegaSpec, compiledVegaPaneSize]);

  if (mode === Mode.Vega) {
    return (
      <div role="group" aria-label="spec editors" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        {editorPane}
      </div>
    );
  }

  return (
    <div role="group" aria-label="spec editors" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Split
        sizes={getInitialSizes()}
        minSize={LAYOUT.MinPaneSize}
        expandToMin={false}
        gutterSize={3}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="vertical"
        cursor="row-resize"
        className="editor-splitPane"
        onDrag={handleChange}
      >
        {editorPane}
        {compiledPane}
      </Split>
    </div>
  );
};

export default InputPanel;

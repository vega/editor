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
      const size = sizes[1] * window.innerHeight;
      setState((s) => ({...s, compiledVegaPaneSize: size}));
      if ((size > LAYOUT.MinPaneSize && !compiledVegaSpec) || (size === LAYOUT.MinPaneSize && compiledVegaSpec)) {
        setState((s) => ({...s, compiledVegaSpec: !s.compiledVegaSpec}));
      }
    },
    [setState, compiledVegaSpec],
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
    () => (
      <div style={{position: 'relative', zIndex: 0}}>
        {compiledVegaSpec ? <CompiledSpecDisplay /> : <CompiledSpecHeader />}
      </div>
    ),
    [compiledVegaSpec],
  );

  const initialSizes = useMemo(() => {
    return compiledVegaSpec ? [70, 30] : [100, 0];
  }, [compiledVegaSpec]);

  const handleDragEnd = useCallback(() => {
    if (compiledVegaPaneSize === LAYOUT.MinPaneSize) {
      setState((s) => ({...s, compiledVegaPaneSize: (window.innerHeight - LAYOUT.HeaderHeight) * 0.5}));
    }
  }, [compiledVegaPaneSize, setState]);

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
        key={compiledVegaSpec ? 'split-mode' : 'single-mode'}
        sizes={compiledVegaSpec ? [70, 30] : [100, 0]}
        minSize={LAYOUT.MinPaneSize}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="vertical"
        cursor="row-resize"
        className="editor-splitPane"
        onDrag={handleChange}
        onDragEnd={handleDragEnd}
      >
        {editorPane}
        {compiledPane}
      </Split>
    </div>
  );
};

export default InputPanel;

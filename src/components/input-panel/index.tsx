import * as React from 'react';
import {useCallback, useEffect, useMemo} from 'react';
import {LAYOUT, Mode, SIDEPANE} from '../../constants/index.js';
import {useAppSelector, useAppDispatch} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import ConfigEditor from '../config-editor/index.js';
import CompiledSpecDisplay from './compiled-spec-display/index.js';
import CompiledSpecHeader from './compiled-spec-header/index.js';
import './index.css';
import '../split.css';
import SpecEditor from './spec-editor/index.js';
import SpecEditorHeader from './spec-editor-header/index.js';
import Split from 'react-split';

const InputPanel: React.FC = () => {
  const dispatch = useAppDispatch();

  const {compiledVegaPaneSize, compiledVegaSpec, mode, sidePaneItem} = useAppSelector((state) => ({
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
  }));

  const handleChange = useCallback(
    (sizes: number[]) => {
      const size = sizes[1] * window.innerHeight;
      dispatch(EditorActions.setCompiledVegaPaneSize(size));
      if ((size > LAYOUT.MinPaneSize && !compiledVegaSpec) || (size === LAYOUT.MinPaneSize && compiledVegaSpec)) {
        dispatch(EditorActions.toggleCompiledVegaSpec());
      }
    },
    [dispatch, compiledVegaSpec],
  );

  useEffect(() => {
    if (mode === Mode.VegaLite) {
      if (compiledVegaPaneSize === LAYOUT.MinPaneSize) {
        dispatch(EditorActions.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.3));
      }
    }
  }, [mode, compiledVegaPaneSize, dispatch]);

  const getInnerPanes = useCallback(() => {
    return [
      <div key="editor" className="full-height-wrapper">
        <SpecEditorHeader key="specEditorHeader" />
        <div
          style={{
            height: 'calc(100% - 30px)',
            display: sidePaneItem === SIDEPANE.Editor ? '' : 'none',
          }}
        >
          <SpecEditor key="editor" />
        </div>
        <div
          style={{
            height: 'calc(100% - 30px)',
            display: sidePaneItem === SIDEPANE.Config ? '' : 'none',
          }}
        >
          <ConfigEditor key="configEditor" />
        </div>
      </div>,
      compiledVegaSpec ? <CompiledSpecDisplay key="compiled" /> : <CompiledSpecHeader key="compiledSpecHeader" />,
    ];
  }, [sidePaneItem, compiledVegaSpec]);

  const innerPanes = useMemo(() => getInnerPanes(), [getInnerPanes]);

  const initialSizes = useMemo(() => {
    return compiledVegaSpec ? [70, 30] : [100, 0];
  }, [compiledVegaSpec]);

  const handleDragEnd = useCallback(() => {
    if (compiledVegaPaneSize === LAYOUT.MinPaneSize) {
      dispatch(EditorActions.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.5));
    }
  }, [compiledVegaPaneSize, dispatch]);

  return (
    <div role="group" aria-label="spec editors" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Split
        sizes={initialSizes}
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
        {innerPanes[0]}
        {innerPanes[1]}
      </Split>
    </div>
  );
};

export default InputPanel;

import * as React from 'react';
import {useCallback, useEffect, useMemo} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor.js';
import {LAYOUT, Mode, SIDEPANE} from '../../constants/index.js';
import {State} from '../../constants/default-state.js';
import ConfigEditor from '../config-editor/index.js';
import CompiledSpecDisplay from './compiled-spec-display/index.js';
import CompiledSpecHeader from './compiled-spec-header/index.js';
import './index.css';
import '../split.css';
import SpecEditor from './spec-editor/index.js';
import SpecEditorHeader from './spec-editor-header/index.js';
import Split from 'react-split';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const InputPanel: React.FC<Props> = (props) => {
  const handleChange = useCallback(
    (sizes: number[]) => {
      const size = sizes[1] * window.innerHeight;
      props.setCompiledVegaPaneSize(size);
      if (
        (size > LAYOUT.MinPaneSize && !props.compiledVegaSpec) ||
        (size === LAYOUT.MinPaneSize && props.compiledVegaSpec)
      ) {
        props.toggleCompiledVegaSpec();
      }
    },
    [props.setCompiledVegaPaneSize, props.compiledVegaSpec, props.toggleCompiledVegaSpec],
  );

  useEffect(() => {
    if (props.mode === Mode.VegaLite) {
      if (props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
        props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.3);
      }
    }
  }, [props.mode, props.compiledVegaPaneSize, props.setCompiledVegaPaneSize]);

  const getInnerPanes = useCallback(() => {
    return [
      <div key="editor" className="full-height-wrapper">
        <SpecEditorHeader key="specEditorHeader" />
        <div
          style={{
            height: 'calc(100% - 30px)',
            display: props.sidePaneItem === SIDEPANE.Editor ? '' : 'none',
          }}
        >
          <SpecEditor key="editor" />
        </div>
        <div
          style={{
            height: 'calc(100% - 30px)',
            display: props.sidePaneItem === SIDEPANE.Config ? '' : 'none',
          }}
        >
          <ConfigEditor key="configEditor" />
        </div>
      </div>,
      props.compiledVegaSpec ? <CompiledSpecDisplay key="compiled" /> : <CompiledSpecHeader key="compiledSpecHeader" />,
    ];
  }, [props.sidePaneItem, props.compiledVegaSpec]);

  const innerPanes = useMemo(() => getInnerPanes(), [getInnerPanes]);

  const initialSizes = useMemo(() => {
    return props.compiledVegaSpec ? [70, 30] : [100, 0];
  }, [props.compiledVegaSpec]);

  const handleDragEnd = useCallback(() => {
    if (props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
      props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.5);
    }
  }, [props.compiledVegaPaneSize, props.setCompiledVegaPaneSize]);

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

function mapStateToProps(state: State) {
  return {
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setCompiledVegaPaneSize: EditorActions.setCompiledVegaPaneSize,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(InputPanel);

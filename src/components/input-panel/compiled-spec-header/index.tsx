import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {connect, useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor.js';
import {COMPILEDPANE} from '../../../constants/index.js';
import {State} from '../../../constants/default-state.js';

const toggleStyle = {
  cursor: 'pointer',
} as const;

function CompiledSpecDisplayHeader() {
  const props = useSelector((state: State) => mapStateToProps(state));
  const dispatch = useDispatch();
  const dispatchProps = mapDispatchToProps(dispatch);
  const navigate = useNavigate();

  const editVegaSpec = () => {
    if (window.location.pathname.indexOf('/edited') === -1) {
      navigate('/edited');
    }
    dispatchProps.clearConfig();
    if (props.compiledPaneItem == COMPILEDPANE.Vega) {
      dispatchProps.updateVegaSpec(stringify(props.value));
    } else {
      dispatchProps.updateVegaLiteSpec(stringify(props.value));
    }
  };

  if (props.compiledVegaSpec) {
    const toggleStyleUp = {...toggleStyle, position: 'static'} as const;
    return (
      <div className="editor-header" style={toggleStyleUp} onClick={dispatchProps.toggleCompiledVegaSpec}>
        <ul className="tabs-nav">
          <li
            className={props.compiledPaneItem == COMPILEDPANE.Vega ? 'active-tab' : undefined}
            onClick={(e) => {
              dispatchProps.setCompiledPaneItem(COMPILEDPANE.Vega);
              e.stopPropagation();
            }}
          >
            Compiled Vega
          </li>

          <li
            className={props.compiledPaneItem == COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
            onClick={(e) => {
              dispatchProps.setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
              e.stopPropagation();
            }}
          >
            Extended Vega-Lite Spec
          </li>
        </ul>
        {props.compiledPaneItem === COMPILEDPANE.Vega ? (
          <button onClick={editVegaSpec} style={{cursor: 'pointer'}}>
            Edit Vega Spec
          </button>
        ) : null}
        {props.compiledPaneItem === COMPILEDPANE.NormalizedVegaLite ? (
          <button onClick={editVegaSpec} style={{cursor: 'pointer'}}>
            Edit Extended Vega-Lite Spec
          </button>
        ) : null}
        <ChevronDown />
      </div>
    );
  } else {
    return (
      <div onClick={dispatchProps.toggleCompiledVegaSpec} className="editor-header" style={toggleStyle}>
        <ul className="tabs-nav">
          <li
            className={props.compiledPaneItem == COMPILEDPANE.Vega ? 'active-tab' : undefined}
            onClick={() => {
              dispatchProps.setCompiledPaneItem(COMPILEDPANE.Vega);
            }}
          >
            Compiled Vega
          </li>
          <li
            className={props.compiledPaneItem == COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
            onClick={() => {
              dispatchProps.setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
            }}
          >
            Extended Vega-Lite Spec
          </li>
        </ul>
        <ChevronUp />
      </div>
    );
  }
}

function mapStateToProps(state: State) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    value: state.compiledPaneItem == COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
    compiledPaneItem: state.compiledPaneItem,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      setCompiledPaneItem: EditorActions.setCompiledPaneItem,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplayHeader);
